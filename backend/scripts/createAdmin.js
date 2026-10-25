require("dotenv").config();

const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const readline = require("readline");
const { stdin, stdout } = require("process");

const rl = readline.createInterface({ input: stdin, output: stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function createAdmin() {
  try {
    const fullName = (await ask("Administrator full name: ")).trim();
    const email = (await ask("Administrator email: ")).trim().toLowerCase();
    const password = await ask("Administrator password: ");

    if (!fullName || !email || !password) {
      throw new Error("All fields are required.");
    }

    if (password.length < 12) {
      throw new Error("Use a password with at least 12 characters.");
    }

    const [existing] = await pool.execute(
      "SELECT id FROM admins WHERE email = ? LIMIT 1",
      [email],
    );

    if (existing.length) {
      throw new Error(
        "An administrator with this email already exists. No changes were made.",
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO admins (full_name, email, password_hash, role, is_active)
   VALUES (?, ?, ?, 'super_admin', 1)`,
      [fullName, email, passwordHash],
    );

    console.log("\nAdministrator account created successfully.");
    console.log(`Email: ${email}`);
    console.log("Role: super_admin");
    console.log("Keep your password private.");
  } catch (error) {
    console.error("\nCould not create administrator:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin();
