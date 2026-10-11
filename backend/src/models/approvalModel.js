const pool = require("../config/database");

async function listPendingUsers() {
  const [rows] = await pool.execute(`
    SELECT u.id, u.name, u.email, u.phone, u.preferred_category,
           m.id AS membership_id, mp.name AS plan_name, mp.price, mp.duration_months,
           m.created_at AS requested_at
    FROM users u
    JOIN memberships m ON m.user_id = u.id AND m.status = 'pending'
    JOIN membership_plans mp ON mp.id = m.plan_id
    WHERE u.status = 'pending_approval'
    ORDER BY m.created_at ASC
  `);
  return rows;
}

async function approve(userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[membership]] = await conn.execute(
      "SELECT m.id, mp.duration_months FROM memberships m JOIN membership_plans mp ON mp.id = m.plan_id WHERE m.user_id = ? AND m.status = 'pending' LIMIT 1",
      [userId]
    );
    if (!membership) { await conn.rollback(); return false; }

    await conn.execute(
      "UPDATE memberships SET status = 'active', started_at = CURDATE(), renews_at = DATE_ADD(CURDATE(), INTERVAL ? MONTH) WHERE id = ?",
      [membership.duration_months, membership.id]
    );
    await conn.execute("UPDATE users SET status = 'approved' WHERE id = ?", [userId]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function reject(userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute("UPDATE memberships SET status = 'cancelled' WHERE user_id = ? AND status = 'pending'", [userId]);
    const [result] = await conn.execute("UPDATE users SET status = 'rejected' WHERE id = ?", [userId]);
    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { listPendingUsers, approve, reject };
