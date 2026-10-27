const { pool } = require("../config/db");

// GET /api/payment-settings
// Public endpoint: retrieve bank transfer and GCash settings.
async function getPaymentSettings(req, res) {
  try {
    const [rows] = await pool.execute(`       SELECT
        bank_name,
        account_name,
        account_number,
        branch_name,
        payment_instructions,
        gcash_number,
        gcash_account_name,
        gcash_instructions,
        gcash_enabled,
        updated_at
      FROM payment_settings
      ORDER BY id ASC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment settings have not been configured.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Failed to retrieve payment settings:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payment settings.",
    });
  }
}

// PUT /api/payment-settings
// Protected endpoint: update Bank Transfer and GCash settings.
async function updatePaymentSettings(req, res) {
  try {
    const {
      bank_name,
      account_name,
      account_number,
      branch_name,
      payment_instructions,
      gcash_number,
      gcash_account_name,
      gcash_instructions,
      gcash_enabled,
    } = req.body;

    // Existing Bank Transfer fields remain required.
    if (
      typeof bank_name !== "string" ||
      !bank_name.trim() ||
      typeof account_name !== "string" ||
      !account_name.trim() ||
      typeof account_number !== "string" ||
      !account_number.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Bank name, account name, and account number are required.",
      });
    }

    // Validate field types and lengths.
    if (
      bank_name.trim().length > 150 ||
      account_name.trim().length > 150 ||
      account_number.trim().length > 100 ||
      (branch_name != null &&
        (typeof branch_name !== "string" || branch_name.trim().length > 100)) ||
      (gcash_number != null &&
        (typeof gcash_number !== "string" ||
          gcash_number.trim().length > 50)) ||
      (gcash_account_name != null &&
        (typeof gcash_account_name !== "string" ||
          gcash_account_name.trim().length > 150))
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more payment details are invalid or too long.",
      });
    }

    if (
      payment_instructions != null &&
      typeof payment_instructions !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bank payment instructions must be text.",
      });
    }

    if (gcash_instructions != null && typeof gcash_instructions !== "string") {
      return res.status(400).json({
        success: false,
        message: "GCash payment instructions must be text.",
      });
    }

    const gcashEnabled =
      gcash_enabled === true || gcash_enabled === 1 || gcash_enabled === "1"
        ? 1
        : 0;

    // Do not enable GCash without its required details.
    if (
      gcashEnabled &&
      (!gcash_number?.trim() || !gcash_account_name?.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter the GCash number and account name before enabling GCash.",
      });
    }

    const [existingRows] = await pool.execute(
      "SELECT id FROM payment_settings ORDER BY id ASC LIMIT 1",
    );

    const values = [
      bank_name.trim(),
      account_name.trim(),
      account_number.trim(),
      branch_name?.trim() || null,
      payment_instructions?.trim() || null,
      gcash_number?.trim() || null,
      gcash_account_name?.trim() || null,
      gcash_instructions?.trim() || null,
      gcashEnabled,
    ];

    if (existingRows.length > 0) {
      await pool.execute(
        `UPDATE payment_settings
     SET bank_name = ?,
         account_name = ?,
         account_number = ?,
         branch_name = ?,
         payment_instructions = ?,
         gcash_number = ?,
         gcash_account_name = ?,
         gcash_instructions = ?,
         gcash_enabled = ?
     WHERE id = ?`,
        [...values, existingRows[0].id],
      );
    } else {
      await pool.execute(
        `INSERT INTO payment_settings (
       bank_name,
       account_name,
       account_number,
       branch_name,
       payment_instructions,
       gcash_number,
       gcash_account_name,
       gcash_instructions,
       gcash_enabled
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
      );
    }

    const [updatedRows] = await pool.execute(`
  SELECT
    bank_name,
    account_name,
    account_number,
    branch_name,
    payment_instructions,
    gcash_number,
    gcash_account_name,
    gcash_instructions,
    gcash_enabled,
    updated_at
  FROM payment_settings
  ORDER BY id ASC
  LIMIT 1
`);

    return res.status(200).json({
      success: true,
      message: "Payment settings updated successfully.",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("Failed to update payment settings:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update payment settings.",
    });
  }
}

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
};
