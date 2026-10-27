const path = require("path");
const fs = require("fs/promises");
const { pool } = require("../config/db");
const { sendPaymentDecisionEmail } = require("../utils/emailService");

// POST /api/payments/:bookingReference/receipt
async function uploadPaymentReceipt(req, res) {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: "Please upload a payment receipt.",
    });
  }

  const bookingReference = String(req.params.bookingReference || "")
    .trim()
    .toUpperCase();

  if (!/^CN-[A-F0-9]{12}$/.test(bookingReference)) {
    await fs.unlink(uploadedFile.path).catch(() => {});

    return res.status(400).json({
      success: false,
      message: "Invalid booking reference.",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT
         b.id AS booking_id,
         b.booking_reference,
         p.id AS payment_id,
         p.payment_status
       FROM bookings b
       INNER JOIN payments p ON p.booking_id = b.id
       WHERE b.booking_reference = ?
       ORDER BY p.id DESC
       LIMIT 1
       FOR UPDATE`,
      [bookingReference],
    );

    if (rows.length === 0) {
      await connection.rollback();
      await fs.unlink(uploadedFile.path).catch(() => {});

      return res.status(404).json({
        success: false,
        message: "Booking or payment record not found.",
      });
    }

    const payment = rows[0];

    if (
      payment.payment_status === "approved" ||
      payment.payment_status === "refunded"
    ) {
      await connection.rollback();
      await fs.unlink(uploadedFile.path).catch(() => {});

      return res.status(409).json({
        success: false,
        message: "This payment can no longer accept a receipt.",
      });
    }

    const receiptPath = path
      .relative(process.cwd(), uploadedFile.path)
      .split(path.sep)
      .join("/");

    // Save the receipt without overwriting the guest's selected payment method.
    await connection.execute(
      `UPDATE payments
       SET payment_slip_path = ?,
           payment_status = 'pending_verification',
           verified_by = NULL,
           verified_at = NULL
       WHERE id = ?`,
      [receiptPath, payment.payment_id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        "Receipt uploaded successfully. Your payment is awaiting review.",
      data: {
        bookingReference: payment.booking_reference,
        paymentStatus: "pending_verification",
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    await fs.unlink(uploadedFile.path).catch(() => {});

    console.error("Payment receipt upload failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save your payment receipt.",
    });
  } finally {
    if (connection) connection.release();
  }
}

// GET /api/admin/payments
async function getAdminPayments(req, res) {
  try {
    const [payments] = await pool.query(`
      SELECT
        p.id AS payment_id,
        p.booking_id,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.payment_slip_path,
        p.transaction_reference,
        p.admin_notes,
        p.verified_by,
        p.verified_at,
        p.created_at,
        b.booking_reference,
        b.check_in,
        b.check_out,
        g.first_name,
        g.last_name,
        g.email,
        g.phone,
        a.name AS accommodation_name
      FROM payments p
      INNER JOIN bookings b ON b.id = p.booking_id
      LEFT JOIN guests g ON g.id = b.guest_id
      LEFT JOIN accommodations a ON a.id = b.accommodation_id
      ORDER BY
        CASE
          WHEN p.payment_status = 'pending_verification' THEN 0
          ELSE 1
        END,
        p.created_at DESC
      LIMIT 200
    `);

    return res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error("Admin payments query failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load payment records.",
    });
  }
}

// POST /api/admin/payments/:paymentId/decision
async function decidePayment(req, res) {
  const paymentId = Number(req.params.paymentId);
  const { decision, reason } = req.body || {};

  if (!Number.isSafeInteger(paymentId) || paymentId < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment ID.",
    });
  }

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Decision must be approved or rejected.",
    });
  }

  if (
    decision === "rejected" &&
    (typeof reason !== "string" || !reason.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a reason for rejecting the payment.",
    });
  }

  if (!req.admin || !req.admin.id) {
    return res.status(401).json({
      success: false,
      message: "Administrator authentication required.",
    });
  }

  let connection;
  let guestDetails;
  let adminNotes;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get payment and guest information for the notification email.
    const [rows] = await connection.execute(
      `SELECT
         p.id,
         p.payment_status,
         p.payment_slip_path,
         b.booking_reference,
         g.first_name,
         g.last_name,
         g.email
       FROM payments p
       INNER JOIN bookings b ON b.id = p.booking_id
       LEFT JOIN guests g ON g.id = b.guest_id
       WHERE p.id = ?
       LIMIT 1
       FOR UPDATE`,
      [paymentId],
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    const payment = rows[0];

    if (payment.payment_status !== "pending_verification") {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "Only payments awaiting verification can be reviewed.",
      });
    }

    if (decision === "approved" && !payment.payment_slip_path) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "A receipt must be uploaded before approval.",
      });
    }

    adminNotes = decision === "rejected" ? reason.trim() : null;

    await connection.execute(
      `UPDATE payments
       SET payment_status = ?,
           verified_by = ?,
           verified_at = CURRENT_TIMESTAMP,
           admin_notes = ?
       WHERE id = ?`,
      [decision, req.admin.id, adminNotes, paymentId],
    );

    guestDetails = {
      recipientEmail: payment.email,
      guestName:
        [payment.first_name, payment.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || "Guest",
      bookingReference: payment.booking_reference,
    };

    // Save the payment decision before attempting to send an email.
    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error("Payment decision failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update payment status.",
    });
  } finally {
    if (connection) connection.release();
  }

  // Send the email after the payment decision has been committed.
  // An email failure must not undo the payment decision.
  let emailSent = false;

  if (guestDetails && guestDetails.recipientEmail) {
    try {
      const emailResult = await sendPaymentDecisionEmail({
        ...guestDetails,
        decision,
        rejectionReason: adminNotes,
      });

      emailSent = emailResult?.sent === true;

      if (!emailSent) {
        console.warn(
          `Payment decision email was not sent for booking ${guestDetails.bookingReference}:`,
          emailResult?.reason || "Unknown email error.",
        );
      }
    } catch (error) {
      console.error("Payment notification email failed:", error.message);
    }
  } else {
    console.warn(`No guest email address found for payment ${paymentId}.`);
  }

  return res.status(200).json({
    success: true,
    message:
      decision === "approved"
        ? "Payment approved successfully."
        : "Payment rejected successfully.",
    data: {
      paymentId,
      paymentStatus: decision,
      verifiedBy: req.admin.id,
      verifiedAt: new Date().toISOString(),
      rejectionReason: decision === "rejected" ? adminNotes : null,
      emailSent,
    },
  });
}

// GET /api/admin/payments/:paymentId/receipt
// Only authenticated administrators should reach this controller.
async function viewPaymentReceipt(req, res) {
  const paymentId = Number(req.params.paymentId);

  if (!Number.isSafeInteger(paymentId) || paymentId < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment ID.",
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT payment_slip_path
       FROM payments
       WHERE id = ?
       LIMIT 1`,
      [paymentId],
    );

    if (!rows.length || !rows[0].payment_slip_path) {
      return res.status(404).json({
        success: false,
        message: "No receipt was found for this payment.",
      });
    }

    const uploadRoot = path.resolve(process.cwd(), "uploads", "receipts");
    const storedPath = path.resolve(process.cwd(), rows[0].payment_slip_path);

    // Restrict file access to the receipts directory.
    if (
      storedPath === uploadRoot ||
      !storedPath.startsWith(uploadRoot + path.sep)
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid receipt file path.",
      });
    }

    let fileStat;

    try {
      fileStat = await fs.stat(storedPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: "The receipt file could not be found on the server.",
      });
    }

    if (!fileStat.isFile()) {
      return res.status(404).json({
        success: false,
        message: "The receipt file is unavailable.",
      });
    }

    const extension = path.extname(storedPath).toLowerCase();

    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
    };

    const contentType = contentTypes[extension];

    if (!contentType) {
      return res.status(415).json({
        success: false,
        message: "Unsupported receipt file type.",
      });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="payment-receipt-${paymentId}${extension}"`,
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");

    return res.sendFile(storedPath);
  } catch (error) {
    console.error("Receipt viewing failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to open the payment receipt.",
    });
  }
}

module.exports = {
  uploadPaymentReceipt,
  getAdminPayments,
  decidePayment,
  viewPaymentReceipt,
};
