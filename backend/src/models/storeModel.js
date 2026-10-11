const pool = require("../config/database");

async function listActiveProducts(category) {
  if (category) {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE is_active = 1 AND category = ? ORDER BY created_at DESC",
      [category]
    );
    return rows;
  }
  const [rows] = await pool.query("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC");
  return rows;
}

async function listOrdersForUser(userId) {
  const [orders] = await pool.query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  for (const order of orders) {
    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
  }
  return orders;
}

module.exports = { listActiveProducts, listOrdersForUser };
