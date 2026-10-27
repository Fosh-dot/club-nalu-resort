import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReservationPayment.css";

function ReservationPayment() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);

  const [createdBooking, setCreatedBooking] = useState(() => {
    try {
      const saved = sessionStorage.getItem("clubNaluCreatedBooking");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);

  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const effectivePaymentMethod = createdBooking?.paymentMethod || paymentMethod;

  const readSessionObject = (key) => {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  };

  const guestDetails = readSessionObject("clubNaluGuestDetails");
  const bookingDetails = readSessionObject("clubNaluBookingDetails");

  const money = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
      .format(Number(amount) || 0)
      .replace("PHP", "₱");

  // Load bank transfer and GCash details configured by the administrator.
  useEffect(() => {
    const apiBaseUrl = (
      import.meta.env.VITE_API_URL || "https://club-nalu-api.onrender.com"
    ).replace(/\/$/, "");

    fetch(`${apiBaseUrl}/api/payment-settings`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not load bank transfer details.",
          );
        }

        setPaymentSettings(result.data);
      })
      .catch((error) => {
        console.error("Could not load Club Nalu payment settings:", error);
        setPaymentSettings(null);
      });
  }, []);

  // Upload the selected receipt for the newly created booking.
  const handleReceiptUpload = async () => {
    const bookingReference = createdBooking?.bookingReference;

    if (!bookingReference) {
      alert("Please submit your reservation first.");
      return;
    }

    if (!receiptFile) {
      alert("Please choose a JPG, PNG, WEBP, or PDF payment receipt.");
      return;
    }

    const formData = new FormData();
    formData.append("receipt", receiptFile);

    setIsUploadingReceipt(true);
    setReceiptMessage("");

    try {
      const apiBaseUrl = (
        import.meta.env.VITE_API_URL || "https://club-nalu-api.onrender.com"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${apiBaseUrl}/api/payments/${encodeURIComponent(
          bookingReference,
        )}/receipt`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Receipt upload failed (${response.status}).`,
        );
      }

      const updatedBooking = {
        ...createdBooking,
        paymentStatus: result.data?.paymentStatus || "pending_verification",
      };

      setCreatedBooking(updatedBooking);

      sessionStorage.setItem(
        "clubNaluCreatedBooking",
        JSON.stringify(updatedBooking),
      );

      setReceiptMessage(
        "Receipt uploaded successfully. Your payment is awaiting review.",
      );

      setReceiptFile(null);
    } catch (error) {
      console.error("Club Nalu receipt upload failed:", error);

      setReceiptMessage(
        error.message || "We could not upload your receipt. Please try again.",
      );
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Submit the reservation to the backend.
  const handleBookNow = async (event) => {
    event.preventDefault();

    if (
      !guestDetails.firstName?.trim() ||
      !guestDetails.lastName?.trim() ||
      !guestDetails.email?.trim()
    ) {
      alert(
        "Your guest details are missing. Please return to the reservation details page and complete the form.",
      );

      navigate("/reservation");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your mobile or cell phone number.");
      return;
    }

    if (!acceptedPolicies) {
      alert("Please accept the booking, cancellation, and privacy policies.");
      return;
    }

    const accommodationId = Number(
      bookingDetails.accommodationId || bookingDetails.roomId,
    );

    if (!Number.isInteger(accommodationId) || accommodationId < 1) {
      alert(
        "The selected accommodation ID is missing. Please return to the booking page, select an accommodation, and try again.",
      );
      return;
    }

    const checkIn = bookingDetails.checkIn;
    const checkOut = bookingDetails.checkOut;
    const adults = Number(bookingDetails.adults ?? 2);
    const children = Number(
      bookingDetails.children ?? bookingDetails.kids ?? 0,
    );
    const rooms = Number(bookingDetails.rooms ?? 1);

    if (!checkIn || !checkOut) {
      alert(
        "Your check-in and check-out dates are missing. Please return to the booking page and select your dates.",
      );
      return;
    }

    const paymentDetails = {
      phone: phone.trim(),
      paymentMethod,
      newsletter,
      acceptedPolicies,
    };

    sessionStorage.setItem(
      "clubNaluPaymentDetails",
      JSON.stringify(paymentDetails),
    );

    const payload = {
      firstName: guestDetails.firstName.trim(),
      lastName: guestDetails.lastName.trim(),
      email: guestDetails.email.trim(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      accommodationId,
      paymentMethod,
      specialRequests: guestDetails.specialRequests || "",
      newsletter: Boolean(newsletter || guestDetails.newsletter),
    };

    setIsSubmitting(true);

    try {
      const apiBaseUrl = (
        import.meta.env.VITE_API_URL || "https://club-nalu-api.onrender.com"
      ).replace(/\/$/, "");

      const response = await fetch(`${apiBaseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Booking request failed (${response.status}).`,
        );
      }

      const bookingWithPaymentMethod = {
        ...result.data,
        paymentMethod: result.data?.paymentMethod || paymentMethod,
      };

      sessionStorage.setItem(
        "clubNaluCreatedBooking",
        JSON.stringify(bookingWithPaymentMethod),
      );

      setCreatedBooking(bookingWithPaymentMethod);
      setShowReservationSuccess(true);

      setReceiptMessage(
        effectivePaymentMethod === "gcash"
          ? "Reservation created. Pay using the GCash details below, then upload your receipt."
          : "Reservation created. Transfer the amount to the bank account below, then upload your receipt.",
      );
    } catch (error) {
      console.error("Club Nalu booking submission failed:", error);

      alert(
        error.message ||
          "We could not submit your reservation. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const reservation = {
    room: bookingDetails.room || "Deluxe",
    roomGuests: bookingDetails.roomGuests || "2 Adults",
    checkIn: bookingDetails.checkIn || "Sat 21 Nov 2026",
    checkOut: bookingDetails.checkOut || "Tue 24 Nov 2026",
    nights: bookingDetails.nights || 3,
    guests: bookingDetails.guests || 2,
    roomPrice: Number(bookingDetails.roomPrice ?? 38346.43),
    taxes: Number(bookingDetails.taxes ?? 4601.57),
    totalWithTaxes: Number(bookingDetails.totalWithTaxes ?? 42948),
  };

  return (
    <div className="booking-page reservation-payment-page">
      {/* TOP BAR */}
      <div className="booking-topbar">
        <div className="booking-official">
          <strong>Official website:</strong> Best Rate Guaranteed
        </div>

        <div className="booking-contact">
          <a href="tel:+639197841294">♧ &nbsp;+639197841294</a>
          <span className="booking-divider" />

          <a href="mailto:naluresortclub@gmail.com">
            ✉ &nbsp;naluresortclub@gmail.com
          </a>

          <span className="booking-divider" />

          <button type="button" className="booking-language">
            ₱ Philippine Peso⌄
          </button>

          <span className="booking-divider" />

          <button type="button" className="booking-language">
            🇬🇧 English⌄
          </button>
        </div>
      </div>

      {/* HEADER */}
      <header className="booking-header">
        <Link to="/" className="booking-brand" aria-label="Club Nalu home">
          <span className="booking-brand-logo">
            CLUB
            <br />
            〰
            <br />
            NALU
          </span>
        </Link>

        <div className="booking-brand-description">
          <strong>Club Nalu Managed by HII</strong>
          <span>Baroro, Bacnotan - 2515, La Union, Philippines</span>
        </div>

        <nav className="booking-navigation" aria-label="Booking navigation">
          <Link to="/">Home</Link>
          <a href="#booking-footer">Info</a>
        </nav>
      </header>

      {/* MAIN RESERVATION CONTENT */}
      <main className="reservation-payment-main">
        {/* RESERVATION SUMMARY */}
        <aside className="payment-reservation-summary">
          <h1>Your reservation</h1>

          <div className="payment-summary-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="payment-back"
            >
              ‹ &nbsp;Back
            </button>

            <button
              type="button"
              onClick={() => navigate("/booking")}
              className="payment-modify"
            >
              ✎ &nbsp;Modify your search
            </button>
          </div>

          <div className="payment-date-summary">
            <div>
              <span>{reservation.checkIn.split(" ")[0]}</span>
              <strong>{reservation.checkIn.split(" ")[1]}</strong>
              <small>{reservation.checkIn.split(" ").slice(2).join(" ")}</small>
            </div>

            <span className="payment-date-arrow">›</span>

            <div>
              <span>{reservation.checkOut.split(" ")[0]}</span>
              <strong>{reservation.checkOut.split(" ")[1]}</strong>
              <small>
                {reservation.checkOut.split(" ").slice(2).join(" ")}
              </small>
            </div>

            <div className="payment-date-stat">
              <span>Nights</span>
              <strong>☾ &nbsp;{reservation.nights}</strong>
            </div>

            <div className="payment-date-stat">
              <span>Guests</span>
              <strong>♧ &nbsp;{reservation.guests}</strong>
            </div>
          </div>

          <div className="payment-selected-label">Selected accommodation</div>

          <div className="payment-room-summary">
            <div className="payment-room-name">
              <span className="payment-room-number">1</span>
              <strong>{reservation.room}</strong>
            </div>

            <strong className="payment-room-price">
              {money(reservation.roomPrice)}
            </strong>

            <p>{reservation.roomGuests}</p>

            <div className="payment-guarantee">
              ◇ &nbsp;Best Rate Guaranteed
            </div>

            <p className="payment-breakfast">Breakfast Included</p>

            <div className="payment-cancellation">
              ⊙ &nbsp;Cancellation terms are subject to resort policy.
            </div>

            <div className="payment-tax-line">
              Taxes <strong>{money(reservation.taxes)}</strong>
            </div>
          </div>

          <div className="payment-total-row">
            <span>Room amount</span>
            <strong>{money(reservation.roomPrice)}</strong>
          </div>

          <div className="payment-total-row payment-total-final">
            <span>Total with taxes</span>
            <strong>{money(reservation.totalWithTaxes)}</strong>
          </div>

          <button
            type="button"
            className="payment-book-summary"
            onClick={() =>
              document
                .getElementById("reservation-payment-form")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            Continue to payment
          </button>
        </aside>

        {/* PAYMENT FORM */}
        <section className="payment-main-panel">
          <form
            id="reservation-payment-form"
            className="payment-form"
            onSubmit={handleBookNow}
          >
            <label className="payment-field">
              <span>First name</span>
              <input
                value={guestDetails.firstName || ""}
                readOnly
                placeholder="First name"
              />
            </label>

            <label className="payment-field">
              <span>Last name</span>
              <input
                value={guestDetails.lastName || ""}
                readOnly
                placeholder="Last name"
              />
            </label>

            <label className="payment-field">
              <span>Email</span>
              <input
                type="email"
                value={guestDetails.email || ""}
                readOnly
                placeholder="Email"
              />
            </label>

            <label className="payment-phone-field payment-phone-field-full">
              <span>Mobile or cell phone</span>

              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                autoComplete="tel"
                inputMode="tel"
                required
              />

              <small>
                Enter your phone number, including your country code if
                applicable.
              </small>
            </label>

            <h2>Complete Your Reservation</h2>

            <p className="payment-intro">
              Secure your stay at Club Nalu by completing your reservation and
              following the payment instructions below. Once your transfer is
              complete, upload your payment receipt for verification.
            </p>

            {/* PAYMENT METHOD AND ACCOUNT DETAILS */}
            <section
              id="club-nalu-payment-section"
              className="club-nalu-bank-details"
            >
              <h3>Choose Payment Method</h3>

              <div
                className="club-nalu-payment-options"
                role="group"
                aria-label="Choose payment method"
              >
                <button
                  type="button"
                  className={`club-nalu-payment-option ${
                    paymentMethod === "bank_transfer" ? "active" : ""
                  }`}
                  aria-pressed={paymentMethod === "bank_transfer"}
                  onClick={() => setPaymentMethod("bank_transfer")}
                  disabled={Boolean(createdBooking)}
                >
                  Bank Transfer
                </button>

                {Number(paymentSettings?.gcash_enabled) === 1 && (
                  <button
                    type="button"
                    className={`club-nalu-payment-option ${
                      paymentMethod === "gcash" ? "active" : ""
                    }`}
                    aria-pressed={paymentMethod === "gcash"}
                    onClick={() => setPaymentMethod("gcash")}
                    disabled={Boolean(createdBooking)}
                  >
                    GCash
                  </button>
                )}
              </div>

              {paymentMethod === "bank_transfer" ? (
                <div className="club-nalu-payment-details">
                  <h3>Bank Transfer Details</h3>

                  {!paymentSettings ? (
                    <p role="status">
                      Payment details are loading. Please wait before making a
                      transfer.
                    </p>
                  ) : paymentSettings.account_number ? (
                    <>
                      <p>
                        <strong>Bank:</strong>{" "}
                        {paymentSettings.bank_name || "Not provided"}
                      </p>

                      <p>
                        <strong>Account name:</strong>{" "}
                        {paymentSettings.account_name || "Not provided"}
                      </p>

                      <p>
                        <strong>Account number:</strong>{" "}
                        {paymentSettings.account_number}
                      </p>

                      {paymentSettings.branch_name && (
                        <p>
                          <strong>Branch:</strong> {paymentSettings.branch_name}
                        </p>
                      )}

                      <p>
                        <strong>Payment instructions:</strong>{" "}
                        {paymentSettings.payment_instructions ||
                          "Please contact the resort for transfer instructions."}
                      </p>
                    </>
                  ) : (
                    <p>
                      Bank account details have not been configured yet. Please
                      contact the resort before transferring money.
                    </p>
                  )}
                </div>
              ) : (
                <div className="club-nalu-payment-details">
                  <h3>GCash Details</h3>

                  {Number(paymentSettings?.gcash_enabled) === 1 &&
                  paymentSettings?.gcash_number ? (
                    <>
                      <p>
                        <strong>GCash number:</strong>{" "}
                        {paymentSettings.gcash_number}
                      </p>

                      <p>
                        <strong>Account name:</strong>{" "}
                        {paymentSettings.gcash_account_name || "Not provided"}
                      </p>

                      <p>
                        <strong>Payment instructions:</strong>{" "}
                        {paymentSettings.gcash_instructions ||
                          "Send the payment to the GCash account above, then upload your receipt."}
                      </p>
                    </>
                  ) : (
                    <p>
                      GCash is currently unavailable. Please choose Bank
                      Transfer or contact the resort.
                    </p>
                  )}
                </div>
              )}
            </section>

            <label className="payment-check-row">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(event) => setNewsletter(event.target.checked)}
              />

              <span>
                I would like to receive newsletters and special offers from Club
                Nalu Managed by HII.
              </span>
            </label>

            <label className="payment-check-row">
              <input
                type="checkbox"
                checked={acceptedPolicies}
                onChange={(event) => setAcceptedPolicies(event.target.checked)}
                required
              />

              <span>
                I have read and accept the booking, cancellation, and privacy
                policies.
              </span>
            </label>

            <button
              type="submit"
              className="payment-book-main"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting reservation..."
                : createdBooking
                  ? "Reservation submitted"
                  : "Submit reservation"}
            </button>
            {/* BOOKING CONFIRMATION */}
            {createdBooking && showReservationSuccess && (
              <div className="club-nalu-success-overlay">
                <div
                  className="club-nalu-success-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="reservation-success-title"
                >
                  <button
                    type="button"
                    className="club-nalu-success-close"
                    onClick={() => {
                      setShowReservationSuccess(false);
                    }}
                    aria-label="Close confirmation"
                  >
                    &times;
                  </button>

                  <div className="club-nalu-success-icon">&#10003;</div>

                  <p className="club-nalu-success-eyebrow">CLUB NALU RESORT</p>

                  <h2 id="reservation-success-title">Reservation Created!</h2>

                  <p className="club-nalu-success-message">
                    Thank you for choosing Club Nalu. Your reservation has been
                    created successfully.
                  </p>

                  <div className="club-nalu-reference-box">
                    <span>YOUR BOOKING REFERENCE</span>

                    <strong>{createdBooking.bookingReference}</strong>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            createdBooking.bookingReference,
                          );
                          alert("Booking reference copied!");
                        } catch {
                          alert(
                            `Your booking reference is ${createdBooking.bookingReference}`,
                          );
                        }
                      }}
                    >
                      Copy Reference
                    </button>
                  </div>

                  <div className="club-nalu-success-amount">
                    <span>Amount Due</span>

                    <strong>{money(createdBooking.totalAmount)}</strong>
                  </div>

                  <div className="club-nalu-success-status">
                    <span className="club-nalu-status-dot"></span>
                    Awaiting Payment
                  </div>

                  <p className="club-nalu-success-note">
                    {effectivePaymentMethod === "gcash"
                      ? "Complete your GCash payment and upload your receipt so the resort can verify your payment."
                      : "Complete your bank transfer and upload your receipt so the resort can verify your payment."}
                  </p>

                  <button
                    type="button"
                    className="club-nalu-continue-payment"
                    onClick={() => {
                      setShowReservationSuccess(false);

                      setTimeout(() => {
                        document
                          .getElementById("club-nalu-payment-section")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }, 100);
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* RECEIPT UPLOAD */}
            {createdBooking && (
              <section className="club-nalu-receipt-section">
                <h2>Upload your payment receipt</h2>

                <p>
                  {effectivePaymentMethod === "gcash"
                    ? "After completing your GCash payment, select the receipt or transaction confirmation you want the resort to verify."
                    : "After completing your bank transfer, select the receipt or transfer confirmation you want the resort to verify."}
                </p>

                <label className="payment-field">
                  <span>Payment receipt</span>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;

                      if (file && file.size > 5 * 1024 * 1024) {
                        alert("Your receipt must be smaller than 5 MB.");
                        event.target.value = "";
                        setReceiptFile(null);
                        return;
                      }

                      setReceiptFile(file);
                      setReceiptMessage("");
                    }}
                  />

                  <small>
                    Accepted formats: JPG, JPEG, PNG, WEBP, or PDF. Maximum
                    size: 5 MB.
                  </small>
                </label>

                {receiptFile && (
                  <p className="club-nalu-selected-file">
                    Selected file: {receiptFile.name}
                  </p>
                )}

                <button
                  type="button"
                  className="payment-book-main"
                  onClick={handleReceiptUpload}
                  disabled={isUploadingReceipt || !receiptFile}
                >
                  {isUploadingReceipt
                    ? "Uploading receipt..."
                    : "Upload payment receipt"}
                </button>

                {receiptMessage && (
                  <p
                    className="club-nalu-receipt-message"
                    role="status"
                    aria-live="polite"
                  >
                    {receiptMessage}
                  </p>
                )}

                {createdBooking.paymentStatus === "pending_verification" && (
                  <p className="club-nalu-pending-message">
                    Your receipt has been submitted. Your payment is awaiting
                    review by the resort.
                  </p>
                )}
              </section>
            )}
          </form>
        </section>
      </main>
      {/* FOOTER */}
      <footer className="booking-footer" id="booking-footer">
        <span>
          Powered by <strong>simpleBooking™</strong>
        </span>

        <nav aria-label="Footer navigation">
          <button type="button" onClick={() => setShowPrivacy(true)}>
            Privacy Policy
          </button>

          <button type="button" onClick={() => setShowCookiePolicy(true)}>
            Cookie Policy
          </button>

          <button type="button" onClick={() => setShowCookiePreferences(true)}>
            Cookie Preferences
          </button>

          <button type="button" onClick={() => setShowAccessibility(true)}>
            Accessibility
          </button>
        </nav>
      </footer>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacy && (
        <div className="privacy-overlay" onClick={() => setShowPrivacy(false)}>
          <section
            className="privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="privacy-modal-header">
              <h2 id="privacy-title">Privacy Policy</h2>

              <button
                type="button"
                className="privacy-close"
                aria-label="Close privacy policy"
                onClick={() => setShowPrivacy(false)}
              >
                ×
              </button>
            </header>

            <div className="privacy-modal-content">
              <h3>Privacy Policy</h3>
              <p>
                Club Nalu collects and processes guest information to manage
                reservations, communicate with guests, and review submitted
                payment receipts.
              </p>

              <h3>Contact</h3>
              <p>Email: naluresortclub@gmail.com</p>

              <p>
                Please contact the resort if you have questions about your
                booking information or privacy.
              </p>
            </div>

            <div className="privacy-modal-footer">
              <button type="button" onClick={() => setShowPrivacy(false)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* COOKIE POLICY MODAL */}
      {showCookiePolicy && (
        <div
          className="privacy-overlay"
          onClick={() => setShowCookiePolicy(false)}
        >
          <section
            className="privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-policy-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="privacy-modal-header">
              <h2 id="cookie-policy-title">Cookie Policy</h2>

              <button
                type="button"
                className="privacy-close"
                aria-label="Close cookie policy"
                onClick={() => setShowCookiePolicy(false)}
              >
                ×
              </button>
            </header>

            <div className="privacy-modal-content">
              <p>
                Essential browser storage is used to preserve reservation
                details during the booking process. Other cookies may be used if
                additional services are enabled.
              </p>
            </div>

            <div className="privacy-modal-footer">
              <button type="button" onClick={() => setShowCookiePolicy(false)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* COOKIE PREFERENCES MODAL */}
      {showCookiePreferences && (
        <div
          className="cookie-preferences-overlay"
          onClick={() => setShowCookiePreferences(false)}
        >
          <section
            className="cookie-preferences-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="cookie-preferences-close"
              aria-label="Close cookie preferences"
              onClick={() => setShowCookiePreferences(false)}
            >
              ×
            </button>

            <h2 id="cookie-preferences-title">Club Nalu Managed by HII</h2>

            <p>
              Necessary browser storage supports the booking process. You can
              close this window to return to your reservation.
            </p>

            <button
              type="button"
              className="cookie-preferences-save"
              onClick={() => setShowCookiePreferences(false)}
            >
              Close
            </button>
          </section>
        </div>
      )}

      {/* ACCESSIBILITY MODAL */}
      {showAccessibility && (
        <div
          className="accessibility-overlay"
          onClick={() => setShowAccessibility(false)}
        >
          <section
            className="accessibility-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="accessibility-modal-header">
              <h2 id="accessibility-title">Accessibility</h2>

              <button
                type="button"
                className="accessibility-close"
                aria-label="Close accessibility information"
                onClick={() => setShowAccessibility(false)}
              >
                ×
              </button>
            </header>

            <div className="accessibility-modal-content">
              <div className="accessibility-icon" aria-hidden="true">
                ♿
              </div>

              <h3>Accessible booking experience</h3>

              <p>
                Club Nalu aims to make its booking process accessible and easy
                to use. If you experience a barrier while booking, please
                contact the resort for assistance.
              </p>
            </div>

            <footer className="accessibility-modal-footer">
              <button type="button" onClick={() => setShowAccessibility(false)}>
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default ReservationPayment;
