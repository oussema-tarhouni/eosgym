const pool = require("../config/database");

async function getActiveForUser(userId) {
  const [rows] = await pool.execute(
    `SELECT m.*, p.name AS plan_name, p.classes_per_month
     FROM memberships m
     JOIN membership_plans p ON p.id = m.plan_id
     WHERE m.user_id = ? AND m.status = 'active'
     ORDER BY m.created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function incrementClassesUsed(membershipId) {
  await pool.execute("UPDATE memberships SET classes_used_this_month = classes_used_this_month + 1 WHERE id = ?", [membershipId]);
}

module.exports = { getActiveForUser, incrementClassesUsed };
