const pool = require("../config/database");

async function createToken(userId, type, tokenHash, expiresAt) {
  const [result] = await pool.execute(
    "INSERT INTO tokens (user_id, type, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    [userId, type, tokenHash, expiresAt]
  );
  return result.insertId;
}

async function findValidToken(tokenHash, type) {
  const [rows] = await pool.execute(
    "SELECT * FROM tokens WHERE token_hash = ? AND type = ? AND expires_at > NOW() AND used_at IS NULL",
    [tokenHash, type]
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.execute("UPDATE tokens SET used_at = NOW() WHERE id = ?", [id]);
}

module.exports = { createToken, findValidToken, markUsed };
