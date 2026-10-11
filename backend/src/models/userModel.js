const pool = require("../config/database");

async function createUser(name, email, phone, passwordHash, avatar) {
  const sql = "INSERT INTO users (name, email, phone, password_hash, avatar) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.execute(sql, [name, email, phone, passwordHash, avatar || null]);
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findByPhone(phone) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE phone = ?", [phone]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, phone, avatar, password_hash, role, level, status, preferred_category, created_at, email_verified_at, phone_verified_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function updateProfile(id, { name, email, avatar }) {
  const fields = [];
  const values = [];
  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (email !== undefined) { fields.push("email = ?", "email_verified_at = NULL"); values.push(email); }
  if (avatar !== undefined) { fields.push("avatar = ?"); values.push(avatar); }
  if (fields.length === 0) return;
  values.push(id);
  await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function updatePassword(id, passwordHash) {
  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

async function setEmailVerified(id) {
  await pool.execute("UPDATE users SET email_verified_at = NOW() WHERE id = ?", [id]);
}

async function setPhoneVerified(id) {
  await pool.execute("UPDATE users SET phone_verified_at = NOW() WHERE id = ?", [id]);
}

module.exports = { createUser, findByEmail, findByPhone, findById, updateProfile, updatePassword, setEmailVerified, setPhoneVerified };
