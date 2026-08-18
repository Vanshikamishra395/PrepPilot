// routes/progress.routes.js
const express = require("express");
const router = express.Router();

const { getSummary } = require("../controllers/progress.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/summary", requireAuth, getSummary);

module.exports = router;
