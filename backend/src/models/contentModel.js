const pool = require("../config/database");

// ---------- POSTERS ----------
async function listPosters() {
  const [rows] = await pool.query("SELECT * FROM posters ORDER BY created_at DESC");
  return rows;
}

async function getPosterById(id) {
  const [[row]] = await pool.query("SELECT * FROM posters WHERE id = ?", [id]);
  return row;
}

async function createPoster({ username, location, text, image_url }) {
  const [result] = await pool.execute(
    "INSERT INTO posters (username, location, text, image_url) VALUES (?, ?, ?, ?)",
    [username, location || null, text, image_url || null]
  );
  return result.insertId;
}

async function updatePoster(id, { username, location, text, image_url }) {
  const fields = [], values = [];
  const map = { username, location, text, image_url };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE posters SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deletePoster(id) {
  const [result] = await pool.execute("DELETE FROM posters WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- NOTIFICATIONS ----------
async function listNotifications() {
  const [rows] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
  return rows;
}

async function getNotificationById(id) {
  const [[row]] = await pool.query("SELECT * FROM announcements WHERE id = ?", [id]);
  return row;
}

async function createNotification({ title, description, image_url, link }) {
  const [result] = await pool.execute(
    "INSERT INTO announcements (title, description, image_url, link) VALUES (?, ?, ?, ?)",
    [title, description || null, image_url || null, link || null]
  );
  return result.insertId;
}

async function updateNotification(id, { title, description, image_url, link }) {
  const fields = [], values = [];
  const map = { title, description, image_url, link };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE announcements SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteNotification(id) {
  const [result] = await pool.execute("DELETE FROM announcements WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listPosters, getPosterById, createPoster, updatePoster, deletePoster,
  listNotifications, getNotificationById, createNotification, updateNotification, deleteNotification,
};
