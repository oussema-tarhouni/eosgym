const crypto = require("crypto");

// In-memory single-use token store (10 min expiry). Single-node only —
// swap for Redis/DB if you run multiple backend instances.
const pendingCodes = new Map();

const CODE_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";

function generateCode(length = 25) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_CHARSET[crypto.randomInt(CODE_CHARSET.length)];
  }
  return out;
}

function safeEqual(a = "", b = "") {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Called only by the access_admin script (via shared secret header).
function generate(req, res) {
  const secret = req.headers["x-admin-script-secret"];
  if (!safeEqual(secret, process.env.ADMIN_SCRIPT_SECRET)) {
    return res.status(401).json({ error: "Secret invalide" });
  }
  const code = generateCode(25);
  pendingCodes.set(code, Date.now() + 10 * 60 * 1000); // 10 minutes
  res.json({ code });
}

// Non-consuming: lets the gate page render if the code is still valid.
function check(req, res) {
  const { code } = req.params;
  const expiresAt = pendingCodes.get(code);
  if (!expiresAt || Date.now() > expiresAt) {
    return res.status(403).json({ error: "Code invalide ou expiré" });
  }
  res.json({ ok: true });
}

// Active admin sessions granted after a successful gate verify. 2 hour expiry.
const adminSessions = new Map();

function endSession(token) { adminSessions.delete(token); }

function isValidSession(token) {
  const expiresAt = adminSessions.get(token);
  if (!expiresAt || Date.now() > expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

// Consumes the code only on successful credential match, then grants a session token.
function verify(req, res) {
  const { code, username, password } = req.body || {};

  const expiresAt = pendingCodes.get(code);
  if (!expiresAt || Date.now() > expiresAt) {
    pendingCodes.delete(code);
    return res.status(403).json({ error: "Code invalide ou expiré" });
  }

  const credsOk =
    safeEqual(username, process.env.ADMIN_GATE_USERNAME) &&
    safeEqual(password, process.env.ADMIN_GATE_PASSWORD);

  if (!credsOk) return res.status(401).json({ error: "Identifiants invalides" });

  pendingCodes.delete(code); // single-use, consumed now

  const adminToken = crypto.randomBytes(32).toString("hex");
  adminSessions.set(adminToken, Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  res.json({ ok: true, adminToken });
}

function checkSession(req, res) {
  const t = req.headers["x-admin-session"];
  if (!t || !isValidSession(t)) return res.status(401).json({ error: "Session invalide" });
  res.json({ ok: true });
}
function logout(req, res) { endSession(req.headers["x-admin-session"]); res.json({ ok: true }); }

module.exports = { generate, check, verify, isValidSession, checkSession, logout };
