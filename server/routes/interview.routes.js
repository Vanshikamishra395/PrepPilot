// routes/interview.routes.js
const express = require("express");
const router = express.Router();

const {
  getTechnical,
  getHR,
  markProgress,
  getProgress,
} = require("../controllers/interview.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/technical", getTechnical);
router.get("/hr", getHR);
router.get("/progress", requireAuth, getProgress);
router.post("/progress", requireAuth, markProgress);

module.exports = router;
