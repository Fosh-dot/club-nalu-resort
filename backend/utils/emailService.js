const nodemailer = require("nodemailer");

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

  try {
    await transporter.sendMail({
      from: `"Club Nalu Resort" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject,
      text: message,
    });

    return { sent: true };
  } catch (error) {
    console.error("Payment notification email failed:", error.message);

    return {
      sent: false,
      reason: error.message,
    };
  }
};

module.exports = {
  sendPaymentDecisionEmail,
};
