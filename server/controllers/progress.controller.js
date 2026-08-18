// controllers/progress.controller.js
// Aggregates detailed progress across every module. This is deliberately
// separate from GET /api/user/dashboard (Stage 4), which only needs
// four percentages for the dashboard cards — this endpoint gives the
// full breakdown (per-topic, per-category) for a "My Progress" style view.

const codingModel = require("../models/coding.model");
const aptitudeModel = require("../models/aptitude.model");
const interviewModel = require("../models/interview.model");
const quizModel = require("../models/quiz.model");
const { success } = require("../utils/response.util");

function toPercentage(part, total) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

// GET /api/progress/summary  (protected)
async function getSummary(req, res, next) {
  try {
    const userId = req.userId;

    const [codingSolved, codingTotal] = await Promise.all([
      codingModel.getSolvedCount(userId),
      codingModel.getTotalCount(),
    ]);

    const aptitudeCategoryStats = await aptitudeModel.getCategoryStats(userId);
    const aptitudeOverall = await aptitudeModel.getOverallStats(userId);

    const technicalStats = await interviewModel.getCompletionStats(userId, "Technical");
    const hrStats = await interviewModel.getCompletionStats(userId, "HR");

    const quizAttempts = await quizModel.getUserAttempts(userId);

    const summary = {
      coding: {
        solved: codingSolved,
        total: codingTotal,
        percentage: toPercentage(codingSolved, codingTotal),
      },
      aptitude: {
        attempted: aptitudeOverall.attempted || 0,
        correct: aptitudeOverall.correct || 0,
        accuracy: toPercentage(aptitudeOverall.correct || 0, aptitudeOverall.attempted || 0),
        byCategory: aptitudeCategoryStats.map((c) => ({
          category: c.category,
          attempted: c.attempted,
          correct: c.correct,
          accuracy: toPercentage(c.correct, c.attempted),
        })),
      },
      technical: {
        completed: technicalStats.completed,
        total: technicalStats.total,
        percentage: toPercentage(technicalStats.completed, technicalStats.total),
      },
      hr: {
        completed: hrStats.completed,
        total: hrStats.total,
        percentage: toPercentage(hrStats.completed, hrStats.total),
      },
      quizAttempts,
    };

    const overallPercentage = Math.round(
      (summary.coding.percentage +
        summary.aptitude.accuracy +
        summary.technical.percentage +
        summary.hr.percentage) /
        4
    );

    return success(res, 200, "Progress summary fetched.", { ...summary, overallPercentage });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
