const pool = require("../config/database");

async function getWeekSummary(userId, since) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS workouts, COALESCE(SUM(calories_burned), 0) AS calories
     FROM workouts WHERE user_id = ? AND performed_at >= ?`,
    [userId, since]
  );
  return rows[0];
}

async function getDistinctDays(userId, since) {
  const [rows] = await pool.execute(
    "SELECT DISTINCT performed_at FROM workouts WHERE user_id = ? AND performed_at >= ? ORDER BY performed_at DESC",
    [userId, since]
  );
  return rows.map(r => r.performed_at);
}

module.exports = { getWeekSummary, getDistinctDays };
