const pool = require("../config/database");

async function listPlans() {
  const [rows] = await pool.execute(
    "SELECT id, name, price, classes_per_month, duration_months, category FROM membership_plans WHERE is_active = 1 ORDER BY duration_months ASC"
  );
  return rows;
}

async function submit(userId, category, planId) {
  const [[plan]] = await pool.execute(
    "SELECT id, category FROM membership_plans WHERE id = ? AND is_active = 1", [planId]
  );
  if (!plan) return { error: "Formule invalide" };
  if (plan.category && plan.category !== category) return { error: "Cette formule n'appartient pas à cette catégorie" };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute("UPDATE users SET preferred_category = ?, status = 'pending_approval' WHERE id = ?", [category, userId]);
    await conn.execute("INSERT INTO memberships (user_id, plan_id, status, started_at) VALUES (?, ?, 'pending', NULL)", [userId, planId]);
    await conn.commit();
    return {};
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { listPlans, submit };
