const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getAdminSession,
} = require("../controllers/adminController");

const {
  getDashboardStats,
} = require("../controllers/adminDashboardController");

const { getAdminBookings } = require("../controllers/adminBookingsController");

const {
  getAdminPayments,
  decidePayment,
  viewPaymentReceipt,
} = require("../controllers/paymentController");

const { adminAuth, requireAdminRole } = require("../middleware/adminAuth");

// Admin login
router.post("/login", loginAdmin);

// Verify the current administrator session
router.get("/me", adminAuth, getAdminSession);

// Protected dashboard statistics
router.get("/dashboard-stats", adminAuth, getDashboardStats);

// Protected bookings management
router.get("/bookings", adminAuth, getAdminBookings);

// Protected payments management
router.get("/payments", adminAuth, getAdminPayments);

// View an uploaded payment receipt (authenticated administrators only)
router.get("/payments/:paymentId/receipt", adminAuth, viewPaymentReceipt);

// Approve or reject a payment
router.post(
  "/payments/:paymentId/decision",
  adminAuth,
  requireAdminRole("super_admin", "admin"),
  decidePayment,
);

module.exports = router;
