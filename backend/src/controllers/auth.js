const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const RefreshToken = require("../models/refreshTokenModel");
const RevokedToken = require("../models/revokedTokenModel");
const storage = require("../services/storage");
const emailService = require("../services/email.service");
const Subscription = require("../models/subscriptionModel"); // CHANGED
const { detectImageType } = require("../utils/imageType");
const { generateOpaqueToken, hashToken } = require("../utils/token");
const { generateAccessToken, verifyAccessToken } = require("../utils/jwt");
const { isValidEmail, isValidPassword, isValidPhone, parseProfile, PASSWORD_MIN_LENGTH } = require("../utils/validation");
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const REFRESH_COOKIE = "refresh_token";
const VALID_CATEGORIES = ["Strength", "Pilates"]; // CHANGED

function refreshTokenExpiresAt() {
  const ttl = String(process.env.JWT_REFRESH_EXPIRES || "30d");
  const match = ttl.match(/^(\d+)([smhd])$/);
  let ms;
  if (!match) {
    ms = 30 * 24 * 60 * 60 * 1000;
  } else {
    const n = parseInt(match[1], 10);
    const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    ms = n * units[match[2]];
  }
  return new Date(Date.now() + ms);
}

function cookieOptions() {
  return { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api/auth" };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(), maxAge: 30 * 24 * 60 * 60 * 1000 });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}

async function issueRefreshToken(userId) {
  const token = generateOpaqueToken();
  await RefreshToken.createToken(userId, hashToken(token), refreshTokenExpiresAt());
  return token;
}

function toPublicUser(user) {
  if (!user) return user;
  const { password_hash, email_verified_at, ...publicUser } = user;
  return { ...publicUser, email_verified: !!email_verified_at };
}

async function issueVerifyToken(userId, email) {
  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
  await Token.createToken(userId, "verify", hashToken(token), expiresAt);
  await emailService.sendVerificationEmail(email, token);
}

// -------- registration --------

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    const parsed = parseProfile(req.body);

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Nom invalide (2 caractères minimum)" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Adresse email invalide" });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: "Numéro de téléphone invalide" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères` });
    }

    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = `+216${phone.trim()}`;

    if (await User.findByEmail(normalizedEmail)) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }
    if (await User.findByPhone(normalizedPhone)) {
      return res.status(409).json({ error: "Ce numéro est déjà utilisé" });
    }

    let avatarUrl = null;
    if (req.file) {
      const type = detectImageType(req.file.buffer);
      if (!type) return res.status(400).json({ error: "Image invalide ou corrompue" });
      const key = await storage.uploadAvatar(req.file.buffer, type);
      avatarUrl = storage.buildPublicUrl(key);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await User.createUser({ name: name.trim(), email: normalizedEmail, phone: normalizedPhone, passwordHash, avatar: avatarUrl, profile: parsed.data });
    const token = generateAccessToken(userId);

    try { await issueVerifyToken(userId, normalizedEmail); } catch (err) { console.error("Erreur envoi email de vérification:", err.message); }

    const refreshToken = await issueRefreshToken(userId);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      token,
      // CHANGED: status starts pending_category (see users.status DEFAULT in migration)
      user: { id: userId, name: name.trim(), email: normalizedEmail, phone: normalizedPhone, avatar: avatarUrl, ...parsed.data, email_verified: false, status: "pending_category" },
    });
  } catch (err) {
    console.error("Erreur inscription:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// -------- CHANGED: subscription (category + plan) --------

async function getPlans(req, res) {
  try {
    res.json(await Subscription.listPlans());
  } catch (err) {
    console.error("Erreur formules:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function submitSubscription(req, res) {
  try {
    const { category, planId } = req.body;
    if (typeof category !== "string" || !category.trim()) return res.status(400).json({ error: "Catégorie invalide" });
    if (!planId || isNaN(Number(planId))) return res.status(400).json({ error: "Formule invalide" });

    const result = await Subscription.submit(req.userId, category, Number(planId));
    if (result.error) return res.status(400).json({ error: result.error });

    res.json({ message: "Demande envoyée, en attente de validation" });
  } catch (err) {
    console.error("Erreur souscription:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

// -------- login / session --------

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Only rejected accounts are blocked; pending users log in and the frontend resumes signup
    if (user.status === "rejected") {
      return res.status(403).json({ error: "Compte refusé", status: user.status });
    }

    const refreshToken = await issueRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({
      token: generateAccessToken(user.id),
      user: toPublicUser(await User.findById(user.id)),
    });
  } catch (err) {
    console.error("Erreur connexion:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(toPublicUser(user)); // now includes status & preferred_category (userModel CHANGED)
  } catch (err) {
    console.error("Erreur profil:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email, removeAvatar } = req.body;
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return res.status(400).json({ error: "Nom invalide (2 caractères minimum)" });
    }
    if (email !== undefined && !isValidEmail(email)) return res.status(400).json({ error: "Adresse email invalide" });

    const current = await User.findById(req.userId);
    if (!current) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const normalizedEmail = email !== undefined ? email.trim().toLowerCase() : undefined;
    const emailChanged = normalizedEmail !== undefined && normalizedEmail !== current.email;
    if (emailChanged && (await User.findByEmail(normalizedEmail))) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const parsed = parseProfile(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const updates = { ...parsed.data, name: name !== undefined ? name.trim() : undefined, email: emailChanged ? normalizedEmail : undefined };

    if (req.file) {
      const type = detectImageType(req.file.buffer);
      if (!type) return res.status(400).json({ error: "Image invalide ou corrompue" });
      const key = await storage.uploadAvatar(req.file.buffer, type);
      updates.avatar = storage.buildPublicUrl(key);
      if (current.avatar) await storage.deleteAvatar(storage.extractKeyFromUrl(current.avatar));
    } else if (removeAvatar === "true" || removeAvatar === true) {
      updates.avatar = null;
      if (current.avatar) await storage.deleteAvatar(storage.extractKeyFromUrl(current.avatar));
    }

    await User.updateProfile(req.userId, updates);
    if (emailChanged) {
      try { await issueVerifyToken(req.userId, normalizedEmail); } catch (err) { console.error("Erreur envoi email de vérification:", err.message); }
    }
    res.json(toPublicUser(await User.findById(req.userId)));
  } catch (err) {
    console.error("Erreur mise à jour profil:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !isValidPassword(newPassword)) {
      return res.status(400).json({ error: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères` });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }

    await User.updatePassword(user.id, await bcrypt.hash(newPassword, 10));

    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    let currentRecordId = null;
    if (refreshToken) {
      const record = await RefreshToken.findByHash(hashToken(refreshToken));
      if (record) currentRecordId = record.id;
    }
    await RefreshToken.revokeAllForUser(user.id, currentRecordId);

    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error("Erreur changement mot de passe:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) return res.status(400).json({ error: "Adresse email invalide" });

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (user) {
      const token = generateOpaqueToken();
      await Token.createToken(user.id, "reset", hashToken(token), new Date(Date.now() + RESET_TOKEN_TTL_MS));
      try { await emailService.sendPasswordResetEmail(user.email, token); } catch (err) { console.error("Erreur envoi email de réinitialisation:", err.message); }
    }
    res.json({ message: "Si cette adresse existe, un email de réinitialisation a été envoyé." });
  } catch (err) {
    console.error("Erreur mot de passe oublié:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || typeof token !== "string") return res.status(400).json({ error: "Token manquant" });
    if (!isValidPassword(newPassword)) return res.status(400).json({ error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères` });

    const record = await Token.findValidToken(hashToken(token), "reset");
    if (!record) return res.status(400).json({ error: "Lien invalide ou expiré" });

    await User.updatePassword(record.user_id, await bcrypt.hash(newPassword, 10));
    await Token.markUsed(record.id);
    await RefreshToken.revokeAllForUser(record.user_id);

    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error("Erreur réinitialisation mot de passe:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") return res.status(400).json({ error: "Token manquant" });

    const record = await Token.findValidToken(hashToken(token), "verify");
    if (!record) return res.status(400).json({ error: "Lien invalide ou expiré" });

    await User.setEmailVerified(record.user_id);
    await Token.markUsed(record.id);
    res.json({ message: "Adresse email vérifiée" });
  } catch (err) {
    console.error("Erreur vérification email:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) return res.status(400).json({ error: "Adresse email invalide" });

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (user && !user.email_verified_at) {
      try { await issueVerifyToken(user.id, user.email); } catch (err) { console.error("Erreur renvoi email de vérification:", err.message); }
    }
    res.json({ message: "Si cette adresse existe et n'est pas vérifiée, un email a été envoyé." });
  } catch (err) {
    console.error("Erreur renvoi vérification:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken || typeof refreshToken !== "string") return res.status(401).json({ error: "Session expirée, reconnectez-vous" });

    const record = await RefreshToken.findByHash(hashToken(refreshToken));
    if (!record || record.used_at || record.revoked_at || new Date(record.expires_at) < new Date()) {
      return res.status(401).json({ error: "Session expirée, reconnectez-vous" });
    }

    await RefreshToken.markUsed(record.id);
    const newRefreshToken = await issueRefreshToken(record.user_id);
    setRefreshCookie(res, newRefreshToken);

    res.json({ token: generateAccessToken(record.user_id) });
  } catch (err) {
    console.error("Erreur refresh token:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      const record = await RefreshToken.findByHash(hashToken(refreshToken));
      if (record && !record.revoked_at) await RefreshToken.revoke(record.id);
    }

    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      try {
        const decoded = verifyAccessToken(header.split(" ")[1]);
        if (decoded.jti) await RevokedToken.add(decoded.jti, new Date(decoded.exp * 1000));
      } catch {}
    }

    clearRefreshCookie(res);
    res.json({ message: "Déconnecté" });
  } catch (err) {
    console.error("Erreur déconnexion:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = {
  register, getPlans, submitSubscription, login, me, updateProfile, changePassword,
  forgotPassword, resetPassword, verifyEmail, resendVerification, refresh, logout,
};
