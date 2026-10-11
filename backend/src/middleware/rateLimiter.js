const rateLimit = require("express-rate-limit");

const shared = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, skip: () => process.env.NODE_ENV === "test" };

const authLimiter = rateLimit({ ...shared, limit: 10, message: { error: "Trop de tentatives, réessayez plus tard." } });
const emailLimiter = rateLimit({ ...shared, limit: 5, message: { error: "Trop de demandes, réessayez plus tard." } });
const otpLimiter = rateLimit({ ...shared, limit: 5, message: { error: "Trop de demandes de code, réessayez plus tard." } });
const refreshLimiter = rateLimit({ ...shared, limit: 30, message: { error: "Trop de demandes, réessayez plus tard." } });

module.exports = { authLimiter, emailLimiter, otpLimiter, refreshLimiter };
