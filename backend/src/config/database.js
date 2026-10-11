const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../eos_env.env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "eos_user",
  password: process.env.DB_PASSWORD || "eos_password",
  database: process.env.DB_NAME || "eos",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  timezone: "+01:00", // Tunis time — matches how starts_at/ends_at were inserted
});

module.exports = pool;
