const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "logo.png"); // keep logo.png next to this file
const logoBuf = () => (fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null);

let resend = null;
let transporter = null;

function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
}

function buildEmailLink(path, token) {
  return `${process.env.APP_BASE_URL || "http://localhost:4200"}${path}?token=${token}`;
}

async function sendEmail(to, subject, text, html) {
  if (process.env.RESEND_API_KEY) {
    const buf = logoBuf();
    await getResend().emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev", to, subject, text, html,
      ...(buf && { attachments: [{ filename: "logo.png", content: buf.toString("base64"), contentId: "eoslogo" }] }),
    });
    return;
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[email] EMAIL_USER/EMAIL_PASS absents, email non envoyé -> ${to}`);
    return;
  }
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `"EOS Fitness & Pilates" <${process.env.EMAIL_USER}>`, to, subject, text, html,
    attachments: fs.existsSync(LOGO_PATH) ? [{ filename: "logo.png", path: LOGO_PATH, cid: "eoslogo" }] : [],
  });
}


const { emailLayout } = require("./emailTemplate");

async function sendPasswordResetEmail(to, resetToken) {
  const link = buildEmailLink("/reset-password", resetToken);
  const text = `Bonjour,\n\nCliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :\n\n${link}\n\nCe lien est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n`;
  await sendEmail(to, "Réinitialisation de votre mot de passe", text, emailLayout({
    eyebrow: "Sécurité", title: "Réinitialisez votre mot de passe", intro: "Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
    cta: "Réinitialiser", link,
    note: "Lien valable <b style=\"color:#e6cd85\">15 minutes</b>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  }));
}

async function sendVerificationEmail(to, verifyToken) {
  const link = buildEmailLink("/verify-email", verifyToken);
  const text = `Bonjour,\n\nCliquez sur le lien ci-dessous pour vérifier votre adresse email :\n\n${link}\n\nCe lien est valable 24 heures.\n`;
  await sendEmail(to, "Vérification de votre adresse email", text, emailLayout({
    eyebrow: "Bienvenue", title: "Vérifiez votre adresse email", intro: "Bienvenue chez EOS ! Confirmez votre adresse pour activer votre compte.",
    cta: "Vérifier mon email", link,
    note: "Lien valable <b style=\"color:#e6cd85\">24 heures</b>. Si vous n'avez pas créé de compte, ignorez cet email.",
  }));
}

module.exports = { sendEmail, sendPasswordResetEmail, sendVerificationEmail };
