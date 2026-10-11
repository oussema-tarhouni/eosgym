const pool = require("../config/database");

async function getAll() {
  const [rows] = await pool.execute("SELECT * FROM trainers ORDER BY name");
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute("SELECT * FROM trainers WHERE id = ?", [id]);
  return rows[0] || null;
}

module.exports = { getAll, findById };
