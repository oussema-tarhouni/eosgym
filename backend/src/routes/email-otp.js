// Email OTP router — Express + Nodemailer (free). Mount: app.use('/api/auth', require('./email-otp'));
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const router = express.Router();

// ADAPT THESE 2 to your project:
const { authenticate: requireAuth } = require('../middleware/auth');
const User = require('../models/userModel');
const markEmailVerified = (id) => User.setEmailVerified(id);
const uid = (req) => req.userId ?? req.user?.id;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: (process.env.SMTP_USER || process.env.EMAIL_USER), pass: (process.env.SMTP_PASS || process.env.EMAIL_PASS) },
});

const OTP_TTL = 10 * 60 * 1000, RESEND_WAIT = 60 * 1000, MAX_TRIES = 5;
const store = new Map(); // userId -> { hash, expires, tries, sentAt }  (use Redis/DB if you run several servers)
const hash = (code) => crypto.createHmac('sha256', process.env.OTP_SECRET || 'change-me').update(code).digest('hex');

// Email design: dark branded header (logo is light, needs dark bg) + clean white card
const otpHtml = (code) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f3f1">
<div style="display:none;max-height:0;overflow:hidden">Your EOS code is ${code}. Expires in 10 minutes.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f1;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#fff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
<tr><td align="center" style="background:#111;padding:28px 24px;border-bottom:4px solid #dbb77e"><img src="cid:eoslogo" width="150" alt="EOS Fitness &amp; Pilates" style="display:block;border:0"></td></tr>
<tr><td style="padding:36px 32px 12px;text-align:center">
<h1 style="margin:0 0 8px;font-size:22px;color:#111">Verify your email</h1>
<p style="margin:0;font-size:15px;color:#555;line-height:1.5">Enter this code to finish setting up your account.</p></td></tr>
<tr><td align="center" style="padding:20px 32px">
<div style="display:inline-block;background:#faf6ee;border:2px dashed #dbb77e;border-radius:12px;padding:16px 28px;font-size:36px;font-weight:700;letter-spacing:10px;color:#111;font-family:'Courier New',monospace">${code}</div></td></tr>
<tr><td style="padding:0 32px 32px;text-align:center"><p style="margin:0;font-size:13px;color:#888;line-height:1.6">Expires in <b style="color:#69a446">10 minutes</b>. Never share this code.<br>Didn't sign up? You can safely ignore this email.</p></td></tr>
<tr><td style="background:#111;padding:16px;text-align:center;font-size:12px;color:#999">&copy; EOS Fitness &amp; Pilates</td></tr>
</table></td></tr></table></body></html>`;

router.post('/send-otp', requireAuth, async (req, res) => {
  const id = uid(req);
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const email = user.email;
  if (!email) return res.status(400).json({ error: 'No email on this account' });
  const prev = store.get(id);
  if (prev && Date.now() - prev.sentAt < RESEND_WAIT)
    return res.status(429).json({ error: 'Please wait a minute before requesting a new code' });

  const code = String(crypto.randomInt(100000, 1000000)); // random 6 digits
  store.set(id, { hash: hash(code), expires: Date.now() + OTP_TTL, tries: 0, sentAt: Date.now() });

  try {
    await transporter.sendMail({
      from: `"EOS Fitness & Pilates" <${(process.env.SMTP_USER || process.env.EMAIL_USER)}>`,
      to: email,
      subject: `${code} is your EOS verification code`,
      text: `Your EOS verification code is ${code}. It expires in 10 minutes.`,
      attachments: [{ filename: 'logo.png', path: path.join(__dirname, 'logo.png'), cid: 'eoslogo' }],
      html: otpHtml(code),
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('OTP mail error', e.message);
    store.delete(id);
    res.status(500).json({ error: 'Could not send the email' });
  }
});

router.post('/verify-otp', requireAuth, async (req, res) => {
  const rec = store.get(uid(req));
  const code = String(req.body.code || '');
  if (!rec || Date.now() > rec.expires) return res.status(400).json({ error: 'Code expired, request a new one' });
  if (rec.tries >= MAX_TRIES) { store.delete(uid(req)); return res.status(429).json({ error: 'Too many attempts, request a new code' }); }
  rec.tries++;
  const ok = crypto.timingSafeEqual(Buffer.from(hash(code)), Buffer.from(rec.hash));
  if (!ok) return res.status(400).json({ error: 'Incorrect code' });
  store.delete(uid(req));
  await markEmailVerified(uid(req));
  res.json({ ok: true });
});

module.exports = router;