// models/search.model.js
const { pool } = require("../config/db");

const RESULT_LIMIT = 8;

async function searchCoding(term) {
  const [rows] = await pool.query(
    `SELECT id, title, difficulty, topic FROM coding_problems
     WHERE title LIKE ? OR topic LIKE ?
     LIMIT ?`,
    [`%${term}%`, `%${term}%`, RESULT_LIMIT]
  );
  return rows;
}

async function searchAptitude(term) {
  const [rows] = await pool.query(
    `SELECT id, category, question_text FROM aptitude_questions
     WHERE question_text LIKE ?
     LIMIT ?`,
    [`%${term}%`, RESULT_LIMIT]
  );
  return rows;
}

async function searchInterview(term, type) {
  const [rows] = await pool.query(
    `SELECT id, type, topic, question_text FROM interview_resources
     WHERE type = ? AND (question_text LIKE ? OR topic LIKE ?)
     LIMIT ?`,
    [type, `%${term}%`, `%${term}%`, RESULT_LIMIT]
  );
  return rows;
}

// Runs all searches in parallel and returns a grouped result set.
async function searchAll(term) {
  const [coding, aptitude, technical, hr] = await Promise.all([
    searchCoding(term),
    searchAptitude(term),
    searchInterview(term, "Technical"),
    searchInterview(term, "HR"),
  ]);
  return { coding, aptitude, technical, hr };
}

module.exports = { searchAll, searchCoding, searchAptitude, searchInterview };
