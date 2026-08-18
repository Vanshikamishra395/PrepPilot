// utils/hash.util.js
// Wraps bcrypt so the rest of the app never touches raw hashing logic.

const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
