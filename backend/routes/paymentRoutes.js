const express = require("express");
const router = express.Router();

const { uploadPaymentReceipt } = require("../controllers/paymentController");

const upload = require("../middleware/upload");

// Public receipt upload route
router.post(
  "/:bookingReference/receipt",
  (req, res, next) => {
    console.log("Receipt upload route reached.");
    next();
  },
  upload.single("receipt"),
  (req, res, next) => {
    console.log("Multer received file:", req.file?.originalname || "No file");
    next();
  },
  uploadPaymentReceipt,
);

module.exports = router;
