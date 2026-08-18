// routes/user.routes.js
const express = require("express");
const router = express.Router();

const { getProfile, getDashboard } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/profile", requireAuth, getProfile);
router.get("/dashboard", requireAuth, getDashboard);

module.exports = router;
