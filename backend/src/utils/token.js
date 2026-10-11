const crypto = require("crypto");

function generateOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateJti() {
  return crypto.randomBytes(16).toString("hex");
}

function generateOtpCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { generateOpaqueToken, generateJti, generateOtpCode, hashToken };
