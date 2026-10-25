import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Reservation.css";

function Reservation() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const checkInParam = searchParams.get("checkIn") || "2026-11-21";
  const checkOutParam = searchParams.get("checkOut") || "2026-11-24";
  const adultsParam = Math.max(1, Number(searchParams.get("adults")) || 2);
  const kidsParam = Math.max(0, Number(searchParams.get("kids")) || 0);
  const roomsParam = Math.max(1, Number(searchParams.get("rooms")) || 1);
  const promoCodeParam = searchParams.get("promoCode") || "";
  const [newsletter, setNewsletter] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);
  const [showNecessaryCookieInfo, setShowNecessaryCookieInfo] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    specialRequests: "",
  });

  const updateGuest = (event) => {
    const { name, value } = event.target;
    setGuest((current) => ({ ...current, [name]: value }));
  };

  const handleContinue = (event) => {
    event.preventDefault();

    if (
      !guest.firstName.trim() ||
      !guest.lastName.trim() ||
      !guest.email.trim()
    ) {
      alert("Please complete your name and email address.");
      return;
    }

    if (
      guest.email.trim().toLowerCase() !==
      guest.confirmEmail.trim().toLowerCase()
    ) {
      alert("Your email addresses do not match.");
      return;
    }

    if (!privacyAccepted) {
      alert("Please accept the personal data privacy notice to continue.");
      return;
    }

    const bookingDetails = {
      checkIn: checkInParam,
      checkOut: checkOutParam,
      adults: adultsParam,
      kids: kidsParam,
      rooms: roomsParam,
      promoCode: promoCodeParam,
      accommodationId:
        Number(
          searchParams.get("accommodationId") || searchParams.get("roomId"),
        ) || null,
      room:
        searchParams.get("room") ||
        searchParams.get("roomName") ||
        "Your selected accommodation",
    };

    const guestDetails = {
      firstName: guest.firstName.trim(),
      lastName: guest.lastName.trim(),
      email: guest.email.trim(),
      specialRequests: guest.specialRequests.trim(),
      newsletter,
      privacyAccepted,
    };

    sessionStorage.setItem(
      "clubNaluBookingDetails",
      JSON.stringify(bookingDetails),
    );

    sessionStorage.setItem(
      "clubNaluGuestDetails",
      JSON.stringify(guestDetails),
    );

    navigate("/reservation/payment");
  };

  const reservationCheckInDate = new Date(`${checkInParam}T12:00:00`);
  const reservationCheckOutDate = new Date(`${checkOutParam}T12:00:00`);
  const reservationNights = Math.max(
    1,
    Math.round((reservationCheckOutDate - reservationCheckInDate) / 86400000),
  );
  const formatReservationDate = (value) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const reservation = {
    checkIn: formatReservationDate(checkInParam),
    checkOut: formatReservationDate(checkOutParam),
    nights: reservationNights,
    guests: adultsParam + kidsParam,
    adults: adultsParam,
    kids: kidsParam,
    rooms: roomsParam,
    room: searchParams.get("roomName") || "Your selected accommodation",
    roomGuests: `${adultsParam} Adult${adultsParam === 1 ? "" : "s"}${kidsParam ? `, ${kidsParam} Kid${kidsParam === 1 ? "" : "s"}` : ""}`,
    roomPrice: 0,
    taxes: 0,
    totalWithTaxes: 0,
    promoCode: promoCodeParam,
  };

  const money = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("PHP", "₱");

  return (
    <div className="booking-page reservation-page">
      {/* TOP BAR */}
      <div className="booking-topbar">
        <div className="booking-official">
          <strong>Official website:</strong> Best Rate Guaranteed
        </div>

        <div className="booking-contact">
          <a href="tel:+639173112141">♧ &nbsp;+639197841294</a>

          <span className="booking-divider" />

          <a href="mailto:reservations@clubnalu.ph">
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

      <main className="reservation-main">
        <aside className="reservation-summary">
          <h1>Your reservation</h1>
          <div className="reservation-summary-actions">
            <Link to="/booking" className="reservation-back">
              ‹ &nbsp;Back
            </Link>
            <Link to="/booking" className="reservation-modify">
              ✎ &nbsp;Modify your search
            </Link>
          </div>

          <div className="reservation-date-summary">
            <div>
              <span>{reservation.checkIn.split(" ")[0]}</span>
              <strong>{reservation.checkIn.split(" ")[1]}</strong>
              <small>{reservation.checkIn.split(" ").slice(2).join(" ")}</small>
            </div>
            <span className="reservation-date-arrow">›</span>
            <div>
              <span>{reservation.checkOut.split(" ")[0]}</span>
              <strong>{reservation.checkOut.split(" ")[1]}</strong>
              <small>
                {reservation.checkOut.split(" ").slice(2).join(" ")}
              </small>
            </div>
            <div className="reservation-date-stat">
              <span>Nights</span>
              <strong>☾ &nbsp;{reservation.nights}</strong>
            </div>
            <div className="reservation-date-stat">
              <span>Guests</span>
              <strong>♧ &nbsp;{reservation.guests}</strong>
            </div>
          </div>

          <div className="reservation-selected-label">
            Selected accommodations
          </div>
          <div className="reservation-room-summary">
            <div className="reservation-room-name">
              <span className="reservation-room-number">1</span>
              <strong>{reservation.room}</strong>
            </div>
            <strong className="reservation-room-price">
              {reservation.roomPrice
                ? money(reservation.roomPrice)
                : "Price on selection"}
            </strong>
            <p>{reservation.roomGuests}</p>
            <div className="reservation-guarantee">
              ◇ &nbsp;Best Rate Guaranteed —
            </div>
            <p className="reservation-breakfast">Breakfast Included</p>
            <div className="reservation-cancellation">
              ⊙ &nbsp;Free cancellation until Friday, November
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;13, 2026
            </div>
            {reservation.promoCode && (
              <p className="reservation-promo-summary">
                Promo code: <strong>{reservation.promoCode}</strong>
              </p>
            )}
            <div className="reservation-tax-line">
              Taxes{" "}
              <strong>
                {reservation.taxes
                  ? money(reservation.taxes)
                  : "Calculated at booking"}
              </strong>
            </div>
          </div>

          <div className="reservation-total-row">
            <span>Total amount</span>
            <strong>
              {reservation.roomPrice ? money(reservation.roomPrice) : "Pending"}
            </strong>
          </div>
          <div className="reservation-total-row reservation-total-final">
            <span>Total with taxes</span>
            <strong>
              {reservation.totalWithTaxes
                ? money(reservation.totalWithTaxes).replace(".00", "")
                : "Pending"}
            </strong>
          </div>
          <button
            className="reservation-continue-summary"
            type="button"
            onClick={() =>
              document
                .getElementById("reservation-guest-form")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            Continue
          </button>
        </aside>

        <section className="reservation-details-panel">
          <div className="reservation-details-form-column">
            <h2>Enter Your Details</h2>
            <p className="reservation-signin-copy">
              Sign in with your social account to make faster reservations
            </p>
            <div className="reservation-social-buttons">
              <button
                type="button"
                className="reservation-facebook"
                onClick={() =>
                  alert("Facebook sign-in will be connected later.")
                }
              >
                <span>f</span>Sign in with Facebook
              </button>
              <button
                type="button"
                className="reservation-google"
                onClick={() => alert("Google sign-in will be connected later.")}
              >
                <span>G</span>Sign in with Google
              </button>
            </div>
            <div className="reservation-or">
              <span>Otherwise Enter Your Details</span>
            </div>

            <form id="reservation-guest-form" onSubmit={handleContinue}>
              <div className="reservation-form-grid">
                <label>
                  <span>Name</span>
                  <input
                    name="firstName"
                    value={guest.firstName}
                    onChange={updateGuest}
                    autoComplete="given-name"
                    required
                  />
                </label>
                <label>
                  <span>Last Name</span>
                  <input
                    name="lastName"
                    value={guest.lastName}
                    onChange={updateGuest}
                    autoComplete="family-name"
                    required
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={guest.email}
                    onChange={updateGuest}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>Confirm e-mail</span>
                  <input
                    name="confirmEmail"
                    type="email"
                    value={guest.confirmEmail}
                    onChange={updateGuest}
                    required
                  />
                </label>
              </div>
              <label className="reservation-special-requests">
                <span>Special requests (optional)</span>
                <input
                  name="specialRequests"
                  value={guest.specialRequests}
                  onChange={updateGuest}
                />
              </label>

              <label className="reservation-checkbox-row">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(event) => setNewsletter(event.target.checked)}
                />
                <span>
                  I would like to receive the newsletter and special offers from
                  Club Nalu Managed by HII
                </span>
              </label>
              <label className="reservation-checkbox-row">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  required
                />
                <span>
                  I have read the information regarding the handling of my
                  personal data and I agree.{" "}
                  <button
                    type="button"
                    className="reservation-inline-link"
                    onClick={() => setShowPrivacy(true)}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              <button type="submit" className="reservation-continue-main">
                Continue
              </button>
              <div className="reservation-best-price">
                ✓ &nbsp;Best Price Guarantee
              </div>
            </form>
          </div>

          <aside className="reservation-benefits-column">
            <section className="reservation-benefits-card">
              <span className="reservation-official-badge">
                ◉ &nbsp;Official website
              </span>
              <h2>The benefits of direct booking</h2>
              <p>
                Book directly through our official website and enjoy exclusive
                advantages.
              </p>
              <ul>
                <li>10% Off In-Room Massage</li>
                <li>
                  Complimentary Early Check-In and Late Check Out Subject to
                  Availability
                </li>
                <li>Best Rate Guaranteed</li>
                <li>Direct Reservation, No Booking Fees</li>
                <li>Exclusive Offers &amp; Benefits</li>
              </ul>
            </section>
            <section className="reservation-best-policy">
              ◎ &nbsp; You are booking at the <strong>best price</strong>{" "}
              guaranteed and at the <strong>best policy</strong>
            </section>
          </aside>
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
                This privacy policy describes how personal data is collected and
                processed when you use the booking service.
              </p>

              <h3>Data Owner </h3>
              <p>
                Nalu Resort Inc. - Baroro, Bacnotan, La Union, 2515 2515
                Bacnotan
              </p>

              <h3>Data Controller</h3>

              <p>Club Nalu Reservation</p>
              <p>Email: naluresortclub@gmail.com</p>

              <h3>Types of Data Collected</h3>

              <p>
                Among the types of Personal Data that this Application collects,
                by itself or through third parties, there are:Cookie, Usage
                data, First Name, Last Name, Phone number, Address, Fax number,
                Country, State, Province, Email address and ZIP/Postal code.
                Other Personal Data collected may be described in other sections
                of this privacy policy or by dedicated explanation text
                contextually with the Data collection. The Personal Data may be
                freely provided by the User, or collected automatically when
                using this Application. Any use of Cookies - or of other
                tracking tools - by this Application or by the owners of third
                party services used by this Application, unless stated
                otherwise, serves to identify Users and remember their
                preferences, for the sole purpose of providing the service
                required by the User. Failure to provide certain Personal Data
                may make it impossible for this Application to provide its
                services. Users are responsible for any Personal Data of third
                parties obtained, published or shared through this Application
                and confirm that they have the third party's consent to provide
                the Data to the Owner.
              </p>

              <h2>Mode and place of processing the Data</h2>

              <h3>Methods of Processing</h3>

              <p>
                The Data Controller processes the Data of Users in a proper
                manner and shall take appropriate security measures to prevent
                unauthorized access, disclosure, modification, or unauthorized
                destruction of the Data. The Data processing is carried out
                using computers and/or IT enabled tools, following
                organizational procedures and modes strictly related to the
                purposes indicated. In addition to the Data Controller, in some
                cases, the Data may be accessible to certain types of persons in
                charge, involved with the operation of the site (administration,
                sales, marketing, legal, system administration) or external
                parties (such as third party technical service providers, mail
                carriers, hosting providers, IT companies, communications
                agencies) appointed, if necessary, as Data Processors by the
                Owner. The updated list of these parties may be requested from
                the Data Controller at any time.
              </p>

              <h3>Place</h3>

              <p>
                The Data is processed at the Data Controller's operating offices
                and in any other places where the parties involved with the
                processing are located. For further information, please contact
                the Data Controller.
              </p>

              <h3> Retention Time</h3>

              <p>
                The Data is kept for the time necessary to provide the service
                requested by the User, or stated by the purposes outlined in
                this document, and the User can always request that the Data
                Controller suspend or remove the data.
              </p>

              <h3>The use of the collected Date</h3>

              <p>
                The Data concerning the User is collected to allow the Owner to
                provide its services, as well as for the following
                purposes:Analytics, Interaction with external social networks
                and platforms, Access to third party services' accounts,
                Advertising, Contacting the User, Displaying content from
                external platforms, Handling payments, Infrastructure
                monitoring, Registration and authentication and Remarketing and
                Behavioral Targeting. The Personal Data used for each purpose is
                outlined in the specific sections of this document.
              </p>
              <h3>Facebook permissions asked by this application</h3>

              <p>
                This Application may ask for some Facebook permissions allowing
                it to perform actions with the User's Facebook account and to
                retrieve information, including Personal Data, from it. For more
                information about the following permissions, refer to the
                Facebook permissions documentation and to the Facebook privacy
                policy. The permissions asked are the following:
              </p>
              <h3>Basic information</h3>
              <p>
                By default, this includes certain User’s Data such as id, name,
                picture, gender, and their locale. Certain connections of the
                User, such as the Friends, are also available. If the user has
                made more of their data public, more information will be
                available.
              </p>
              <h3>Email</h3>
              <p>Provides access to the User's primary email address.</p>
            </div>
            {/* Detailed Information Section */}
            <section className="privacy-details">
              <h3>Detailed information on the processing of Personal Data</h3>

              <p>
                Personal Data is collected for the following purposes and using
                the following services:
              </p>

              <details className="privacy-dropdown">
                <summary>Access to third party services' accounts</summary>
                <div className="privacy-dropdown-content">
                  These services allow this Application to access Data from your
                  account on a third party service and perform actions with it.
                  These services are not activated automatically, but require
                  explicit authorization by the User. Access to the Facebook
                  account (This Application) This service allows this
                  Application to connect with the User's account on the Facebook
                  social network, provided by Facebook, Inc Permissions asked:
                  Email. Place of processing: USA – Privacy Policy Access to the
                  X account (X, CORP.) This service allows this Application to
                  connect with the User's account on the X social network,
                  provided by X, CORP. Personal Data collected: Various types of
                  Data as specified in the privacy policy of the service. Place
                  of processing: USA – Privacy Policy
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Advertising</summary>
                <div className="privacy-dropdown-content">
                  These services allow User Data to be utilized for advertising
                  communication purposes displayed in the form of banners and
                  other advertisements on this Application, possibly based on
                  User interests. This does not mean that all Personal Data are
                  used for this purpose. Information and conditions of use are
                  shown below. Some of the services listed below may use Cookies
                  to identify Users or they may use the behavioral retargeting
                  technique, i.e. displaying ads tailored to the User’s
                  interests and behavior, including those detected outside this
                  Application. For more information, please check the privacy
                  policies of the relevant services.
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Analytics</summary>
                <div className="privacy-dropdown-content">
                  The services contained in this section enable the Owner to
                  monitor and analyze web traffic and can be used to keep track
                  of User behavior. Google Analytics (Google Inc.) Google
                  Analytics is a web analysis service provided by Google Inc.
                  (“Google”). Google utilizes the Data collected to track and
                  examine the use of this Application, to prepare reports on its
                  activities and share them with other Google services. Google
                  may use the Data collected to contextualize and personalize
                  the ads of its own advertising network. Personal Data
                  collected: Cookie and Usage data.
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Contacting the User</summary>
                <div className="privacy-dropdown-content">
                  Contact form (This Application) By filling in the contact form
                  with their Data, the User authorizes this Application to use
                  these details to reply to requests for information, quotes or
                  any other kind of request as indicated by the form’s header.
                  Personal Data collected: Address, Country, Email address, Fax
                  number, First Name, Last Name, Phone number, Province, State
                  and ZIP/Postal code. Phone contact (This Application) Users
                  that provided their phone number might be contacted for
                  commercial or promotional purposes related to this
                  Application, as well as for fulfilling support requests.
                  Personal Data collected: Phone number.
                </div>
              </details>
              {/* Additional Privacy Policy Details */}

              <details className="privacy-dropdown">
                <summary>Handling payments</summary>
                <div className="privacy-dropdown-content">
                  Payment processing services enable this Application to process
                  payments by credit card, bank transfer or other means. To
                  ensure greater security, this Application shares only the
                  information necessary to execute the transaction with the
                  financial intermediaries handling the transaction. Some of
                  these services may also enable the sending of timed messages
                  to the User, such as emails containing invoices or
                  notifications concerning the payment.
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Infrastructure monitoring</summary>
                <div className="privacy-dropdown-content">
                  These services allow this Application to monitor the use and
                  behavior of its components so its performance, operation,
                  maintenance and troubleshooting can be improved. Which
                  Personal Data are processed depends on the characteristics and
                  mode of implementation of these services, whose function is to
                  filter the activities of this Application. New Relic (New
                  Relic) New Relic is a monitoring service provided by New Relic
                  Inc. The way New Relic is integrated means that it filters all
                  traffic of this Application, i.e., communication between the
                  Application and the User's browser or device, while also
                  allowing analytical data on this Application to be collected.
                  Personal Data collected: Various types of Data as specified in
                  the privacy policy of the service. Place of processing: USA –
                  Privacy Policy Pingdom (Pingdom AB) Pingdom is a monitoring
                  service provided by Pingdom AB. Personal Data collected:
                  Cookie and Usage data. Place of processing: Sweden – Privacy
                  Policy
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>
                  Interaction with external social networks and platforms
                </summary>
                <div className="privacy-dropdown-content">
                  These services allow interaction with social networks or other
                  external platforms directly from the pages of this
                  Application. The interaction and information obtained by this
                  Application are always subject to the User’s privacy settings
                  for each social network. If a service enabling interaction
                  with social networks is installed it may still collect traffic
                  data for the pages where the service is installed, even when
                  Users do not use it. ShareThis (Sharethis Inc.) ShareThis is a
                  service provided by ShareThis Inc., which displays a widget
                  that allows interaction with social networks and external
                  platforms as well as sharing the contents of this Application.
                  Depending on the configuration, this service can display
                  widgets belonging to third parties such as the managers of
                  social networks where interactions are shared. In this case,
                  also the third parties that provide the widget will be
                  informed of interactions and Usage Data on the pages where
                  this service is installed. Personal Data collected: Cookie and
                  Usage data. Place of processing: USA – Privacy Policy AddThis
                  (Addthis Inc.) AddThis is a service provided by Clearspring
                  Technologies Inc., which displays a widget that allows
                  interaction with social networks and external platforms as
                  well as sharing the contents of this Application. Depending on
                  the configuration, this service can display widgets belonging
                  to third parties such as the managers of social networks where
                  interactions are shared. In this case, also the third parties
                  that provide the widget will be informed of interactions and
                  Usage Data on the pages where this service is installed.
                  Personal Data collected: Cookie and Usage data. Place of
                  processing: USA – Privacy Policy Facebook Like button and
                  social widgets (Facebook, Inc.) The Facebook Like button and
                  social widgets are services allowing interaction with the
                  Facebook social network provided by Facebook, Inc. Personal
                  Data collected: Cookie and Usage data. Place of processing:
                  USA – Privacy Policy Google+ +1 button and social widgets
                  (Google Inc.) The Google+ +1 button and social widgets are
                  services allowing interaction with the Google+ social network
                  provided by Google Inc. Personal Data collected: Cookie and
                  Usage data. Place of processing: USA – Privacy Policy X button
                  and social widgets (X, CORP.) The X button and social widgets
                  are services allowing interaction with the X social network
                  provided by X, CORP. Personal Data collected: Cookie and Usage
                  data. Place of processing: USA – Privacy Policy
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Registration and authentication</summary>
                <div className="privacy-dropdown-content">
                  By registering or authenticating, Users allow this Application
                  to identify them and give them access to dedicated services.
                  Depending on what is described below, third parties may
                  provide registration and authentication services. In this
                  case, this Application will be able to access some Data,
                  stored by these third party services, for registration or
                  identification purposes. Facebook Authentication (Facebook,
                  Inc.) Facebook Authentication is a registration and
                  authentication service provided by Facebook, Inc. and is
                  connected to the Facebook social network. Personal Data
                  collected: Various types of Data as specified in the privacy
                  policy of the service. Place of processing: USA – Privacy
                  Policy
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Remarketing and Behavioral Targeting</summary>
                <div className="privacy-dropdown-content">
                  These services allow this Application and its partners to
                  inform, optimize and serve advertising based on past use of
                  this Application by the User. This activity is performed by
                  tracking Usage Data and by using Cookies, information that is
                  transferred to the partners that manage the remarketing and
                  behavioral targeting activity. AdWords Remarketing (Google
                  Inc.) AdWords Remarketing is a Remarketing and Behavioral
                  Targeting service provided by Google Inc. that connects the
                  activity of this Application with the Adwords advertising
                  network and the Doubleclick Cookie. Personal Data collected:
                  Cookie and Usage data. Place of processing: USA – Privacy
                  Policy – Opt Out
                </div>
              </details>
            </section>

            <div className="privacy-modal-footer">
              <button type="button" onClick={() => setShowPrivacy(false)}>
                Ok, I got it
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
                aria-label="Close Cookie Policy"
                onClick={() => setShowCookiePolicy(false)}
              >
                ×
              </button>
            </header>

            <div className="privacy-modal-content">
              <h3>Extended Cookie Policy</h3>

              <p>
                This Application uses Cookies and similar technologies to
                provide and improve its services. This policy explains the
                categories of cookies that may be used when you visit this
                website.
              </p>
            </div>

            <section className="privacy-details">
              <h3>Detailed information on the use of Cookies</h3>

              <details className="privacy-dropdown">
                <summary>
                  Activity strictly necessary for the functioning of the service
                </summary>

                <div className="privacy-dropdown-content">
                  These cookies are necessary for the website to function
                  correctly and to provide services requested by visitors, such
                  as navigating pages and using the booking features.
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>
                  Activity regarding the saving of preferences, optimization,
                  and statistics
                </summary>

                <div className="privacy-dropdown-content">
                  These cookies may be used to remember visitor preferences and
                  understand how visitors interact with the website, helping
                  improve its performance and usability.
                </div>
              </details>

              <details className="privacy-dropdown">
                <summary>Other activities involving the use of Cookies</summary>

                <div className="privacy-dropdown-content">
                  Additional cookies may be used if the website integrates
                  third-party services. The actual cookies used depend on the
                  services enabled on this website.
                </div>
              </details>
            </section>

            <div className="privacy-modal-footer">
              <button type="button" onClick={() => setShowCookiePolicy(false)}>
                Ok, I got it
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
            <p className="cookie-preferences-intro">
              Hi! Could we please enable some additional services? You can
              always change or withdraw your consent later. Here you can assess
              and customize the services that we'd like to use on this website.
              You're in charge! Enable or disable services as you see fit. To
              learn more, please read our{" "}
              <button
                type="button"
                className="cookie-inline-link"
                onClick={() => {
                  setShowCookiePreferences(false);
                  setShowPrivacy(true);
                }}
              >
                privacy policy
              </button>
              .
            </p>

            <div className="cookie-preference-service">
              <div className="cookie-preference-toggle-row">
                <button
                  type="button"
                  className="cookie-toggle cookie-toggle-required"
                  role="switch"
                  aria-checked="true"
                  aria-label="Necessary cookies (always required)"
                  title="Necessary cookies are always enabled"
                  onClick={() =>
                    setShowNecessaryCookieInfo((visible) => !visible)
                  }
                >
                  <span />
                </button>
                <strong>
                  Necessary <small>(always required)</small>
                </strong>
                <span className="cookie-service-count">↓ 1 service</span>
              </div>
              <p>
                Necessary cookies help make a website usable by enabling basic
                functions like page navigation and access to secure areas of the
                website. The website cannot function properly without these
                cookies.
              </p>
              {showNecessaryCookieInfo && (
                <p className="cookie-necessary-note" role="status">
                  Necessary cookies are always enabled because the booking
                  website needs them to function. They cannot be switched off.
                </p>
              )}
            </div>

            <button
              type="button"
              className="cookie-preferences-save"
              onClick={() => setShowCookiePreferences(false)}
            >
              Save
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
                aria-label="Close Accessibility"
                onClick={() => setShowAccessibility(false)}
              >
                ×
              </button>
            </header>
            <div className="accessibility-modal-content">
              <div className="accessibility-icon" aria-hidden="true">
                ♿
              </div>
              <h3>
                We believe in hospitality that puts all people at the center
              </h3>
              <p>
                For this reason, our booking system is designed to be accessible
                to everyone, in accordance with European accessibility
                legislation (European Accessibility Act - EAA) and the WCAG 2.1
                Guidelines, level A and AA.
              </p>
              <p>
                Simplified navigation, compatibility with assistive
                technologies, optimized contrast and readability: every detail
                is designed to ensure a smooth and inclusive experience for
                everyone.
              </p>
              <h3>Accessibility features</h3>
              <p>
                You can navigate interactive controls using a keyboard, and the
                booking page uses labels and dialog descriptions to help
                assistive technologies identify key controls. If you encounter a
                barrier while using this website, please contact the resort for
                assistance.
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

export default Reservation;
