// models/aptitude.model.js
const { pool } = require("../config/db");

async function getQuestions(category) {
  let query =
    "SELECT id, category, question_text, option_a, option_b, option_c, option_d FROM aptitude_questions WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  query += " ORDER BY id ASC";

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getQuestionById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM aptitude_questions WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function recordAttempt(userId, questionId, selectedOption, isCorrect) {
  await pool.query(
    `INSERT INTO aptitude_attempts (user_id, question_id, selected_option, is_correct)
     VALUES (?, ?, ?, ?)`,
    [userId, questionId, selectedOption, isCorrect]
  );
}

// Per-category accuracy for a user, used on the dashboard and by recommendations later.
async function getCategoryStats(userId) {
  const [rows] = await pool.query(
    `SELECT q.category,
            COUNT(*) AS attempted,
            SUM(a.is_correct) AS correct
     FROM aptitude_attempts a
     JOIN aptitude_questions q ON a.question_id = q.id
     WHERE a.user_id = ?
     GROUP BY q.category`,
    [userId]
  );
  return rows;
}

async function getOverallStats(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS attempted, SUM(is_correct) AS correct
     FROM aptitude_attempts WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
}

module.exports = {
  getQuestions,
  getQuestionById,
  recordAttempt,
  getCategoryStats,
  getOverallStats,
};
