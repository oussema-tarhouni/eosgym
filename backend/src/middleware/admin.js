const { isValidSession } = require("../controllers/adminGate");

// Replaces role-based admin checks: access is granted purely by having
// completed the admin gate (code + credentials), not by any user's DB role.
function requireGateSession(req, res, next) {
  const token = req.headers["x-admin-session"];
  if (!token || !isValidSession(token)) {
    return res.status(401).json({ error: "Session admin invalide ou expirée" });
  }
  next();
}

module.exports = { requireGateSession };
