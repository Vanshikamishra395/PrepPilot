// middleware/validate.middleware.js
// Simple, dependency-free validation helpers. Kept intentionally basic
// so they're easy to read and explain — no external validation library.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

function isNonEmptyString(value, minLength = 1) {
  return typeof value === "string" && value.trim().length >= minLength;
}

// Middleware for POST /api/auth/register
function validateRegister(req, res, next) {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!isNonEmptyString(name, 2)) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }
  if (!isNonEmptyString(password, 6)) {
    errors.push("Password must be at least 6 characters.");
  }
  if (password !== confirmPassword) {
    errors.push("Password and Confirm Password do not match.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  next();
}

// Middleware for POST /api/auth/login
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }
  if (!isNonEmptyString(password)) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  next();
}

module.exports = { validateRegister, validateLogin, isValidEmail, isNonEmptyString };
