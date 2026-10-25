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

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://clubnalu.org",
  "https://www.clubnalu.org",
  "https://club-nalu-resort.onrender.com",
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. server-to-server requests)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "Expires",
  ],

  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS before other middleware and routes
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));

// Request middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public accommodation API
app.use("/api/accommodations", accommodationRoutes);

// Booking API
app.post("/api/bookings", bookingController.createBooking);

// Payment settings API
app.use("/api/payment-settings", paymentSettingsRoutes);

// Diagnostic middleware for payment requests
app.use("/api/payments", (req, res, next) => {
  console.log("PAYMENTS REQUEST REACHED SERVER:", req.method, req.originalUrl);
  next();
});

// Payment receipt upload API
app.use("/api/payments", paymentRoutes);

// Admin authentication, dashboard, bookings and payments API
app.use("/api/admin", adminRoutes);

// Admin accommodation management API
app.use("/api/admin/accommodations", adminAccommodationRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Club Nalu Resort API is running.",
  });
});

// Health check route
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
      console.log(`Club Nalu API is running on port ${PORT}`);
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
