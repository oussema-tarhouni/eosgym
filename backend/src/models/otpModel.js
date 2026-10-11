const pool = require("../config/database");

async function createOtp(userId, phone, codeHash, expiresAt) {
  const [result] = await pool.execute(
    "INSERT INTO otp_codes (user_id, phone, code_hash, expires_at) VALUES (?, ?, ?, ?)",
    [userId, phone, codeHash, expiresAt]
  );
  return result.insertId;
}

async function findValidOtp(phone, codeHash) {
  const [rows] = await pool.execute(
    "SELECT * FROM otp_codes WHERE phone = ? AND code_hash = ? AND expires_at > NOW() AND used_at IS NULL",
    [phone, codeHash]
  );
  return rows[0] || null;
}

async function incrementAttempts(id) {
  await pool.execute("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [id]);
}

async function markUsed(id) {
  await pool.execute("UPDATE otp_codes SET used_at = NOW() WHERE id = ?", [id]);
}

async function invalidateAllForPhone(phone) {
  await pool.execute("UPDATE otp_codes SET used_at = NOW() WHERE phone = ? AND used_at IS NULL", [phone]);
}

module.exports = { createOtp, findValidOtp, incrementAttempts, markUsed, invalidateAllForPhone };
