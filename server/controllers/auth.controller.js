// controllers/auth.controller.js
const userModel = require("../models/user.model");
const { hashPassword, comparePassword } = require("../utils/hash.util");
const { generateToken } = require("../utils/jwt.util");
const { success, error } = require("../utils/response.util");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userModel.findByEmail(normalizedEmail);
    if (existingUser) {
      return error(res, 409, "An account with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const newUser = await userModel.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = generateToken({ id: newUser.id, email: newUser.email });

    return success(res, 201, "Account created successfully.", {
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findByEmail(normalizedEmail);
    // Use the same generic message whether the email doesn't exist or the
    // password is wrong — this avoids revealing which emails are registered.
    if (!user) {
      return error(res, 401, "Invalid email or password.");
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      return error(res, 401, "Invalid email or password.");
    }

    const token = generateToken({ id: user.id, email: user.email });

    return success(res, 200, "Login successful.", {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
