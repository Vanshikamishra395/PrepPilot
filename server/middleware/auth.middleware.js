// middleware/auth.middleware.js
// Protects routes by requiring a valid JWT in the Authorization header.
// On success, attaches req.userId so controllers know who is making the request.

const { verifyToken } = require("../utils/jwt.util");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = { requireAuth };
