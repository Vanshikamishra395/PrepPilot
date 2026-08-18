// routes/search.routes.js
const express = require("express");
const router = express.Router();

const { search } = require("../controllers/search.controller");

// Public: search results themselves don't reveal anything user-specific.
router.get("/", search);

module.exports = router;
