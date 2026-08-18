// controllers/user.controller.js
const userModel = require("../models/user.model");
const codingModel = require("../models/coding.model");
const aptitudeModel = require("../models/aptitude.model");
const interviewModel = require("../models/interview.model");
const { success, error } = require("../utils/response.util");

// Turns a "completed / total" pair into a rounded percentage, safely
// handling the case where total is 0 (nothing seeded yet).
function toPercentage(part, total) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

// GET /api/user/profile  (protected)
// req.userId is set by the requireAuth middleware.
async function getProfile(req, res, next) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return error(res, 404, "User not found.");
    }

    const skillLevel = await userModel.getSkillLevel(req.userId);

    return success(res, 200, "Profile fetched successfully.", {
      user,
      skillLevel: skillLevel ? skillLevel.skill_level : null,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/user/dashboard  (protected)
// Pulls together stats from every module so the dashboard can render
// in a single request instead of the frontend firing four separate calls.
async function getDashboard(req, res, next) {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) return error(res, 404, "User not found.");

    const skillLevelRow = await userModel.getSkillLevel(userId);

    const [codingSolved, codingTotal] = await Promise.all([
      codingModel.getSolvedCount(userId),
      codingModel.getTotalCount(),
    ]);

    const aptitudeOverall = await aptitudeModel.getOverallStats(userId);

    const technicalStats = await interviewModel.getCompletionStats(userId, "Technical");
    const hrStats = await interviewModel.getCompletionStats(userId, "HR");

    const progress = {
      coding: toPercentage(codingSolved, codingTotal),
      aptitude: toPercentage(aptitudeOverall.correct || 0, aptitudeOverall.attempted || 0),
      technical: toPercentage(technicalStats.completed, technicalStats.total),
      hr: toPercentage(hrStats.completed, hrStats.total),
    };

    const overall = Math.round(
      (progress.coding + progress.aptitude + progress.technical + progress.hr) / 4
    );

    return success(res, 200, "Dashboard data fetched.", {
      user,
      skillLevel: skillLevelRow ? skillLevelRow.skill_level : null,
      progress: { ...progress, overall },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, getDashboard };
