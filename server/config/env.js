// config/env.js
// Loads environment variables from .env and makes sure the important
// ones actually exist before the server starts. This avoids confusing
// runtime errors later (e.g. "Cannot read property of undefined").

require("dotenv").config();

const requiredVars = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
];

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    console.error("Check your .env file against .env.example");
    process.exit(1);
  }
}

module.exports = {
  validateEnv,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  LLM_API_KEY: process.env.LLM_API_KEY,
  LLM_API_URL: process.env.LLM_API_URL,
  LLM_MODEL: process.env.LLM_MODEL || "claude-sonnet-4-6",
};
