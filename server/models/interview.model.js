// models/interview.model.js
const { pool } = require("../config/db");

async function getResources({ type, topic }) {
  let query = "SELECT * FROM interview_resources WHERE type = ?";
  const params = [type];

  if (topic) {
    query += " AND topic = ?";
    params.push(topic);
  }
  query += " ORDER BY id ASC";

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getResourceById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM interview_resources WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function markCompleted(userId, resourceId, isCompleted) {
  await pool.query(
    `INSERT INTO user_progress (user_id, resource_id, is_completed)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE is_completed = VALUES(is_completed), updated_at = CURRENT_TIMESTAMP`,
    [userId, resourceId, isCompleted]
  );
}

async function getUserProgressMap(userId, type) {
  const [rows] = await pool.query(
    `SELECT up.resource_id, up.is_completed
     FROM user_progress up
     JOIN interview_resources ir ON up.resource_id = ir.id
     WHERE up.user_id = ? AND ir.type = ?`,
    [userId, type]
  );
  const map = {};
  rows.forEach((row) => {
    map[row.resource_id] = !!row.is_completed;
  });
  return map;
}

async function getCompletionStats(userId, type) {
  const [totalRows] = await pool.query(
    "SELECT COUNT(*) AS total FROM interview_resources WHERE type = ?",
    [type]
  );
  const [completedRows] = await pool.query(
    `SELECT COUNT(*) AS completed
     FROM user_progress up
     JOIN interview_resources ir ON up.resource_id = ir.id
     WHERE up.user_id = ? AND ir.type = ? AND up.is_completed = TRUE`,
    [userId, type]
  );
  return { total: totalRows[0].total, completed: completedRows[0].completed };
}

module.exports = {
  getResources,
  getResourceById,
  markCompleted,
  getUserProgressMap,
  getCompletionStats,
};
