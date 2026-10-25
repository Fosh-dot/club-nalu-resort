const { pool } = require("../config/db");

// GET /api/payment-settings
// Public endpoint: retrieve the current bank transfer details.
async function getPaymentSettings(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        bank_name,
        account_name,
        account_number,
        branch_name,
        payment_instructions,
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
// Protected endpoint: update the resort's bank transfer details.
async function updatePaymentSettings(req, res) {
  try {
    const {
      bank_name,
      account_name,
      account_number,
      branch_name,
      payment_instructions,
    } = req.body;

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

    if (
      bank_name.trim().length > 150 ||
      account_name.trim().length > 150 ||
      account_number.trim().length > 100 ||
      (branch_name != null &&
        (typeof branch_name !== "string" || branch_name.trim().length > 100))
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more bank details exceed the allowed length.",
      });
    }

    if (
      payment_instructions != null &&
      typeof payment_instructions !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment instructions must be text.",
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
    ];

    if (existingRows.length > 0) {
      await pool.execute(
        `UPDATE payment_settings
         SET bank_name = ?,
             account_name = ?,
             account_number = ?,
             branch_name = ?,
             payment_instructions = ?
         WHERE id = ?`,
        [...values, existingRows[0].id],
      );
    } else {
      await pool.execute(
        `INSERT INTO payment_settings
          (bank_name, account_name, account_number, branch_name, payment_instructions)
         VALUES (?, ?, ?, ?, ?)`,
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
        updated_at
      FROM payment_settings
      ORDER BY id ASC
      LIMIT 1
    `);

    return res.status(200).json({
      success: true,
      message: "Bank settings updated successfully.",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("Failed to update payment settings:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update bank settings.",
    });
  }
}

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
};
