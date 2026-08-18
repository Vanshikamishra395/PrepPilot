// models/coding.model.js
const { pool } = require("../config/db");

// Builds a dynamic WHERE clause safely using parameterized values.
async function getProblems({ topic, difficulty, search }) {
  let query = "SELECT id, title, difficulty, topic FROM coding_problems WHERE 1=1";
  const params = [];

  if (topic) {
    query += " AND topic = ?";
    params.push(topic);
  }
  if (difficulty) {
    query += " AND difficulty = ?";
    params.push(difficulty);
  }
  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  query += " ORDER BY id ASC";

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getProblemById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM coding_problems WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function getUserProgressMap(userId) {
  const [rows] = await pool.query(
    "SELECT problem_id, status FROM coding_progress WHERE user_id = ?",
    [userId]
  );
  const map = {};
  rows.forEach((row) => {
    map[row.problem_id] = row.status;
  });
  return map;
}

// Insert or update a user's status for a problem.
async function upsertProgress(userId, problemId, status) {
  await pool.query(
    `INSERT INTO coding_progress (user_id, problem_id, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
    [userId, problemId, status]
  );
}

async function getSolvedCount(userId) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS solved FROM coding_progress WHERE user_id = ? AND status = 'Completed'",
    [userId]
  );
  return rows[0].solved;
}

async function getTotalCount() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM coding_problems");
  return rows[0].total;
}

module.exports = {
  getProblems,
  getProblemById,
  getUserProgressMap,
  upsertProgress,
  getSolvedCount,
  getTotalCount,
};
