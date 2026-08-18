// controllers/interview.controller.js
const interviewModel = require("../models/interview.model");
const { success, error } = require("../utils/response.util");

// GET /api/interview/technical?topic=
async function getTechnical(req, res, next) {
  try {
    const { topic } = req.query;
    const resources = await interviewModel.getResources({ type: "Technical", topic });
    return success(res, 200, "Technical resources fetched.", { resources });
  } catch (err) {
    next(err);
  }
}

// GET /api/interview/hr
async function getHR(req, res, next) {
  try {
    const resources = await interviewModel.getResources({ type: "HR" });
    return success(res, 200, "HR resources fetched.", { resources });
  } catch (err) {
    next(err);
  }
}

// POST /api/interview/progress  (protected)  body: { resourceId, isCompleted }
async function markProgress(req, res, next) {
  try {
    const { resourceId, isCompleted } = req.body;
    if (!resourceId || typeof isCompleted !== "boolean") {
      return error(res, 400, "resourceId and isCompleted (boolean) are required.");
    }
    await interviewModel.markCompleted(req.userId, resourceId, isCompleted);
    return success(res, 200, "Progress updated.");
  } catch (err) {
    next(err);
  }
}

// GET /api/interview/progress?type=Technical|HR  (protected)
async function getProgress(req, res, next) {
  try {
    const type = req.query.type === "HR" ? "HR" : "Technical";
    const progressMap = await interviewModel.getUserProgressMap(req.userId, type);
    const stats = await interviewModel.getCompletionStats(req.userId, type);
    return success(res, 200, "Progress fetched.", { progressMap, stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTechnical, getHR, markProgress, getProgress };
