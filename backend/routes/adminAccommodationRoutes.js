const express = require("express");
const router = express.Router();

const {
  getAdminAccommodations,
  createAccommodation,
  updateAccommodation,
} = require("../controllers/adminAccommodationController");

const { adminAuth, requireAdminRole } = require("../middleware/adminAuth");

// Only your designated super administrator can access accommodation management.

// GET /api/admin/accommodations
// Retrieve accommodation records.
router.get(
  "/",
  adminAuth,
  requireAdminRole("super_admin"),
  getAdminAccommodations,
);

// POST /api/admin/accommodations
// Create a new accommodation.
router.post(
  "/",
  adminAuth,
  requireAdminRole("super_admin"),
  createAccommodation,
);

// PUT /api/admin/accommodations/:id
// Update accommodation details and prices.
router.put(
  "/:id",
  adminAuth,
  requireAdminRole("super_admin"),
  updateAccommodation,
);

module.exports = router;
