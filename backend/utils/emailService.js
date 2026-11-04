const nodemailer = require("nodemailer");

// Create Gmail transporter
const createTransporter = () => {
  const { EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;

  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
    console.warn(
      "Email notifications are disabled. Email credentials are not configured.",
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });
};

// Escape dynamic values before inserting them into HTML.
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

// Format Philippine Peso.
const formatPHP = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(amount) || 0);

// ==========================================
// BOOKING RECEIVED EMAIL
// ==========================================

const sendBookingReceivedEmail = async ({
  recipientEmail,
  guestName,
  bookingReference,
  accommodation,
  checkIn,
  checkOut,
  nights,
  adults,
  children,
  rooms,
  totalAmount,
  paymentMethod,
}) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are not configured.",
    };
  }

  const safe = {
    guestName: escapeHtml(guestName),
    bookingReference: escapeHtml(bookingReference),
    accommodation: escapeHtml(accommodation),
    checkIn: escapeHtml(checkIn),
    checkOut: escapeHtml(checkOut),
    nights: escapeHtml(nights),
    adults: escapeHtml(adults),
    children: escapeHtml(children),
    rooms: escapeHtml(rooms),
    paymentMethod: escapeHtml(
      paymentMethod === "gcash" ? "GCash" : "Bank Transfer",
    ),
    totalAmount: escapeHtml(formatPHP(totalAmount)),
  };

  const subject = `Reservation Received – ${bookingReference}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <body style="
    margin:0;
    padding:30px 15px;
    background:#f4f6f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#333;
  ">

    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      overflow:hidden;
    ">

      <div style="
        background:#174c46;
        padding:35px 25px;
        text-align:center;
      ">

        <h1 style="
          color:#ffffff;
          margin:0;
          letter-spacing:5px;
          font-size:28px;
        ">
          CLUB NALU
        </h1>

        <p style="
          color:#d5e6df;
          margin:10px 0 0;
          font-size:12px;
          letter-spacing:2px;
        ">
          YOUR ISLAND ESCAPE
        </p>

      </div>

      <div style="padding:35px 30px;">

        <p>Dear ${safe.guestName},</p>

        <h2 style="color:#174c46;">
          We've received your reservation!
        </h2>

        <p style="line-height:1.7;color:#666;">
          Thank you for choosing Club Nalu Resort.
          Your reservation request has been successfully received.
          We're delighted that you're considering staying with us.
        </p>

        <div style="
          background:#f2f7f5;
          padding:22px;
          border-radius:8px;
          margin:25px 0;
        ">

          <h3 style="color:#174c46;margin-top:0;">
            Your Booking Details
          </h3>

          <p><strong>Booking Reference:</strong><br>
          ${safe.bookingReference}</p>

          <p><strong>Accommodation:</strong><br>
          ${safe.accommodation}</p>

          <p><strong>Check-in:</strong> ${safe.checkIn}</p>

          <p><strong>Check-out:</strong> ${safe.checkOut}</p>

          <p><strong>Duration:</strong> ${safe.nights} nights</p>

          <p><strong>Adults:</strong> ${safe.adults}</p>

          <p><strong>Children:</strong> ${safe.children}</p>

          <p><strong>Rooms:</strong> ${safe.rooms}</p>

          <p><strong>Payment Method:</strong><br>
          ${safe.paymentMethod}</p>

          <hr style="border:none;border-top:1px solid #ddd;">

          <p style="font-size:13px;color:#777;">
            TOTAL AMOUNT
          </p>

          <h2 style="color:#174c46;margin-top:0;">
            ${safe.totalAmount}
          </h2>

        </div>

        <div style="
          background:#fff8e8;
          border-left:4px solid #d7a84b;
          padding:15px;
          margin:25px 0;
        ">

          <strong style="color:#8b641e;">
            Reservation Status: Pending
          </strong>

          <p style="
            margin-bottom:0;
            color:#775f37;
            font-size:14px;
            line-height:1.6;
          ">
            Please complete your payment and upload your payment
            receipt using your booking reference.
            Your reservation is not yet confirmed.
          </p>

        </div>

        <p style="line-height:1.7;color:#666;">
          Please keep your booking reference safe.
          You may need it when contacting our team.
        </p>

        <p style="line-height:1.7;">
          We look forward to welcoming you to Club Nalu Resort.
        </p>

        <p style="margin-top:30px;">
          Warm regards,<br>
          <strong style="color:#174c46;">
            Club Nalu Resort
          </strong>
        </p>

      </div>

      <div style="
        background:#174c46;
        padding:22px;
        text-align:center;
        color:#d5e6df;
        font-size:12px;
      ">

        <p>Thank you for choosing Club Nalu Resort.</p>

        <p>
          © ${new Date().getFullYear()} Club Nalu Resort.
          All rights reserved.
        </p>

      </div>

    </div>

  </body>
  </html>
  `;

  const text = `
Dear ${guestName},

Thank you for choosing Club Nalu Resort.

Your reservation has been received.

BOOKING DETAILS

Booking Reference: ${bookingReference}
Accommodation: ${accommodation}
Check-in: ${checkIn}
Check-out: ${checkOut}
Nights: ${nights}
Adults: ${adults}
Children: ${children}
Rooms: ${rooms}

Payment Method: ${paymentMethod}

Total Amount: ${formatPHP(totalAmount)}

Reservation Status: Pending.

Please complete your payment and upload your payment receipt.

Your reservation is not yet confirmed.

We look forward to welcoming you.

Warm regards,
Club Nalu Resort.
  `;

  try {
    await transporter.sendMail({
      from: `"Club Nalu Resort" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject,
      text,
      html,
    });

    console.log(`Booking received email sent: ${bookingReference}`);

    return { sent: true };
  } catch (error) {
    console.error("Booking notification email failed:", error.message);

    return {
      sent: false,
      reason: error.message,
    };
  }
};

// ==========================================
// PAYMENT APPROVAL / REJECTION EMAIL
// ==========================================

const sendPaymentDecisionEmail = async ({
  recipientEmail,
  guestName,
  bookingReference,
  decision,
  rejectionReason,
}) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are not configured.",
    };
  }

  const approved = decision === "approved";

  const subject = approved
    ? `Payment Approved – ${bookingReference}`
    : `Payment Update – ${bookingReference}`;

  const message = approved
    ? `Dear ${guestName},

We are pleased to inform you that your payment for booking ${bookingReference} has been approved.

Thank you for choosing Club Nalu Resort. We look forward to welcoming you.

Kind regards,
Club Nalu Resort`
    : `Dear ${guestName},

Your payment for booking ${bookingReference} could not be approved.

Reason: ${rejectionReason}

Please contact Club Nalu Resort if you need assistance.

Kind regards,
Club Nalu Resort`;

  const safeGuestName = escapeHtml(guestName);
  const safeReference = escapeHtml(bookingReference);
  const safeReason = escapeHtml(rejectionReason);

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="
    margin:0;
    padding:30px 15px;
    background:#f4f6f5;
    font-family:Arial,sans-serif;
    color:#333;
  ">

    <div style="
      max-width:600px;
      margin:auto;
      background:#fff;
      border-radius:10px;
      overflow:hidden;
    ">

      <div style="
        background:#174c46;
        padding:30px;
        text-align:center;
      ">
        <h1 style="color:white;letter-spacing:5px;">
          CLUB NALU
        </h1>
      </div>

      <div style="padding:30px;">

        <p>Dear ${safeGuestName},</p>

        <h2 style="color:${approved ? "#174c46" : "#a33b32"};">
          ${approved ? "Payment Approved!" : "Payment Update"}
        </h2>

        <p style="line-height:1.7;">
          ${
            approved
              ? "We are pleased to inform you that your payment has been successfully approved."
              : "Unfortunately, your payment could not be approved."
          }
        </p>

        <div style="
          background:#f2f7f5;
          padding:20px;
          border-radius:8px;
        ">

          <p><strong>Booking Reference:</strong></p>

          <h3 style="color:#174c46;">
            ${safeReference}
          </h3>

          ${approved ? "" : `<p><strong>Reason:</strong><br>${safeReason}</p>`}

        </div>

        <p style="line-height:1.7;margin-top:25px;">
          ${
            approved
              ? "Thank you for choosing Club Nalu Resort. We look forward to welcoming you."
              : "Please contact Club Nalu Resort if you need assistance."
          }
        </p>

        <p>
          Kind regards,<br>
          <strong>Club Nalu Resort</strong>
        </p>

      </div>

      <div style="
        background:#174c46;
        padding:20px;
        text-align:center;
        color:#fff;
        font-size:12px;
      ">
        © ${new Date().getFullYear()} Club Nalu Resort.
        All rights reserved.
      </div>

    </div>

  </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Club Nalu Resort" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject,
      text: message,
      html,
    });

    console.log(`Payment decision email sent: ${bookingReference}`);

    return { sent: true };
  } catch (error) {
    console.error("Payment notification email failed:", error.message);

    return {
      sent: false,
      reason: error.message,
    };
  }
};

// ==========================================
// EXPORT EMAIL FUNCTIONS
// ==========================================

module.exports = {
  sendBookingReceivedEmail,
  sendPaymentDecisionEmail,
};
