// routes/coding.routes.js
const express = require("express");
const router = express.Router();

const {
  listProblems,
  getProblem,
  markProgress,
  getProgress,
} = require("../controllers/coding.controller");
const { requireAuth } = require("../middleware/auth.middleware");

// Public: anyone can browse problems (matches most real coding-practice sites)
router.get("/problems", listProblems);
router.get("/problems/:id", getProblem);

// Protected: progress is tied to a specific user
router.get("/progress", requireAuth, getProgress);
router.post("/progress", requireAuth, markProgress);

module.exports = router;
