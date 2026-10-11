// Run from backend/: node test-mail.js
require('dotenv').config();
const u = process.env.EMAIL_USER || process.env.SMTP_USER, p = process.env.EMAIL_PASS || process.env.SMTP_PASS;
console.log('user:', u, '| pass length:', p ? p.length : 'MISSING (must be 16)');
require('nodemailer').createTransport({ service: 'gmail', auth: { user: u, pass: p } })
  .verify().then(() => console.log('OK: Gmail login works'), e => console.log('FAIL:', e.message));
