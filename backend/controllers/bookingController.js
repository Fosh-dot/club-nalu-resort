const { randomUUID } = require("crypto");
const { pool } = require("../config/db");

const EXTRA_PERSON_RATE = 1200;

// POST /api/bookings
async function createBooking(req, res) {
  let connection;
  let transactionStarted = false;

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
      paymentMethod = "bank_transfer",
      specialRequests = "",
      newsletter = false,
    } = req.body;

    // Validate the selected payment method.
    const selectedPaymentMethod = String(paymentMethod).trim().toLowerCase();

    if (!["bank_transfer", "gcash"].includes(selectedPaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Please select Bank Transfer or GCash.",
      });
    }

    // Validate required guest information.
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

    // Validate booking dates.
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required.",
      });
    }

    const start = new Date(`${checkIn}T00:00:00Z`);
    const end = new Date(`${checkOut}T00:00:00Z`);
    const today = new Date();

    today.setUTCHours(0, 0, 0, 0);

    if (
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

    // Validate numeric fields.
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

    // Confirm GCash is enabled before accepting a GCash booking.
    if (selectedPaymentMethod === "gcash") {
      const [paymentSettings] = await pool.execute(
        `SELECT gcash_enabled
         FROM payment_settings
         LIMIT 1`,
      );

      if (
        paymentSettings.length === 0 ||
        Number(paymentSettings[0].gcash_enabled) !== 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "GCash is currently unavailable. Please select Bank Transfer.",
        });
      }
    }

    // Look up the official accommodation rate.
    const [accommodations] = await pool.execute(
      `SELECT
         id,
         name,
         price_per_night,
         max_adults,
         max_children,
         total_units,
         is_active
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

    // Validate accommodation capacity.
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

    // Calculate the booking amount.
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
    const taxes = 0;
    const totalAmount = roomSubtotal + extraGuestCharges + taxes;

    // Start the database transaction.
    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Find an existing guest or create a new guest.
    const [existingGuests] = await connection.execute(
      `SELECT id
       FROM guests
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail],
    );

    let guestId;

    const newsletterConsent =
      newsletter === true ||
      newsletter === 1 ||
      newsletter === "true" ||
      newsletter === "1";

    if (existingGuests.length > 0) {
      guestId = existingGuests[0].id;

      await connection.execute(
        `UPDATE guests
         SET
           first_name = ?,
           last_name = ?,
           phone = ?,
           newsletter_consent = ?
         WHERE id = ?`,
        [
          firstName.trim(),
          lastName.trim(),
          phone.trim(),
          newsletterConsent,
          guestId,
        ],
      );
    } else {
      const [guestResult] = await connection.execute(
        `INSERT INTO guests (
           first_name,
           last_name,
           email,
           phone,
           newsletter_consent
         )
         VALUES (?, ?, ?, ?, ?)`,
        [
          firstName.trim(),
          lastName.trim(),
          normalizedEmail,
          phone.trim(),
          newsletterConsent,
        ],
      );

      guestId = guestResult.insertId;
    }

    // Generate the booking reference.
    const bookingReference = `CN-${randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;

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
        String(specialRequests || "").trim(),
        roomSubtotal + extraGuestCharges,
        taxes,
        totalAmount,
      ],
    );

    // Save the customer's selected payment method.
    await connection.execute(
      `INSERT INTO payments (
         booking_id,
         payment_method,
         amount,
         payment_status
       )
       VALUES (?, ?, ?, 'awaiting_payment')`,
      [bookingResult.insertId, selectedPaymentMethod, totalAmount],
    );

    // Commit the booking and payment together.
    await connection.commit();
    transactionStarted = false;

    // Return the booking and its selected payment method.
    return res.status(201).json({
      success: true,
      message: "Reservation created successfully.",
      data: {
        bookingId: bookingResult.insertId,
        bookingReference,
        bookingStatus: "pending",
        paymentStatus: "awaiting_payment",
        paymentMethod: selectedPaymentMethod,
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
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Booking transaction rollback failed:", rollbackError);
      }
    }

    console.error("Booking creation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the reservation.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { createBooking };
