const pool = require("../config/database");

async function createToken(userId, tokenHash, expiresAt) {
  const [result] = await pool.execute(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt]
  );
  return result.insertId;
}

async function findByHash(tokenHash) {
  const [rows] = await pool.execute("SELECT * FROM refresh_tokens WHERE token_hash = ?", [tokenHash]);
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.execute("UPDATE refresh_tokens SET used_at = NOW() WHERE id = ?", [id]);
}

async function revoke(id) {
  await pool.execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?", [id]);
}

async function revokeAllForUser(userId, exceptId = null) {
  if (exceptId === null) {
    await pool.execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", [userId]);
  } else {
    await pool.execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND id <> ? AND revoked_at IS NULL", [userId, exceptId]);
  }
}

async function cleanupExpired() {
  await pool.execute("DELETE FROM refresh_tokens WHERE expires_at < NOW()");
}

module.exports = { createToken, findByHash, markUsed, revoke, revokeAllForUser, cleanupExpired };
