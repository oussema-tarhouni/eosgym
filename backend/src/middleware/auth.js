const { verifyAccessToken } = require("../utils/jwt");
const RevokedToken = require("../models/revokedTokenModel");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    if (decoded.jti && (await RevokedToken.isRevoked(decoded.jti))) {
      return res.status(401).json({ error: "Session expirée, reconnectez-vous" });
    }
    req.userId = decoded.userId;
    req.user = { id: decoded.userId }; // ADDED: some controllers read req.user.id — kept req.userId too for existing code
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

module.exports = { authenticate };
