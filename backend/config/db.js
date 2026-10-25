const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const certificatePath = path.join(
  __dirname,
  "..",
  "certs",
  "isrgrootx1 (1).pem",
);

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "club_nalu_db",

  ssl: process.env.DB_HOST
    ? {
        ca: fs.readFileSync(certificatePath, "utf8"),
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully!");
    console.log(`🏝️ Database: ${process.env.DB_NAME || "club_nalu_db"}`);
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { pool, testDatabaseConnection };
