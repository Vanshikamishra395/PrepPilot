// config/db.js
// Creates a single reusable MySQL connection pool.
// A pool (instead of one connection) lets multiple requests query the
// database at the same time without waiting on each other.

const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Quick check used at startup so we fail fast with a clear message
// instead of the app silently not working.
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully.");
    connection.release();
  } catch (err) {
    console.error("Failed to connect to MySQL:", err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
