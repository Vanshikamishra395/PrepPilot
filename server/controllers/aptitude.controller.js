// controllers/aptitude.controller.js
const aptitudeModel = require("../models/aptitude.model");
const { success, error } = require("../utils/response.util");

// GET /api/aptitude/questions?category=
async function listQuestions(req, res, next) {
  try {
    const { category } = req.query;
    const questions = await aptitudeModel.getQuestions(category);
    return success(res, 200, "Questions fetched.", { questions });
  } catch (err) {
    next(err);
  }
}

// POST /api/aptitude/submit  (protected)  body: { questionId, selectedOption }
async function submitAnswer(req, res, next) {
  try {
    const { questionId, selectedOption } = req.body;
    if (!questionId || !["A", "B", "C", "D"].includes(selectedOption)) {
      return error(res, 400, "questionId and a valid selectedOption are required.");
    }

    const question = await aptitudeModel.getQuestionById(questionId);
    if (!question) return error(res, 404, "Question not found.");

    const isCorrect = question.correct_option === selectedOption;
    await aptitudeModel.recordAttempt(req.userId, questionId, selectedOption, isCorrect);

    return success(res, 200, "Answer submitted.", {
      isCorrect,
      correctOption: question.correct_option,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/aptitude/progress  (protected)
async function getProgress(req, res, next) {
  try {
    const categoryStats = await aptitudeModel.getCategoryStats(req.userId);
    const overall = await aptitudeModel.getOverallStats(req.userId);
    return success(res, 200, "Progress fetched.", { categoryStats, overall });
  } catch (err) {
    next(err);
  }
}

module.exports = { listQuestions, submitAnswer, getProgress };
