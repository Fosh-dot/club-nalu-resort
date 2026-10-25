const { pool } = require("../config/db");

async function getDashboardStats(req, res) {
  try {
    const [bookingStats] = await pool.query(`
      SELECT
        COUNT(*) AS totalBookings,
        COALESCE(
          SUM(
            CASE
              WHEN check_in > CURRENT_DATE THEN 1
              ELSE 0
            END
          ),
          0
        ) AS upcomingBookings
      FROM bookings
    `);

    const [paymentStats] = await pool.query(`
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN payment_status = 'pending_verification'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS paymentsToVerify,
        COALESCE(
          SUM(
            CASE
              WHEN payment_status = 'approved'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS verifiedPaymentTotal
      FROM payments
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalBookings: Number(bookingStats[0].totalBookings),
        upcomingBookings: Number(bookingStats[0].upcomingBookings),
        paymentsToVerify: Number(paymentStats[0].paymentsToVerify),
        verifiedPaymentTotal: Number(paymentStats[0].verifiedPaymentTotal),
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
}

module.exports = { getDashboardStats };
