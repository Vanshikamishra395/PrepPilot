// routes/chatbot.routes.js
const express = require("express");
const router = express.Router();

const { sendMessage, getHistory } = require("../controllers/chatbot.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, sendMessage);
router.get("/history", requireAuth, getHistory);

module.exports = router;
