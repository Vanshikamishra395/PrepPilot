// controllers/coding.controller.js
const codingModel = require("../models/coding.model");
const { success, error } = require("../utils/response.util");

// GET /api/coding/problems?topic=&difficulty=&search=
async function listProblems(req, res, next) {
  try {
    const { topic, difficulty, search } = req.query;
    const problems = await codingModel.getProblems({ topic, difficulty, search });
    return success(res, 200, "Problems fetched.", { problems });
  } catch (err) {
    next(err);
  }
}

// GET /api/coding/problems/:id
async function getProblem(req, res, next) {
  try {
    const problem = await codingModel.getProblemById(req.params.id);
    if (!problem) return error(res, 404, "Problem not found.");
    return success(res, 200, "Problem fetched.", { problem });
  } catch (err) {
    next(err);
  }
}

// POST /api/coding/progress  (protected)  body: { problemId, status }
async function markProgress(req, res, next) {
  try {
    const { problemId, status } = req.body;
    if (!problemId || !["Not Started", "Completed"].includes(status)) {
      return error(res, 400, "problemId and a valid status are required.");
    }
    await codingModel.upsertProgress(req.userId, problemId, status);
    return success(res, 200, "Progress updated.");
  } catch (err) {
    next(err);
  }
}

// GET /api/coding/progress  (protected)
async function getProgress(req, res, next) {
  try {
    const progressMap = await codingModel.getUserProgressMap(req.userId);
    const solved = await codingModel.getSolvedCount(req.userId);
    const total = await codingModel.getTotalCount();
    return success(res, 200, "Progress fetched.", { progressMap, solved, total });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProblems, getProblem, markProgress, getProgress };
