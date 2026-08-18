// models/recommendation.model.js
const { pool } = require("../config/db");

// Replaces a user's recommendation set with a freshly generated one.
// Wrapped in a transaction so the user never sees a half-updated list.
async function replaceRecommendations(userId, recommendations) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM recommendations WHERE user_id = ?", [userId]);

    if (recommendations.length > 0) {
      const values = recommendations.map((r) => [userId, r.recommended_topic, r.reason]);
      await connection.query(
        "INSERT INTO recommendations (user_id, recommended_topic, reason) VALUES ?",
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function getRecommendations(userId) {
  const [rows] = await pool.query(
    "SELECT recommended_topic, reason, created_at FROM recommendations WHERE user_id = ? ORDER BY id ASC",
    [userId]
  );
  return rows;
}

module.exports = { replaceRecommendations, getRecommendations };
