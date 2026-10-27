const { pool } = require("../config/db");

// GET /api/admin/bookings
// Retrieve recent bookings, including guest, accommodation,
// and payment information.
async function getAdminBookings(req, res) {
  try {
    const [bookings] = await pool.query(`
      SELECT
        b.id,
        b.booking_reference,
        b.guest_id,
        b.accommodation_id,
        b.check_in,
        b.check_out,
        b.adults,
        b.children,
        b.rooms,
        b.created_at,
        p.amount,
        p.payment_method,
        p.payment_status,
        a.name AS accommodation_name,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        g.email AS guest_email,
        g.phone AS guest_phone
      FROM bookings b
      LEFT JOIN payments p
        ON p.booking_id = b.id
      LEFT JOIN accommodations a
        ON a.id = b.accommodation_id
      LEFT JOIN guests g
        ON g.id = b.guest_id
      ORDER BY b.created_at DESC
      LIMIT 200
    `);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
      },
    });
  } catch (error) {
    console.error("Admin bookings query failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load bookings.",
    });
  }
}

module.exports = { getAdminBookings };
