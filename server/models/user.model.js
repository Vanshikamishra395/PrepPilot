// models/user.model.js
// All direct SQL access to the `users` table lives here. Controllers
// never write raw SQL themselves — they call these functions instead.
// Every query uses parameterized placeholders (?) to prevent SQL injection.

const { pool } = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return { id: result.insertId, name, email };
}

async function getSkillLevel(userId) {
  const [rows] = await pool.query(
    "SELECT skill_level, updated_at FROM user_skill_levels WHERE user_id = ? LIMIT 1",
    [userId]
  );
  return rows[0] || null;
}

// Called after every quiz attempt. The user's overall classification
// always reflects their MOST RECENT attempt (simple, predictable rule
// that's easy to explain — no averaging or "best of" logic).
async function upsertSkillLevel(userId, skillLevel) {
  await pool.query(
    `INSERT INTO user_skill_levels (user_id, skill_level)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE skill_level = VALUES(skill_level), updated_at = CURRENT_TIMESTAMP`,
    [userId, skillLevel]
  );
}

module.exports = { findByEmail, findById, createUser, getSkillLevel, upsertSkillLevel };
