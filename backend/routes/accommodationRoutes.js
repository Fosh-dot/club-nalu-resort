const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");

// GET /api/accommodations
// Retrieve all active accommodations.
router.get("/", async (req, res) => {
  try {
    const [accommodations] = await pool.execute(
      `SELECT
        id,
        name,
        description,
        price_per_night,
        max_adults,
        max_children,
        total_units,
        image_url
      FROM accommodations
      WHERE is_active = TRUE
      ORDER BY id DESC`,
    );

    return res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations,
    });
  } catch (error) {
    console.error("Failed to retrieve accommodations:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve accommodations.",
    });
  }
});

// GET /api/accommodations/:id
// Retrieve one active accommodation by ID.
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid accommodation ID.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
        id,
        name,
        description,
        price_per_night,
        max_adults,
        max_children,
        total_units,
        image_url
      FROM accommodations
      WHERE id = ? AND is_active = TRUE`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to retrieve accommodation:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve accommodation.",
    });
  }
});

module.exports = router;
