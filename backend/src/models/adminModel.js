const pool = require("../config/database");

// ---------- STATS ----------
async function getStats() {
  const one = async (sql) => (await pool.query(sql))[0][0].n || 0;
  const [gender] = await pool.query("SELECT COALESCE(gender,'unknown') AS gender, COUNT(*) AS n FROM users WHERE role <> 'admin' GROUP BY gender");
  const [signups] = await pool.query("SELECT DATE_FORMAT(created_at,'%Y-%m-%d') AS day, COUNT(*) AS n FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY day ORDER BY day");
  const [recent] = await pool.query("SELECT id, name, email, status, created_at FROM users ORDER BY created_at DESC LIMIT 6");
  return {
    users: await one("SELECT COUNT(*) AS n FROM users WHERE role <> 'admin'"),
    new_users_7d: await one("SELECT COUNT(*) AS n FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"),
    pending_approvals: await one("SELECT COUNT(*) AS n FROM users WHERE status = 'pending_approval'"),
    trainers: await one("SELECT COUNT(*) AS n FROM trainers"),
    upcoming_classes: await one("SELECT COUNT(*) AS n FROM classes WHERE starts_at >= NOW()"),
    active_memberships: await one("SELECT COUNT(*) AS n FROM memberships WHERE status = 'active'"),
    expiring_7d: await one("SELECT COUNT(*) AS n FROM memberships WHERE status = 'active' AND renews_at BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)"),
    bookings_today: await one("SELECT COUNT(*) AS n FROM bookings b JOIN classes c ON c.id = b.class_id WHERE b.status='booked' AND DATE(c.starts_at) = CURDATE()"),
    pending_orders: await one("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'"),
    low_stock: await one("SELECT COUNT(*) AS n FROM products WHERE is_active = 1 AND stock <= 5"),
    membership_revenue_month: await one("SELECT COALESCE(SUM(p.price),0) AS n FROM memberships m JOIN membership_plans p ON p.id = m.plan_id WHERE m.status IN ('active','expired') AND m.started_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    store_revenue_month: await one("SELECT COALESCE(SUM(total),0) AS n FROM orders WHERE status IN ('paid','fulfilled') AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    gender, signups, recent,
  };
}

// ---------- USERS ----------
async function listUsers() {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, gender, age, height_cm, weight_kg, goals, experience, days_per_week, role, level, status, preferred_category, email_verified_at, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
}

async function createUser(d, passwordHash) {
  const cols = ["name", "email", "phone", "password_hash", "role", "level", "status", "preferred_category", "gender", "age", "height_cm", "weight_kg", "goals", "experience", "days_per_week"];
  const vals = [d.name, d.email, d.phone || null, passwordHash, d.role || "user", d.level || "Initiation", d.status || "approved", d.preferred_category || null,
    d.gender || null, d.age || null, d.height_cm || null, d.weight_kg || null, d.goals || null, d.experience || null, d.days_per_week || null];
  const [r] = await pool.execute(`INSERT INTO users (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, vals);
  return r.insertId;
}

async function setUserPassword(id, passwordHash) {
  const [r] = await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
  await pool.execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", [id]);
  return r.affectedRows > 0;
}

async function broadcastNotification(message, userIds) {
  const [r] = userIds && userIds.length
    ? await pool.query("INSERT INTO notifications (user_id, message) SELECT id, ? FROM users WHERE id IN (?)", [message, userIds])
    : await pool.query("INSERT INTO notifications (user_id, message) SELECT id, ? FROM users WHERE role <> 'admin' AND status = 'approved'", [message]);
  return r.affectedRows;
}

async function updateUser(id, d) {
  const allowed = ["name", "email", "phone", "role", "level", "status", "preferred_category", "gender", "age", "height_cm", "weight_kg", "goals", "experience", "days_per_week"];
  const fields = [], values = [];
  for (const k of allowed) {
    if (d[k] === undefined) continue;
    fields.push(`${k} = ?`);
    values.push(d[k] === "" ? null : d[k]);
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteUser(id) {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- TRAINERS ----------
async function listTrainers() {
  const [rows] = await pool.query("SELECT * FROM trainers ORDER BY name");
  return rows;
}

async function createTrainer({ name, specialty, avatar, bio }) {
  const [result] = await pool.execute(
    "INSERT INTO trainers (name, specialty, avatar, bio) VALUES (?, ?, ?, ?)",
    [name, specialty || null, avatar || null, bio || null]
  );
  return result.insertId;
}

async function updateTrainer(id, { name, specialty, avatar, bio }) {
  const fields = [], values = [];
  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (specialty !== undefined) { fields.push("specialty = ?"); values.push(specialty); }
  if (avatar !== undefined) { fields.push("avatar = ?"); values.push(avatar); }
  if (bio !== undefined) { fields.push("bio = ?"); values.push(bio); }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE trainers SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteTrainer(id) {
  const [result] = await pool.execute("DELETE FROM trainers WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- CLASSES ----------
async function listClasses() {
  const [rows] = await pool.query(
    `SELECT c.*, t.name AS trainer_name,
            c.capacity - (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id AND b.status='booked') AS spots_left
     FROM classes c JOIN trainers t ON t.id = c.trainer_id
     ORDER BY c.starts_at DESC`
  );
  return rows;
}

async function createClass({ trainer_id, name, category, location, level, starts_at, ends_at, capacity }) {
  const [result] = await pool.execute(
    "INSERT INTO classes (trainer_id, name, category, location, level, starts_at, ends_at, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [trainer_id, name, category || null, location || null, level || null, starts_at, ends_at, capacity || 20]
  );
  return result.insertId;
}

async function updateClass(id, { trainer_id, name, category, location, level, starts_at, ends_at, capacity }) {
  const fields = [], values = [];
  const map = { trainer_id, name, category, location, level, starts_at, ends_at, capacity };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE classes SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteClass(id) {
  const [result] = await pool.execute("DELETE FROM classes WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- MEMBERSHIP PLANS ----------
async function listPlans() {
  const [rows] = await pool.query("SELECT * FROM membership_plans ORDER BY price");
  return rows;
}

async function createPlan({ name, price, classes_per_month, duration_months, is_active, category }) {
  const [result] = await pool.execute(
    "INSERT INTO membership_plans (name, price, classes_per_month, duration_months, is_active, category) VALUES (?, ?, ?, ?, ?, ?)",
    [name, price, classes_per_month || null, duration_months || 1, is_active ?? 1, category || null]
  );
  return result.insertId;
}

async function updatePlan(id, { name, price, classes_per_month, duration_months, is_active, category }) {
  const fields = [], values = [];
  const map = { name, price, classes_per_month, duration_months, is_active, category };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE membership_plans SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deletePlan(id) {
  const [result] = await pool.execute("DELETE FROM membership_plans WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- MEMBERSHIPS (user subscriptions) ----------
async function listMemberships() {
  const [rows] = await pool.query(
    `SELECT m.*, u.name AS user_name, u.email AS user_email, p.name AS plan_name
     FROM memberships m JOIN users u ON u.id = m.user_id JOIN membership_plans p ON p.id = m.plan_id
     ORDER BY m.created_at DESC`
  );
  return rows;
}

async function updateMembership(id, { status, plan_id, auto_renew, classes_used_this_month, started_at, renews_at }) {
  const fields = [], values = [];
  const map = { status, plan_id, auto_renew, classes_used_this_month, started_at: started_at || undefined, renews_at: renews_at || undefined };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE memberships SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteMembership(id) {
  const [result] = await pool.execute("DELETE FROM memberships WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- BOOKINGS ----------
async function listBookings() {
  const [rows] = await pool.query(
    `SELECT b.id, b.status, b.created_at, u.name AS user_name, u.email AS user_email,
            c.name AS class_name, c.starts_at
     FROM bookings b JOIN users u ON u.id = b.user_id JOIN classes c ON c.id = b.class_id
     ORDER BY b.created_at DESC`
  );
  return rows;
}

async function updateBookingStatus(id, status) {
  const [result] = await pool.execute("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
  return result.affectedRows > 0;
}

// ---------- STORE: PRODUCTS ----------
async function listProducts() {
  const [rows] = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return rows;
}

async function createProduct({ name, category, description, price, stock, image_url, is_active }) {
  const [result] = await pool.execute(
    "INSERT INTO products (name, category, description, price, stock, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, category || null, description || null, price, stock ?? 0, image_url || null, is_active ?? 1]
  );
  return result.insertId;
}

async function updateProduct(id, { name, category, description, price, stock, image_url, is_active }) {
  const fields = [], values = [];
  const map = { name, category, description, price, stock, image_url, is_active };
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteProduct(id) {
  const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ---------- STORE: ORDERS ----------
async function listOrders() {
  const [rows] = await pool.query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return rows;
}

async function getOrderItems(orderId) {
  const [rows] = await pool.query(
    `SELECT oi.*, p.name AS product_name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows;
}

async function updateOrderStatus(id, status) {
  const [result] = await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  return result.affectedRows > 0;
}

// Creates an order + its items in one transaction; caller supplies
// items as [{ product_id, quantity }] with prices/stock looked up server-side.
async function createOrder(userId, items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const priced = [];
    for (const { product_id, quantity } of items) {
      const [[product]] = await conn.query("SELECT price, stock FROM products WHERE id = ? FOR UPDATE", [product_id]);
      if (!product || product.stock < quantity) throw new Error(`Insufficient stock for product ${product_id}`);
      total += product.price * quantity;
      priced.push({ product_id, quantity, unit_price: product.price });
      await conn.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, product_id]);
    }
    const [orderResult] = await conn.execute(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')",
      [userId, total]
    );
    const orderId = orderResult.insertId;
    for (const p of priced) {
      await conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, p.product_id, p.quantity, p.unit_price]
      );
    }
    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ---------- POSTERS ----------
async function listPosters() {
  const [rows] = await pool.query("SELECT * FROM posters ORDER BY created_at DESC");
  return rows;
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

// ---------- CLASS CATEGORIES ----------
async function listClassCategories() {
  const [rows] = await pool.query("SELECT * FROM class_categories ORDER BY sort_order, name");
  return rows;
}
async function createClassCategory({ name, is_active, sort_order }) {
  const [r] = await pool.execute(
    "INSERT INTO class_categories (name, is_active, sort_order) VALUES (?, ?, ?)",
    [name, is_active === undefined ? 1 : (is_active ? 1 : 0), sort_order || 0]
  );
  return r.insertId;
}
async function updateClassCategory(id, { name, is_active, sort_order }) {
  const fields = [], values = [];
  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active ? 1 : 0); }
  if (sort_order !== undefined) { fields.push("sort_order = ?"); values.push(sort_order || 0); }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE class_categories SET ${fields.join(", ")} WHERE id = ?`, values);
}
async function deleteClassCategory(id) {
  const [r] = await pool.execute("DELETE FROM class_categories WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

// ---------- WORKOUTS ----------
async function listWorkouts() {
  const [rows] = await pool.query(
    "SELECT w.*, u.name AS user_name FROM workouts w JOIN users u ON u.id = w.user_id ORDER BY w.performed_at DESC, w.id DESC"
  );
  return rows;
}
async function createWorkout({ user_id, class_id, type, duration_minutes, calories_burned, performed_at }) {
  const [r] = await pool.execute(
    "INSERT INTO workouts (user_id, class_id, type, duration_minutes, calories_burned, performed_at) VALUES (?, ?, ?, ?, ?, ?)",
    [user_id, class_id || null, type || null, duration_minutes || null, calories_burned || null, performed_at]
  );
  return r.insertId;
}
async function updateWorkout(id, d) {
  const fields = [], values = [];
  for (const k of ["user_id", "class_id", "type", "duration_minutes", "calories_burned", "performed_at"]) {
    if (d[k] !== undefined) { fields.push(`${k} = ?`); values.push(d[k] === "" ? null : d[k]); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE workouts SET ${fields.join(", ")} WHERE id = ?`, values);
}
async function deleteWorkout(id) {
  const [r] = await pool.execute("DELETE FROM workouts WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

// ---------- DIET LOGS ----------
async function listDietLogs() {
  const [rows] = await pool.query(
    "SELECT d.*, u.name AS user_name FROM diet_logs d JOIN users u ON u.id = d.user_id ORDER BY d.logged_at DESC, d.id DESC"
  );
  return rows;
}
async function createDietLog({ user_id, meal_type, description, calories, logged_at }) {
  const [r] = await pool.execute(
    "INSERT INTO diet_logs (user_id, meal_type, description, calories, logged_at) VALUES (?, ?, ?, ?, ?)",
    [user_id, meal_type, description || null, calories || null, logged_at]
  );
  return r.insertId;
}
async function updateDietLog(id, d) {
  const fields = [], values = [];
  for (const k of ["user_id", "meal_type", "description", "calories", "logged_at"]) {
    if (d[k] !== undefined) { fields.push(`${k} = ?`); values.push(d[k] === "" ? null : d[k]); }
  }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE diet_logs SET ${fields.join(", ")} WHERE id = ?`, values);
}
async function deleteDietLog(id) {
  const [r] = await pool.execute("DELETE FROM diet_logs WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

// ---------- NOTIFICATIONS ----------
async function listNotifications() {
  const [rows] = await pool.query("SELECT n.*, u.name AS user_name FROM notifications n JOIN users u ON u.id = n.user_id ORDER BY n.created_at DESC, n.id DESC LIMIT 500");
  return rows;
}
async function createNotification({ user_id, message, is_read }) {
  const [r] = await pool.execute(
    "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)",
    [user_id, message, is_read ? 1 : 0]
  );
  return r.insertId;
}
async function updateNotification(id, { user_id, message, is_read }) {
  const fields = [], values = [];
  if (user_id !== undefined) { fields.push("user_id = ?"); values.push(user_id); }
  if (message !== undefined) { fields.push("message = ?"); values.push(message); }
  if (is_read !== undefined) { fields.push("is_read = ?"); values.push(is_read ? 1 : 0); }
  if (!fields.length) return;
  values.push(id);
  await pool.execute(`UPDATE notifications SET ${fields.join(", ")} WHERE id = ?`, values);
}
async function deleteNotification(id) {
  const [r] = await pool.execute("DELETE FROM notifications WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

module.exports = {
  listClassCategories, createClassCategory, updateClassCategory, deleteClassCategory,
  listWorkouts, createWorkout, updateWorkout, deleteWorkout,
  listDietLogs, createDietLog, updateDietLog, deleteDietLog,
  listNotifications, createNotification, updateNotification, deleteNotification,
  getStats,
  listUsers, updateUser, deleteUser, createUser, setUserPassword, broadcastNotification,
  listTrainers, createTrainer, updateTrainer, deleteTrainer,
  listClasses, createClass, updateClass, deleteClass,
  listPlans, createPlan, updatePlan, deletePlan,
  listMemberships, updateMembership, deleteMembership,
  listBookings, updateBookingStatus,
  listProducts, createProduct, updateProduct, deleteProduct,
  listOrders, getOrderItems, updateOrderStatus, createOrder,
  listPosters, createPoster, updatePoster, deletePoster,
};
