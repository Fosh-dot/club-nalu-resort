const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "club_nalu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("✅ MySQL connected successfully!");
    console.log("🏝️ Database: club_nalu_db");

    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    throw error;
  }
}

module.exports = { pool, testDatabaseConnection };
