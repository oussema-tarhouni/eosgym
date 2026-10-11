// src/services/otpEmailService.js  — free: Nodemailer + Gmail/Brevo SMTP
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const LOGO_PATH = path.join(__dirname, "logo.png"); // keep logo.png next to this file

const { emailLayout } = require("./emailTemplate");
const otpHtml = (code) => emailLayout({
  eyebrow: "Vérification", title: "Verify your email", intro: "Enter this code to finish setting up your account.", code,
  note: "Expires in <b style=\"color:#e6cd85\">10 minutes</b>. Never share this code. Didn't sign up? Ignore this email.",
});

async function sendOtpEmail(email, code) {
  await transporter.sendMail({
    from: `"EOS Fitness & Pilates" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${code} is your EOS verification code`,
    text: `Your EOS verification code is ${code}. It expires in 10 minutes.`,
    html: otpHtml(code),
    attachments: fs.existsSync(LOGO_PATH) ? [{ filename: "logo.png", path: LOGO_PATH, cid: "eoslogo" }] : [],
  });
}
module.exports = { sendOtpEmail };
