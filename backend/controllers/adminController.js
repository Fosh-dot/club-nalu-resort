const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validate login details.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the administrator account.
    const [admins] = await pool.execute(
      `SELECT
         id,
         full_name,
         email,
         password_hash,
         role,
         is_active
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail],
    );

    if (!admins.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];

    // Do not allow inactive administrator accounts to log in.
    if (admin.is_active === false || Number(admin.is_active) !== 1) {
      return res.status(403).json({
        success: false,
        message: "This administrator account is inactive.",
      });
    }

    // Verify the password.
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Ensure JWT authentication is configured.
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from the backend environment.");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured correctly.",
      });
    }

    // Generate the administrator authentication token.
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
        issuer: "club-nalu-api",
        audience: "club-nalu-admin",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        admin: {
          id: admin.id,
          fullName: admin.full_name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time.",
    });
  }
};

const getAdminSession = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      admin: req.admin,
    },
  });
};

module.exports = {
  loginAdmin,
  getAdminSession,
};
