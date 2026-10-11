const jwt = require("jsonwebtoken");
const { generateJti } = require("./token");

function generateAccessToken(userId) {
  return jwt.sign({ userId, jti: generateJti() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateAccessToken, verifyAccessToken };
