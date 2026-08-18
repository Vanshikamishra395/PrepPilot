// server.js
// Entry point for the PrepPilot backend API.

const env = require("./config/env");
env.validateEnv();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { testConnection } = require("./config/db");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// ---- Core middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static frontend (client/) so the whole app can run from
// one server during development. In production you could also host
// the frontend separately.
app.use(express.static(path.join(__dirname, "..", "client")));

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "PrepPilot API is running." });
});

// ---- Feature routes ----
// These are added incrementally in later stages. Each line is
// uncommented as the corresponding route file is created.
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/quiz", require("./routes/quiz.routes"));
app.use("/api/coding", require("./routes/coding.routes"));
app.use("/api/aptitude", require("./routes/aptitude.routes"));
app.use("/api/interview", require("./routes/interview.routes"));
app.use("/api/progress", require("./routes/progress.routes"));
app.use("/api/recommendations", require("./routes/recommendation.routes"));
app.use("/api/chat", require("./routes/chatbot.routes"));
app.use("/api/search", require("./routes/search.routes"));

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Start server ----
const PORT = env.PORT;

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`PrepPilot server running on http://localhost:${PORT}`);
  });
}

startServer();
