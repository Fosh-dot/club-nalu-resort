const { randomUUID } = require("crypto");
const { pool } = require("../config/db");

const EXTRA_PERSON_RATE = 1200;

// POST /api/bookings
async function createBooking(req, res) {
  const connection = await pool.getConnection();

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      checkIn,
      checkOut,
      adults,
      children = 0,
      rooms = 1,
      accommodationId,
      specialRequests = "",
      newsletter = false,
    } = req.body;

    // Validate required guest information
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and phone are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate booking dates
    const start = new Date(`${checkIn}T00:00:00Z`);
    const end = new Date(`${checkOut}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (
      !checkIn ||
      !checkOut ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.toISOString().slice(0, 10) !== checkIn ||
      end.toISOString().slice(0, 10) !== checkOut ||
      start < today ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Choose valid dates. Check-in cannot be in the past, and check-out must be after check-in.",
      });
    }

    // Validate numeric fields
    const guestAdults = Number(adults);
    const guestChildren = Number(children);
    const roomCount = Number(rooms);
    const selectedAccommodationId = Number(accommodationId);

    if (
      !Number.isInteger(guestAdults) ||
      guestAdults < 1 ||
      !Number.isInteger(guestChildren) ||
      guestChildren < 0 ||
      !Number.isInteger(roomCount) ||
      roomCount < 1 ||
      !Number.isInteger(selectedAccommodationId) ||
      selectedAccommodationId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid guest, room, or accommodation details.",
      });
    }

    // Look up the official rate from MySQL.
    const [accommodations] = await pool.execute(
      `SELECT id, name, price_per_night, max_adults,
              max_children, total_units, is_active
       FROM accommodations
       WHERE id = ?`,
      [selectedAccommodationId],
    );

    if (accommodations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The selected accommodation does not exist.",
      });
    }

    const accommodation = accommodations[0];

    if (!accommodation.is_active || Number(accommodation.total_units) < 1) {
      return res.status(409).json({
        success: false,
        message:
          "This accommodation is not accepting bookings yet. Please contact the resort.",
      });
    }
    const totalGuests = guestAdults + guestChildren;

    const maxAdults = Number(accommodation.max_adults);
    const maxChildren = Number(accommodation.max_children);

    if (guestAdults > maxAdults || guestChildren > maxChildren) {
      return res.status(400).json({
        success: false,
        message:
          "The number of adults or children exceeds this accommodation's permitted capacity.",
      });
    }

    const checkInDate = new Date(`${checkIn}T00:00:00Z`);
    const checkOutDate = new Date(`${checkOut}T00:00:00Z`);
    const nights = Math.round(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );

    const nightlyRate = Number(accommodation.price_per_night);
    const includedCapacity =
      Number(accommodation.max_adults) + Number(accommodation.max_children);

    const extraGuests = Math.max(0, totalGuests - includedCapacity);
    const extraGuestCharges =
      extraGuests * EXTRA_PERSON_RATE * nights * roomCount;

    const roomSubtotal = nightlyRate * nights * roomCount;
    const taxes = 0; // Configure only after the resort confirms its tax rules.
    const totalAmount = roomSubtotal + extraGuestCharges + taxes;

    await connection.beginTransaction();

    // Find an existing guest by email or create a new guest record.
    const [existingGuests] = await connection.execute(
      "SELECT id FROM guests WHERE email = ? LIMIT 1",
      [normalizedEmail],
    );

    let guestId;

    if (existingGuests.length > 0) {
      guestId = existingGuests[0].id;

      await connection.execute(
        `UPDATE guests
         SET first_name = ?, last_name = ?, phone = ?,
             newsletter_consent = ?
         WHERE id = ?`,
        [
          firstName.trim(),
          lastName.trim(),
          phone.trim(),
          Boolean(newsletter),
          guestId,
        ],
      );
    } else {
      const [guestResult] = await connection.execute(
        `INSERT INTO guests
         (first_name, last_name, email, phone, newsletter_consent)
         VALUES (?, ?, ?, ?, ?)`,
        [
          firstName.trim(),
          lastName.trim(),
          normalizedEmail,
          phone.trim(),
          Boolean(newsletter),
        ],
      );

      guestId = guestResult.insertId;
    }

    const bookingReference = `CN-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

    // Overlapping dates are intentionally allowed.
    const [bookingResult] = await connection.execute(
      `INSERT INTO bookings (
         booking_reference,
         guest_id,
         accommodation_id,
         check_in,
         check_out,
         adults,
         children,
         rooms,
         special_requests,
         room_price,
         taxes,
         total_amount,
         booking_status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        bookingReference,
        guestId,
        selectedAccommodationId,
        checkIn,
        checkOut,
        guestAdults,
        guestChildren,
        roomCount,
        specialRequests.trim(),
        roomSubtotal + extraGuestCharges,
        taxes,
        totalAmount,
      ],
    );
    await connection.execute(
      `INSERT INTO payments
   (booking_id, payment_method, amount, payment_status)
   VALUES (?, 'bank_transfer', ?, 'awaiting_payment')`,
      [bookingResult.insertId, totalAmount],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully.",
      data: {
        bookingId: bookingResult.insertId,
        bookingReference,
        bookingStatus: "pending",
        paymentStatus: "awaiting_payment",
        accommodation: accommodation.name,
        checkIn,
        checkOut,
        nights,
        adults: guestAdults,
        children: guestChildren,
        rooms: roomCount,
        roomSubtotal,
        extraGuestCharges,
        taxes,
        totalAmount,
        currency: "PHP",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Booking creation failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create the reservation.",
    });
  } finally {
    connection.release();
  }
}

module.exports = { createBooking };
