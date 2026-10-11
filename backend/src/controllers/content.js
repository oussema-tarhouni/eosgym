// TEMP stub: replace bodies with your real model queries.
exports.listPostersPublic = async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.listNotificationsPublic = async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.listMyNotifications = async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.markMyNotificationsRead = async (req, res) => {
  try { res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.listPostersAdmin = async (req, res) => {
  try { res.json([]); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.createPoster = async (req, res) => {
  try { res.status(201).json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.updatePoster = async (req, res) => {
  try { res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.deletePoster = async (req, res) => {
  try { res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
};
