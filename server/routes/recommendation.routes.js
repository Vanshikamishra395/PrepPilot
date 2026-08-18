// routes/recommendation.routes.js
const express = require("express");
const router = express.Router();

const { getRecommendations } = require("../controllers/recommendation.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/", requireAuth, getRecommendations);

module.exports = router;
