require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { testDatabaseConnection } = require("./config/db");

const accommodationRoutes = require("./routes/accommodationRoutes");
const bookingController = require("./controllers/bookingController");
const paymentSettingsRoutes = require("./routes/paymentSettingsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminAccommodationRoutes = require("./routes/adminAccommodationRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public Accommodation API
app.use("/api/accommodations", accommodationRoutes);

// Booking API
app.post("/api/bookings", bookingController.createBooking);

// Payment Settings API
app.use("/api/payment-settings", paymentSettingsRoutes);

// Diagnostic middleware: confirms payment requests reach this server.
app.use("/api/payments", (req, res, next) => {
  console.log("PAYMENTS REQUEST REACHED SERVER:", req.method, req.originalUrl);
  next();
});

// Payment Receipt Upload API
app.use("/api/payments", paymentRoutes);

// Admin Authentication, Dashboard, Bookings and Payments API
app.use("/api/admin", adminRoutes);

// Admin Accommodation Management API
app.use("/api/admin/accommodations", adminAccommodationRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Club Nalu Resort API is running.",
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Club Nalu API is healthy.",
  });
});

// Start server after testing the database connection
async function startServer() {
  try {
    await testDatabaseConnection();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Club Nalu API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Server startup failed because the database is unavailable:",
      error.message,
    );

    process.exit(1);
  }
}

startServer();
