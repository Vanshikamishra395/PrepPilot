// controllers/search.controller.js
const searchModel = require("../models/search.model");
const { success, error } = require("../utils/response.util");

// GET /api/search?q=...&type=coding|aptitude|technical|hr (type optional)
async function search(req, res, next) {
  try {
    const term = (req.query.q || "").trim();
    const { type } = req.query;

    if (!term) {
      return error(res, 400, "A search query (q) is required.");
    }

    if (type) {
      let results;
      if (type === "coding") results = await searchModel.searchCoding(term);
      else if (type === "aptitude") results = await searchModel.searchAptitude(term);
      else if (type === "technical") results = await searchModel.searchInterview(term, "Technical");
      else if (type === "hr") results = await searchModel.searchInterview(term, "HR");
      else return error(res, 400, "Invalid type filter.");

      return success(res, 200, "Search results fetched.", { [type]: results });
    }

    const results = await searchModel.searchAll(term);
    return success(res, 200, "Search results fetched.", results);
  } catch (err) {
    next(err);
  }
}

module.exports = { search };
