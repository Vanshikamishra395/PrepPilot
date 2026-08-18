// routes/quiz.routes.js
const express = require("express");
const router = express.Router();

const { getLevel1, getLevel2, submitQuiz, getHistory } = require("../controllers/quiz.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/level1", requireAuth, getLevel1);
router.get("/level2", requireAuth, getLevel2);
router.post("/submit", requireAuth, submitQuiz);
router.get("/history", requireAuth, getHistory);

module.exports = router;
