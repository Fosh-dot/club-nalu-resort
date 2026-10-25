const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from the backend environment.");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured correctly.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "club-nalu-api",
      audience: "club-nalu-admin",
    });

    const [admins] = await pool.execute(
      `SELECT id, full_name, email, role, is_active
   FROM admins
   WHERE id = ?
   LIMIT 1`,
      [decoded.id],
    );

    if (!admins.length || !admins[0].is_active) {
      return res.status(401).json({
        success: false,
        message: "This administrator account is unavailable.",
      });
    }

    req.admin = {
      id: admins[0].id,
      fullName: admins[0].full_name,
      email: admins[0].email,
      role: admins[0].role,
    };

    return next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please sign in again.",
      });
    }

    console.error("Admin authentication failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access.",
    });
  }
}

function requireAdminRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
}

module.exports = { adminAuth, requireAdminRole };
