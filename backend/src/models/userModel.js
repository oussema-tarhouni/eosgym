const pool = require("../config/database");

const PROFILE_FIELDS = ["gender", "age", "height_cm", "weight_kg", "goals", "experience", "days_per_week"];
const PUBLIC_COLS = "id, name, email, phone, gender, age, height_cm, weight_kg, goals, experience, days_per_week, avatar, password_hash, role, level, status, preferred_category, created_at, email_verified_at";

async function createUser({ name, email, phone, passwordHash, avatar, profile = {} }) {
  const cols = ["name", "email", "phone", "password_hash", "avatar"];
  const vals = [name, email, phone, passwordHash, avatar || null];
  for (const k of PROFILE_FIELDS) if (profile[k] !== undefined) { cols.push(k); vals.push(profile[k]); }
  const [r] = await pool.execute(`INSERT INTO users (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, vals);
  return r.insertId;
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
  const [rows] = await pool.execute(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function updateProfile(id, { name, email, avatar, ...rest }) {
  const fields = [], values = [];
  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (email !== undefined) { fields.push("email = ?", "email_verified_at = NULL"); values.push(email); }
  if (avatar !== undefined) { fields.push("avatar = ?"); values.push(avatar); }
  for (const k of PROFILE_FIELDS) if (rest[k] !== undefined) { fields.push(`${k} = ?`); values.push(rest[k]); }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function updatePassword(id, passwordHash) {
  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

async function setEmailVerified(id) {
  await pool.execute("UPDATE users SET email_verified_at = NOW() WHERE id = ?", [id]);
}

module.exports = { createUser, findByEmail, findByPhone, findById, updateProfile, updatePassword, setEmailVerified, PROFILE_FIELDS };
