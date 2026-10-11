const pool = require("../config/database");

async function create(userId, classId) {
  const [result] = await pool.execute(
    "INSERT INTO bookings (user_id, class_id, status) VALUES (?, ?, 'booked')",
    [userId, classId]
  );
  return result.insertId;
}

async function findActive(userId, classId) {
  const [rows] = await pool.execute(
    "SELECT * FROM bookings WHERE user_id = ? AND class_id = ? AND status = 'booked'",
    [userId, classId]
  );
  return rows[0] || null;
}

async function cancel(userId, classId) {
  const [result] = await pool.execute(
    "UPDATE bookings SET status = 'cancelled' WHERE user_id = ? AND class_id = ? AND status = 'booked'",
    [userId, classId]
  );
  return result.affectedRows > 0;
}

async function getForUser(userId, { from, to } = {}) {
  const params = [userId];
  let dateFilter = "";
  if (from && to) {
    dateFilter = " AND c.starts_at BETWEEN ? AND ?";
    params.push(from, to);
  }
  const [rows] = await pool.execute(
    `SELECT b.id AS booking_id, b.status, c.*, t.name AS trainer_name
     FROM bookings b
     JOIN classes c ON c.id = b.class_id
     JOIN trainers t ON t.id = c.trainer_id
     WHERE b.user_id = ? AND b.status = 'booked'${dateFilter}
     ORDER BY c.starts_at`,
    params
  );
  return rows;
}

module.exports = { create, findActive, cancel, getForUser };
