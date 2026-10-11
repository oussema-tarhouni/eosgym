const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[0-9]{8}$/; // local Tunisian number, +216 prefixed at storage time

const PASSWORD_MIN_LENGTH = 8;
const OTP_LENGTH = 6;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= PASSWORD_MIN_LENGTH;
}

function isValidPhone(phone) {
  return typeof phone === "string" && PHONE_REGEX.test(phone.trim());
}

function isValidOtpCode(code) {
  return typeof code === "string" && new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code.trim());
}

module.exports = { isValidEmail, isValidPassword, isValidPhone, isValidOtpCode, PASSWORD_MIN_LENGTH, OTP_LENGTH };
