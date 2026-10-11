// WhatsApp/SMS OTP delivery. Plug a real provider (Twilio, Meta Cloud API...)
// behind WHATSAPP_API_URL/WHATSAPP_API_TOKEN; falls back to console logging.

async function sendOtpCode(phone, code) {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!url || !token) {
    console.warn(`[sms] WHATSAPP_API_URL/TOKEN absents, code non envoyé -> ${phone}: ${code}`);
    return;
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: phone, template: "otp_code", params: { code } }),
  });
}

module.exports = { sendOtpCode };
