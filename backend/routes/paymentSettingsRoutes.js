const express = require("express");
const router = express.Router();

const {
  getPaymentSettings,
  updatePaymentSettings,
} = require("../controllers/paymentSettingsController");

const { adminAuth, requireAdminRole } = require("../middleware/adminAuth");

// Public endpoint: guests can retrieve the bank details.
router.get("/", getPaymentSettings);

// Protected endpoint: authenticated administrators can update bank details.
router.put(
  "/",
  adminAuth,
  requireAdminRole("super_admin", "admin"),
  updatePaymentSettings,
);

module.exports = router;
