const Content = require("../models/contentModel");
const Admin = require("../models/adminModel");
const pool = require("../config/database");
const storage = require("../services/storage");
const { detectImageType } = require("../utils/imageType");

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (e) { console.error("Erreur contenu:", e); res.status(e.status || 500).json({ error: e.status ? e.message : "Erreur serveur" }); }
};

async function imageFrom(req) {
  if (!req.file) return undefined;
  const type = detectImageType(req.file.buffer);
  if (!type) { const e = new Error("Image invalide ou corrompue"); e.status = 400; throw e; }
  return storage.buildPublicUrl(await storage.uploadAvatar(req.file.buffer, type));
}
const del = (fn, msg) => wrap(async (req, res) => {
  if (!(await fn(req.params.id))) return res.status(404).json({ error: "Introuvable" });
  res.json({ message: msg });
});

// public feed
exports.listPostersPublic = wrap(async (req, res) => res.json(await Content.listPosters()));
exports.listNotificationsPublic = wrap(async (req, res) => res.json(await Content.listNotifications())); // announcements

// per-user notifications
exports.listMyNotifications = wrap(async (req, res) => {
  const [rows] = await pool.execute("SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100", [req.userId]);
  res.json(rows);
});
exports.markMyNotificationsRead = wrap(async (req, res) => {
  await pool.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.userId]);
  res.json({ ok: true });
});

// admin: posters
exports.listPostersAdmin = wrap(async (req, res) => res.json(await Content.listPosters()));
exports.createPoster = wrap(async (req, res) => {
  const d = { ...req.body }; const img = await imageFrom(req); if (img) d.image_url = img;
  if (!d.username || !d.text) return res.status(400).json({ error: "Username et description requis" });
  res.status(201).json({ id: await Content.createPoster(d) });
});
exports.updatePoster = wrap(async (req, res) => {
  const d = { ...req.body }; const img = await imageFrom(req); if (img) d.image_url = img;
  await Content.updatePoster(req.params.id, d); res.json({ message: "Poster mis à jour" });
});
exports.deletePoster = del(Content.deletePoster, "Poster supprimé");

// admin: announcements
exports.listAnnouncementsAdmin = wrap(async (req, res) => res.json(await Content.listNotifications()));
exports.createAnnouncement = wrap(async (req, res) => {
  const d = { ...req.body }; const img = await imageFrom(req); if (img) d.image_url = img;
  if (!d.title) return res.status(400).json({ error: "Titre requis" });
  res.status(201).json({ id: await Content.createNotification(d) });
});
exports.updateAnnouncement = wrap(async (req, res) => {
  const d = { ...req.body }; const img = await imageFrom(req); if (img) d.image_url = img;
  await Content.updateNotification(req.params.id, d); res.json({ message: "Annonce mise à jour" });
});
exports.deleteAnnouncement = del(Content.deleteNotification, "Annonce supprimée");

// admin: one compose action for both channels.
// audience "selected" -> private notification to those members (one or many)
// audience "all"      -> notification to every approved member (+ pinned on the home feed unless feed=false)
exports.sendNotification = wrap(async (req, res) => {
  const b = req.body || {};
  const message = String(b.message || "").trim().slice(0, 500);
  const title = String(b.title || "").trim().slice(0, 150);
  if (!message) return res.status(400).json({ error: "Message requis" });

  let ids = null;
  if (b.audience === "selected") {
    let raw = b.user_ids;
    if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = raw.split(","); } }
    ids = (Array.isArray(raw) ? raw : []).map(Number).filter(Boolean);
    if (!ids.length) return res.status(400).json({ error: "Sélectionnez au moins un membre" });
  }

  const sent = await Admin.broadcastNotification(title ? `${title} — ${message}` : message, ids);
  let feed = false;
  if (!ids && !(b.feed === false || b.feed === "false" || b.feed === "0")) {
    const image_url = await imageFrom(req);
    await Content.createNotification({ title: title || message.slice(0, 60), description: message, image_url, link: String(b.link || "").trim() || null });
    feed = true;
  }
  res.json({ sent, feed });
});
