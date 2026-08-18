// routes/aptitude.routes.js
const express = require("express");
const router = express.Router();

const {
  listQuestions,
  submitAnswer,
  getProgress,
} = require("../controllers/aptitude.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/questions", listQuestions);
router.get("/progress", requireAuth, getProgress);
router.post("/submit", requireAuth, submitAnswer);

module.exports = router;
