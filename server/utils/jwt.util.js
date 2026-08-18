// utils/jwt.util.js
// Wraps jsonwebtoken so token creation/verification logic lives in one place.

const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateToken(payload) {
  // payload should only ever contain non-sensitive identifiers,
  // e.g. { id: user.id, email: user.email }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  // Throws if invalid/expired — caller is responsible for try/catch.
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
