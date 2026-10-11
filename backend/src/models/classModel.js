const pool = require("../config/database");

async function getUpcoming({ from, to } = {}) {
  const start = from || new Date();
  const end = to || new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const [rows] = await pool.execute(
    `SELECT c.*, t.name AS trainer_name,
            c.capacity - (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id AND b.status = 'booked') AS spots_left
     FROM classes c
     JOIN trainers t ON t.id = c.trainer_id
     WHERE c.starts_at BETWEEN ? AND ?
     ORDER BY c.starts_at`,
    [start, end]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT c.*, t.name AS trainer_name,
            c.capacity - (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id AND b.status = 'booked') AS spots_left
     FROM classes c JOIN trainers t ON t.id = c.trainer_id WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { getUpcoming, findById };
