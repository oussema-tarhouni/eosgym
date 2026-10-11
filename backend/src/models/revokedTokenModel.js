const pool = require("../config/database");

async function add(jti, expiresAt) {
  await pool.execute("INSERT IGNORE INTO revoked_access_tokens (jti, expires_at) VALUES (?, ?)", [jti, expiresAt]);
  await cleanupExpired();
}

async function isRevoked(jti) {
  const [rows] = await pool.execute("SELECT 1 FROM revoked_access_tokens WHERE jti = ?", [jti]);
  return rows.length > 0;
}

async function cleanupExpired() {
  await pool.execute("DELETE FROM revoked_access_tokens WHERE expires_at < NOW()");
}

module.exports = { add, isRevoked };
