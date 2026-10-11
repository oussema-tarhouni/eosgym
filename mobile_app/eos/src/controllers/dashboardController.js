const pool = require('../db'); // adjust path to wherever your mysql2 pool lives

const LEVEL_RANK = { Initiation: 1, Debutant: 2, Intermediaire: 3, Avancee: 4, Expert: 5 };

// GET /api/dashboard/home
exports.getHome = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[membershipRows], [todayClasses], [trainers], [announcements], [notifications]] = await Promise.all([
      pool.query(
        `SELECT m.status, m.auto_renew, m.started_at, m.renews_at,
                m.classes_used_this_month AS classes_used,
                mp.name AS tier, mp.classes_per_month AS classes_total
         FROM memberships m
         JOIN membership_plans mp ON mp.id = m.plan_id
         WHERE m.user_id = ?`, [userId]
      ),
      pool.query(
        `SELECT c.id, c.name, c.location, c.level, c.starts_at, c.ends_at, c.capacity, t.name AS trainer_name,
                (c.capacity - COALESCE(b.cnt, 0)) AS spots_left
         FROM classes c
         JOIN trainers t ON t.id = c.trainer_id
         LEFT JOIN (SELECT class_id, COUNT(*) cnt FROM bookings WHERE status = 'booked' GROUP BY class_id) b ON b.class_id = c.id
         WHERE DATE(c.starts_at) = CURDATE()
         ORDER BY c.starts_at`
      ),
      pool.query('SELECT id, name, specialty AS role, avatar, bio FROM trainers LIMIT 5'),
      pool.query(
        `SELECT id, title, CONCAT(title, ' — ', COALESCE(description, '')) AS text, image_url, created_at
         FROM announcements ORDER BY created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT id, message AS text, is_read, created_at
         FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`, [userId]
      ),
    ]);

    const m = membershipRows[0] || null;

    res.json({
      membership: m && {
        tier: m.tier,
        status: m.status,
        since: m.started_at,
        renewsAt: m.renews_at,
        classesUsed: m.classes_used,
        classesTotal: m.classes_total, // null = unlimited
      },
      todayClasses: todayClasses.map((c) => ({
        id: c.id,
        time: `${fmtTime(c.starts_at)} – ${fmtTime(c.ends_at)}`,
        name: c.name,
        trainer: c.trainer_name,
        location: c.location,
        level: c.level,
        spotsLeft: c.spots_left,
      })),
      trainers,
      announcements,
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

function fmtTime(dt) {
  return new Date(dt).toTimeString().slice(0, 5); // "08:00"
}

// GET /api/classes?from=&to=  (from/to are dates, e.g. 2026-09-07)
exports.listClasses = async (req, res) => {
  const { from, to } = req.query;
  let sql = `SELECT c.*, t.name AS trainer_name,
             (c.capacity - COALESCE(b.cnt, 0)) AS spots_left
             FROM classes c
             JOIN trainers t ON t.id = c.trainer_id
             LEFT JOIN (SELECT class_id, COUNT(*) cnt FROM bookings WHERE status = 'booked' GROUP BY class_id) b ON b.class_id = c.id`;
  const conds = [], params = [];
  if (from) { conds.push('c.starts_at >= ?'); params.push(new Date(from)); }
  if (to) { conds.push('c.starts_at <= ?'); params.push(new Date(to)); }
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY c.starts_at';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
};

// POST /api/classes/:id/book
exports.bookClass = async (req, res) => {
  const classId = req.params.id;
  const userId = req.user.id;

  const [[cls]] = await pool.query(
    `SELECT c.capacity, c.level, (SELECT COUNT(*) FROM bookings WHERE class_id = c.id AND status = 'booked') AS booked
     FROM classes c WHERE c.id = ?`, [classId]
  );
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  if (cls.booked >= cls.capacity) return res.status(400).json({ error: 'Class is full' });

  if (cls.level) {
    const [[u]] = await pool.query('SELECT level FROM users WHERE id = ?', [userId]);
    if ((LEVEL_RANK[cls.level] || 0) > (LEVEL_RANK[u?.level] || 0)) {
      return res.status(403).json({ error: `Requires ${cls.level} level` });
    }
  }

  try {
    await pool.query(
      `INSERT INTO bookings (user_id, class_id, status) VALUES (?, ?, 'booked')
       ON DUPLICATE KEY UPDATE status = 'booked'`, [userId, classId]
    );
    await pool.query('UPDATE memberships SET classes_used_this_month = classes_used_this_month + 1 WHERE user_id = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed' });
  }
};

// GET /api/trainers
exports.listTrainers = async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, specialty AS role, avatar, bio FROM trainers');
  res.json(rows);
};

// GET /api/announcements
exports.listAnnouncements = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, CONCAT(title, ' — ', COALESCE(description, '')) AS text, image_url, link, created_at
     FROM announcements ORDER BY created_at DESC LIMIT 20`
  );
  res.json(rows);
};

// GET /api/notifications
exports.listNotifications = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, message AS text, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
    [req.user.id]
  );
  res.json(rows);
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user.id]);
  res.json({ success: true });
};
