// controllers/recommendation.controller.js
const recommendationModel = require("../models/recommendation.model");
const { success } = require("../utils/response.util");

// GET /api/recommendations  (protected)
// Recommendations are generated as a side effect of quiz submission
// (see quiz.controller.js), so this endpoint simply reads the latest
// stored set. If the user hasn't taken an assessment yet, the list
// will be empty and the frontend prompts them to take one.
async function getRecommendations(req, res, next) {
  try {
    const recommendations = await recommendationModel.getRecommendations(req.userId);
    return success(res, 200, "Recommendations fetched.", { recommendations });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
