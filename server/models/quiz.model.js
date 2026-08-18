// models/quiz.model.js
const { pool } = require("../config/db");

async function getQuizByLevel(level) {
  const [rows] = await pool.query(
    "SELECT * FROM quizzes WHERE level = ? LIMIT 1",
    [level]
  );
  return rows[0] || null;
}

// Questions sent to the frontend — correct_option is deliberately
// excluded so the answer key never reaches the client.
async function getQuestionsForClient(quizId) {
  const [rows] = await pool.query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d, topic
     FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC`,
    [quizId]
  );
  return rows;
}

// Full question rows including the answer key — used server-side only,
// for grading a submission.
async function getQuestionsForGrading(quizId) {
  const [rows] = await pool.query(
    "SELECT id, correct_option, topic FROM quiz_questions WHERE quiz_id = ?",
    [quizId]
  );
  return rows;
}

// Has this user ever completed a Level 1 quiz? Used to gate Level 2 access.
async function hasCompletedLevel1(userId) {
  const [rows] = await pool.query(
    `SELECT qa.id FROM quiz_attempts qa
     JOIN quizzes q ON qa.quiz_id = q.id
     WHERE qa.user_id = ? AND q.level = 'Level1'
     LIMIT 1`,
    [userId]
  );
  return rows.length > 0;
}

// Saves a full attempt (attempt row + all answer rows) inside a single
// transaction, so a failure partway through never leaves partial data.
async function saveAttempt({ userId, quizId, score, percentage, skillLevelResult, gradedAnswers }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [attemptResult] = await connection.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, percentage, skill_level_result)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, quizId, score, percentage, skillLevelResult]
    );
    const attemptId = attemptResult.insertId;

    // Bulk insert all answers in one query for efficiency.
    const values = gradedAnswers.map((a) => [
      attemptId,
      a.questionId,
      a.selectedOption,
      a.isCorrect,
    ]);
    if (values.length > 0) {
      await connection.query(
        `INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct) VALUES ?`,
        [values]
      );
    }

    await connection.commit();
    return attemptId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// Topic-wise breakdown for one specific attempt.
async function getTopicPerformance(attemptId) {
  const [rows] = await pool.query(
    `SELECT qq.topic,
            COUNT(*) AS total,
            SUM(qa.is_correct) AS correct
     FROM quiz_answers qa
     JOIN quiz_questions qq ON qa.question_id = qq.id
     WHERE qa.attempt_id = ?
     GROUP BY qq.topic`,
    [attemptId]
  );
  return rows;
}

// All of a user's past attempts, most recent first.
async function getUserAttempts(userId) {
  const [rows] = await pool.query(
    `SELECT qa.id, qa.score, qa.percentage, qa.skill_level_result, qa.attempted_at, q.level
     FROM quiz_attempts qa
     JOIN quizzes q ON qa.quiz_id = q.id
     WHERE qa.user_id = ?
     ORDER BY qa.attempted_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  getQuizByLevel,
  getQuestionsForClient,
  getQuestionsForGrading,
  hasCompletedLevel1,
  saveAttempt,
  getTopicPerformance,
  getUserAttempts,
};
