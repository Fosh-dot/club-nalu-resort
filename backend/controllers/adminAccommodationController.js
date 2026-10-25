const { pool } = require("../config/db");

// GET /api/admin/accommodations
// Retrieve all accommodations, including inactive ones.
const getAdminAccommodations = async (req, res) => {
  try {
    const [accommodations] = await pool.execute(`
      SELECT
        id,
        name,
        description,
        price_per_night,
        max_adults,
        max_children,
        total_units,
        image_url,
        is_active,
        created_at
      FROM accommodations
      ORDER BY id DESC
    `);

    return res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations,
    });
  } catch (error) {
    console.error("Failed to retrieve admin accommodations:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve accommodations.",
    });
  }
};

// POST /api/admin/accommodations
// Create a new accommodation.
const createAccommodation = async (req, res) => {
  try {
    const {
      name,
      description = "",
      price_per_night,
      max_adults = 2,
      max_children = 0,
      total_units = 1,
      image_url = null,
      is_active = false,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Accommodation name is required.",
      });
    }

    const price = Number(price_per_night);
    const adults = Number(max_adults);
    const children = Number(max_children);
    const units = Number(total_units);

    if (
      price_per_night === undefined ||
      price_per_night === null ||
      price_per_night === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid nightly price is required.",
      });
    }

    if (!Number.isInteger(adults) || adults < 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum adults must be at least 1.",
      });
    }

    if (!Number.isInteger(children) || children < 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum children cannot be negative.",
      });
    }

    if (!Number.isInteger(units) || units < 1) {
      return res.status(400).json({
        success: false,
        message: "Total units must be at least 1.",
      });
    }

    const active =
      is_active === true ||
      is_active === 1 ||
      is_active === "1" ||
      is_active === "true";

    const [result] = await pool.execute(
      `
      INSERT INTO accommodations (
        name,
        description,
        price_per_night,
        max_adults,
        max_children,
        total_units,
        image_url,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        description,
        price,
        adults,
        children,
        units,
        image_url || null,
        active,
      ],
    );

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        name,
        description,
        price_per_night,
        max_adults,
        max_children,
        total_units,
        image_url,
        is_active,
        created_at
      FROM accommodations
      WHERE id = ?
      `,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: "Accommodation created successfully.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to create accommodation:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create accommodation.",
    });
  }
};

// PUT /api/admin/accommodations/:id
// Update an existing accommodation.
const updateAccommodation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid accommodation ID.",
      });
    }

    const [existingRows] = await pool.execute(
      "SELECT * FROM accommodations WHERE id = ?",
      [id],
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found.",
      });
    }

    const existing = existingRows[0];

    const {
      name,
      description,
      price_per_night,
      max_adults,
      max_children,
      total_units,
      image_url,
      is_active,
    } = req.body;

    const updatedName = name === undefined ? existing.name : name;
    const updatedDescription =
      description === undefined ? existing.description : description;

    const updatedPrice =
      price_per_night === undefined
        ? Number(existing.price_per_night)
        : Number(price_per_night);

    const updatedAdults =
      max_adults === undefined ? existing.max_adults : Number(max_adults);

    const updatedChildren =
      max_children === undefined ? existing.max_children : Number(max_children);

    const updatedUnits =
      total_units === undefined ? existing.total_units : Number(total_units);

    const updatedImage =
      image_url === undefined ? existing.image_url : image_url || null;

    let updatedActive = existing.is_active;

    if (is_active !== undefined) {
      if (![true, false, 1, 0, "1", "0", "true", "false"].includes(is_active)) {
        return res.status(400).json({
          success: false,
          message: "is_active must be true or false.",
        });
      }

      updatedActive =
        is_active === true ||
        is_active === 1 ||
        is_active === "1" ||
        is_active === "true";
    }

    if (typeof updatedName !== "string" || !updatedName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Accommodation name is required.",
      });
    }

    if (
      !Number.isFinite(updatedPrice) ||
      updatedPrice < 0 ||
      !Number.isInteger(updatedAdults) ||
      updatedAdults < 1 ||
      !Number.isInteger(updatedChildren) ||
      updatedChildren < 0 ||
      !Number.isInteger(updatedUnits) ||
      updatedUnits < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid prices, occupancy limits, and unit inventory.",
      });
    }

    await pool.execute(
      `
      UPDATE accommodations
      SET
        name = ?,
        description = ?,
        price_per_night = ?,
        max_adults = ?,
        max_children = ?,
        total_units = ?,
        image_url = ?,
        is_active = ?
      WHERE id = ?
      `,
      [
        updatedName.trim(),
        updatedDescription,
        updatedPrice,
        updatedAdults,
        updatedChildren,
        updatedUnits,
        updatedImage,
        updatedActive,
        id,
      ],
    );

    const [updatedRows] = await pool.execute(
      `
      SELECT
        id,
        name,
        description,
        price_per_night,
        max_adults,
        max_children,
        total_units,
        image_url,
        is_active,
        created_at
      FROM accommodations
      WHERE id = ?
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Accommodation updated successfully.",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("Failed to update accommodation:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update accommodation.",
    });
  }
};

module.exports = {
  getAdminAccommodations,
  createAccommodation,
  updateAccommodation,
};
