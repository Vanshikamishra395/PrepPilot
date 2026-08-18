// models/chat.model.js
const { pool } = require("../config/db");

async function saveMessage(userId, role, message) {
  await pool.query(
    "INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)",
    [userId, role, message]
  );
}

// Most recent N messages, returned oldest-first so they can be fed
// straight into the LLM as conversation history.
async function getRecentHistory(userId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT role, message, created_at FROM chat_history
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows.reverse();
}

async function getFullHistory(userId) {
  const [rows] = await pool.query(
    "SELECT role, message, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at ASC",
    [userId]
  );
  return rows;
}

module.exports = { saveMessage, getRecentHistory, getFullHistory };
