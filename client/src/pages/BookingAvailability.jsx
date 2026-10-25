import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingAvailability.css";

import deluxeImage1 from "../assets/booking2.jpg";
import deluxeImage2 from "../assets/booking3.jpg";
import deluxeImage3 from "../assets/home4.webp";
import deluxeImage4 from "../assets/booking4.jpg";
import deluxeImage5 from "../assets/booking5.jpg";
import deluxeImage6 from "../assets/booking6.jpg";

import suiteImage1 from "../assets/booking7.jpg";
import suiteImage2 from "../assets/booking8.jpg";
import suiteImage3 from "../assets/booking9.jpg";
import suiteImage4 from "../assets/booking10.jpg";
import suiteImage5 from "../assets/booking11.jpg";
import suiteImage6 from "../assets/booking12.jpg";

import nestImage1 from "../assets/booking13.jpg";
import nestImage2 from "../assets/booking14.jpg";
import nestImage3 from "../assets/booking15.jpg";
import nestImage4 from "../assets/booking16.jpg";
import nestImage5 from "../assets/booking17.jpg";

import villaImage1 from "../assets/home6.webp";
import villaImage2 from "../assets/booking18.jpg";
import villaImage3 from "../assets/booking19.jpg";
import villaImage4 from "../assets/blog5.webp";
import villaImage5 from "../assets/booking20.jpg";

import superiorImage1 from "../assets/superior.jpg";
import superiorImage2 from "../assets/superior2.jpg";

import familyImage1 from "../assets/deluxe family.jpg";
import familyImage2 from "../assets/deluxe family2.jpg";
import familyImage3 from "../assets/deluxe family3.jpg";
import familyImage4 from "../assets/deluxe family4.jpg";
import familyImage5 from "../assets/deluxe family5.jpg";

import luxuryVillaVideo from "../assets/luxury.mp4";
import presidentialVideo from "../assets/luxury2.mp4";
import presidentialImage from "../assets/luxury3.jpg";

import poolImage1 from "../assets/pool1.jpeg";
import poolImage2 from "../assets/pool2.jpeg";
import poolImage3 from "../assets/pool3.jpeg";
import poolImage4 from "../assets/pool4.jpeg";
import poolImage5 from "../assets/pool5.jpeg";
import poolImage6 from "../assets/pool6.jpeg";
import poolImage7 from "../assets/pool7.jpeg";
import poolImage8 from "../assets/pool8.jpeg";
import poolImage9 from "../assets/pool9.jpeg";
import poolImage10 from "../assets/pool10.jpeg";
import poolImage11 from "../assets/pool11.jpeg";

const roomOptions = [
  {
    name: "Deluxe",
    accommodationId: 2,
    size: "25 m²",
    guests: "4 guests",
    description:
      "Comfortable beachfront accommodation with a relaxing island atmosphere and easy access to resort facilities.",
    amenities: [
      "Air Conditioning",
      "Sea View",
      "Pool View",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Private Balcony",
      "Daily Housekeeping",
    ],
    price: 6615,
    oldPrice: null,
    images: [
      deluxeImage1,
      deluxeImage2,
      deluxeImage3,
      deluxeImage4,
      deluxeImage5,
      deluxeImage6,
    ],
  },
  {
    name: "Suite",
    accommodationId: 4,
    size: "42 m²",
    guests: "4 guests",
    description:
      "Spacious beachfront accommodations featuring a bathtub, comfortable interiors, and easy access to resort facilities.",
    amenities: [
      "Air Conditioning",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Private Balcony",
      "Daily Housekeeping",
    ],
    price: 8950,
    oldPrice: null,
    images: [
      suiteImage1,
      suiteImage2,
      suiteImage3,
      suiteImage4,
      suiteImage5,
      suiteImage6,
    ],
  },
  {
    name: "Luxury Pool Villa",
    accommodationId: 6,
    size: "Private villa",
    guests: "8 guests",
    description:
      "A private luxury pool villa designed for a relaxed island stay, with generous space and exclusive villa comforts.",
    amenities: [
      "Air Conditioning",
      "Private Pool",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Kitchen & Dining",
      "Daily Housekeeping",
    ],
    price: 13150,
    oldPrice: null,
    images: [luxuryVillaVideo],
    mediaType: "video",
  },
  {
    name: "Luxury Pool Villa 2-Bedroom",
    accommodationId: 7,
    size: "2-bedroom villa",
    guests: "10 guests",
    description:
      "A private two-bedroom pool villa with generous indoor and outdoor space for a comfortable island escape.",
    amenities: [
      "Air Conditioning",
      "Private Pool",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Kitchen & Dining",
      "Daily Housekeeping",
    ],
    price: 15000,
    oldPrice: null,
    images: [
      poolImage1,
      poolImage2,
      poolImage3,
      poolImage4,
      poolImage5,
      poolImage6,
      poolImage7,
      poolImage8,
      poolImage9,
      poolImage10,
      poolImage11,
    ],
  },
  {
    name: "Presidential Suites",
    accommodationId: 8,
    size: "Presidential suite",
    guests: "20–35 guests",
    description:
      "An expansive presidential stay designed for large groups, with premium comforts and generous space for a memorable resort experience.",
    amenities: [
      "Air Conditioning",
      "Sea View",
      "Pool View",
      "Garden View",
      "Free Wi-Fi",
      "Breakfast (BLD)",
      "Private Pool",
      "Kitchen & Dining",
      "Daily Housekeeping",
    ],
    price: 25000,
    oldPrice: null,
    images: [presidentialVideo, presidentialImage],
    mediaTypes: ["video", "image"],
  },
  {
    name: "Nest",
    accommodationId: 5,
    size: "25 m²",
    guests: "10 guests",
    description:
      "Enjoy a relaxing beachfront stay with direct access to the infinity pool, beach, and lush island surroundings.",
    amenities: [
      "Air Conditioning",
      "Sea View",
      "Free Wi-Fi",
      "BLD",
      "Garden View",
      "Daily Housekeeping",
    ],
    price: 9600,
    oldPrice: null,
    images: [nestImage1, nestImage2, nestImage3, nestImage4, nestImage5],
  },
  {
    name: "3-Bedroom Villa",
    accommodationId: 9,
    size: "177 m²",
    guests: "15 guests",
    description:
      "Spacious three-bedroom beachfront accommodation with a kitchen, dining area, and generous space for a relaxing island stay.",
    amenities: [
      "Air Conditioning",
      "Sea View",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Private Pool",
      "Kitchen & Dining",
      "Daily Housekeeping",
    ],
    price: 17750,
    oldPrice: null,
    images: [villaImage1, villaImage2, villaImage3, villaImage4, villaImage5],
  },
  {
    name: "Superior Room",
    accommodationId: 1,
    size: "20 m²",
    guests: "2 guests",
    description:
      "A comfortable, thoughtfully appointed room for a restful stay surrounded by the resort's tropical setting.",
    amenities: [
      "Air Conditioning",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Daily Housekeeping",
    ],
    price: 5150,
    oldPrice: null,
    images: [superiorImage1, superiorImage2],
  },
  {
    name: "Deluxe Family Pool View",
    accommodationId: 3,
    size: "32 m²",
    guests: "6–8 guests",
    description:
      "A spacious family-friendly room with a pool view, comfortable interiors, and room for everyone to unwind.",
    amenities: [
      "Air Conditioning",
      "Pool View",
      "Garden View",
      "Free Wi-Fi",
      "BLD",
      "Private Balcony",
      "Daily Housekeeping",
    ],
    price: 8350,
    oldPrice: null,
    images: [
      familyImage1,
      familyImage2,
      familyImage3,
      familyImage4,
      familyImage5,
    ],
  },
];

function parseLocalDate(value) {
  if (!value) return new Date();

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day, 12);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function displayDate(value, withYear = false) {
  if (!value) return "Select date";

  return parseLocalDate(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

function BookingAvailability({
  checkIn,
  checkOut,
  adults,
  rooms,
  promoCode,
  onClose,
}) {
  const navigate = useNavigate();
  // Lock background scrolling while the booking popup is mounted.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = parseLocalDate(checkIn);

    return new Date(date.getFullYear(), date.getMonth(), 1, 12);
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [galleryIndexes, setGalleryIndexes] = useState({});
  const [expandedAmenities, setExpandedAmenities] = useState({});

  const [calendarCheckIn, setCalendarCheckIn] = useState(checkIn);
  const [calendarCheckOut, setCalendarCheckOut] = useState(checkOut);

  const [roomCount, setRoomCount] = useState(Math.max(1, Number(rooms) || 1));

  const [adultCount, setAdultCount] = useState(
    Math.max(1, Number(adults) || 2),
  );

  const [kidsCount, setKidsCount] = useState(0);
  const [showPromoInput, setShowPromoInput] = useState(Boolean(promoCode));
  const [localPromoCode, setLocalPromoCode] = useState(promoCode || "");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const monthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const nights = Math.max(
    1,
    Math.round(
      (parseLocalDate(calendarCheckOut) - parseLocalDate(calendarCheckIn)) /
        86400000,
    ),
  );

  const days = useMemo(() => {
    const firstDay = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
      12,
    );

    const mondayOffset = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    ).getDate();

    return [
      ...Array.from({ length: mondayOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [calendarMonth]);

  const chooseDate = (day) => {
    const chosen = dateKey(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day, 12),
    );

    if (
      !calendarCheckIn ||
      (calendarCheckIn &&
        calendarCheckOut &&
        calendarCheckIn !== calendarCheckOut)
    ) {
      setCalendarCheckIn(chosen);
      setCalendarCheckOut("");
      return;
    }

    if (chosen <= calendarCheckIn) {
      setCalendarCheckIn(chosen);
      setCalendarCheckOut("");
    } else {
      setCalendarCheckOut(chosen);
    }
  };

  const money = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);

  // Shared navigation for both booking buttons.
  const continueToReservation = () => {
    if (!calendarCheckIn || !calendarCheckOut) {
      setAvailabilityMessage(
        "Please select both check-in and check-out dates.",
      );
      return;
    }

    if (calendarCheckOut <= calendarCheckIn) {
      setAvailabilityMessage("Check-out must be after check-in.");
      return;
    }

    if (!selectedRoom) {
      setAvailabilityMessage(
        "Please select an accommodation before continuing.",
      );
      return;
    }

    const selectedRoomDetails = roomOptions.find(
      (room) => room.name === selectedRoom,
    );

    if (!selectedRoomDetails?.accommodationId) {
      setAvailabilityMessage(
        "We could not identify the selected accommodation. Please select it again.",
      );
      return;
    }

    const bookingDetails = {
      checkIn: calendarCheckIn,
      checkOut: calendarCheckOut,
      adults: adultCount,
      kids: kidsCount,
      rooms: roomCount,
      promoCode: localPromoCode.trim(),
      room: selectedRoomDetails.name,
      roomName: selectedRoomDetails.name,
      accommodationId: selectedRoomDetails.accommodationId,
      roomPricePerNight: selectedRoomDetails.price,
      ...(selectedRoom ? { selectedRoom } : {}),
    };

    // Save booking information so the reservation page can retrieve it.
    sessionStorage.setItem(
      "clubNaluBookingDetails",
      JSON.stringify(bookingDetails),
    );

    const reservationParams = new URLSearchParams({
      checkIn: calendarCheckIn,
      checkOut: calendarCheckOut,
      adults: String(adultCount),
      kids: String(kidsCount),
      rooms: String(roomCount),
      promoCode: localPromoCode.trim(),
      room: selectedRoomDetails.name,
      roomName: selectedRoomDetails.name,
      accommodationId: String(selectedRoomDetails.accommodationId),
    });

    onClose?.();

    navigate(`/reservation?${reservationParams.toString()}`);
  };

  return (
    <div className="availability-overlay" onClick={onClose}>
      <section
        className="availability-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="availability-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="availability-close"
          type="button"
          onClick={onClose}
          aria-label="Close availability"
        >
          ×
        </button>

        <aside className="availability-calendar-panel">
          <div className="availability-calendar-heading">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setCalendarMonth(
                  (date) =>
                    new Date(date.getFullYear(), date.getMonth() - 1, 1, 12),
                )
              }
            >
              ‹
            </button>

            <strong>{monthLabel}</strong>

            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setCalendarMonth(
                  (date) =>
                    new Date(date.getFullYear(), date.getMonth() + 1, 1, 12),
                )
              }
            >
              ›
            </button>
          </div>

          <button
            className="availability-today"
            type="button"
            onClick={() =>
              setCalendarMonth(
                new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1,
                  12,
                ),
              )
            }
          >
            Today
          </button>

          <div className="availability-calendar-grid availability-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="availability-calendar-grid availability-days">
            {days.map((day, index) => {
              if (!day) {
                return (
                  <span
                    className="availability-empty-day"
                    key={`empty-${index}`}
                  />
                );
              }

              const key = dateKey(
                new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                  day,
                  12,
                ),
              );

              const isStart = key === calendarCheckIn;
              const isEnd = key === calendarCheckOut;

              const inRange =
                calendarCheckIn &&
                calendarCheckOut &&
                key > calendarCheckIn &&
                key < calendarCheckOut;

              return (
                <button
                  key={key}
                  type="button"
                  className={`${isStart || isEnd ? "selected" : ""} ${
                    inRange ? "in-range" : ""
                  }`}
                  onClick={() => chooseDate(day)}
                  aria-pressed={Boolean(isStart || isEnd)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="availability-calendar-summary">
            <div>
              <span>Check-in</span>
              <strong>{displayDate(calendarCheckIn)}</strong>
            </div>

            <div>
              <span>Check-out</span>
              <strong>
                {calendarCheckOut
                  ? displayDate(calendarCheckOut)
                  : "Select date"}
              </strong>
            </div>

            <div>
              <span>Nights</span>
              <strong>{calendarCheckOut ? nights : "—"}</strong>
            </div>
          </div>

          <div className="availability-guest-controls">
            {Array.from({ length: roomCount }, (_, index) => (
              <section className="availability-room-guest-group" key={index}>
                <div className="availability-room-guest-heading">
                  <strong>Room #{index + 1}</strong>

                  {roomCount > 1 && (
                    <button
                      type="button"
                      className="availability-remove-room"
                      onClick={() =>
                        setRoomCount((count) => Math.max(1, count - 1))
                      }
                    >
                      Remove
                    </button>
                  )}

                  {index === roomCount - 1 && roomCount < 5 && (
                    <button
                      type="button"
                      className="availability-add-room"
                      onClick={() =>
                        setRoomCount((count) => Math.min(5, count + 1))
                      }
                    >
                      <span aria-hidden="true">＋</span> Add room
                    </button>
                  )}
                </div>

                <div className="availability-counter-row">
                  <span>Adults</span>

                  <div className="availability-counter">
                    <button
                      type="button"
                      aria-label="Remove adult"
                      disabled={adultCount <= 1}
                      onClick={() =>
                        setAdultCount((count) => Math.max(1, count - 1))
                      }
                    >
                      −
                    </button>

                    <output>{adultCount}</output>

                    <button
                      type="button"
                      aria-label="Add adult"
                      disabled={adultCount >= 35}
                      onClick={() =>
                        setAdultCount((count) => Math.min(35, count + 1))
                      }
                    >
                      ＋
                    </button>
                  </div>
                </div>

                <div className="availability-counter-row">
                  <span>Kids</span>

                  <div className="availability-counter">
                    <button
                      type="button"
                      aria-label="Remove child"
                      disabled={kidsCount <= 0}
                      onClick={() =>
                        setKidsCount((count) => Math.max(0, count - 1))
                      }
                    >
                      −
                    </button>

                    <output>{kidsCount}</output>

                    <button
                      type="button"
                      aria-label="Add child"
                      disabled={kidsCount >= 20}
                      onClick={() =>
                        setKidsCount((count) => Math.min(20, count + 1))
                      }
                    >
                      ＋
                    </button>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <button
            className="availability-check-button"
            type="button"
            onClick={continueToReservation}
          >
            Check availability
          </button>

          {availabilityMessage && (
            <p className="availability-validation-message" role="status">
              {availabilityMessage}
            </p>
          )}

          <div className="availability-promo-section">
            <button
              type="button"
              className="availability-promo-toggle"
              aria-expanded={showPromoInput}
              onClick={() => setShowPromoInput((visible) => !visible)}
            >
              I have a promo code{" "}
              <span aria-hidden="true">{showPromoInput ? "⌃" : "⌄"}</span>
            </button>

            {showPromoInput && (
              <label className="availability-promo-field">
                <span>Promo code</span>

                <input
                  type="text"
                  value={localPromoCode}
                  onChange={(event) => setLocalPromoCode(event.target.value)}
                  placeholder="Enter promo code"
                  aria-label="Promo code"
                />
              </label>
            )}
          </div>

          <p className="availability-calendar-hint">
            Select a check-in date, then select a check-out date.
          </p>
        </aside>

        <div className="availability-results">
          <div className="availability-benefits-banner">
            <div className="availability-benefits-title">
              <span>Only On</span>
              <strong>Official Website</strong>
            </div>

            <div className="availability-benefits-count">
              <b>3</b>

              <span>
                Exclusive
                <br />
                Benefits
              </span>
            </div>

            <ul>
              <li>10% Off In-Room Massage</li>

              <li>
                Complimentary Early Check-In and Late Check Out Subject to
                Availability
              </li>

              <li>Best Rate Guaranteed</li>
            </ul>

            <div className="availability-best-rate">
              <span>＋</span>

              <strong>
                Best Rate
                <br />
                Guarantee
              </strong>
            </div>
          </div>

          <div className="availability-rates-bar">
            <strong>Online Rates</strong>

            <span>This website&nbsp; {money(roomOptions[0].price)}</span>
          </div>

          <div className="availability-results-content">
            <h2 id="availability-title">Select the room that suits you best</h2>

            <div className="availability-stay-summary">
              <span>▢ &nbsp;{displayDate(calendarCheckIn, true)}</span>

              <span>▢ &nbsp;{displayDate(calendarCheckOut, true)}</span>

              <span>
                ◷ &nbsp;{calendarCheckOut ? nights : "—"} Night
                {nights === 1 ? "" : "s"}
              </span>

              <span>
                ♧ &nbsp;{adultCount} Adult
                {adultCount === 1 ? "" : "s"}
                {kidsCount
                  ? `, ${kidsCount} Kid${kidsCount === 1 ? "" : "s"}`
                  : ""}
              </span>

              <span>
                ▣ &nbsp;{roomCount} Room
                {roomCount === 1 ? "" : "s"}
              </span>
            </div>

            {(localPromoCode || promoCode) && (
              <p className="availability-promo-note">
                Promo code entered:{" "}
                <strong>{localPromoCode || promoCode}</strong>
              </p>
            )}

            {roomOptions.map((room) => {
              const imageIndex = galleryIndexes[room.name] || 0;

              const roomImages = room.images?.length ? room.images : [];

              const visibleAmenities = expandedAmenities[room.name]
                ? room.amenities
                : room.amenities.slice(0, 8);

              const changeImage = (direction) => {
                if (roomImages.length < 2) return;

                setGalleryIndexes((current) => ({
                  ...current,
                  [room.name]:
                    (imageIndex + direction + roomImages.length) %
                    roomImages.length,
                }));
              };

              const amenityIcons = {
                "Air Conditioning": "❄",
                "Sea View": "≋",
                "Pool View": "▤",
                "Garden View": "❧",
                "Free Wi-Fi": "⌁",
                "Breakfast (BLD)": "♨",
                "Private Balcony": "▥",
                "Daily Housekeeping": "✧",
              };

              return (
                <article
                  className={`availability-room-card ${
                    selectedRoom === room.name ? "room-selected" : ""
                  }`}
                  key={room.name}
                >
                  <div className="availability-room-gallery">
                    <div className="availability-room-image-wrap">
                      {room.mediaTypes?.[imageIndex] === "video" ||
                      (!room.mediaTypes && room.mediaType === "video") ? (
                        <video
                          src={roomImages[imageIndex]}
                          className="availability-room-image availability-room-video"
                          controls
                          muted
                          playsInline
                          preload="metadata"
                          aria-label={`${room.name} preview video`}
                        />
                      ) : (
                        <img
                          src={roomImages[imageIndex]}
                          alt={`${room.name} room photo ${imageIndex + 1}`}
                          className="availability-room-image"
                        />
                      )}

                      {room.oldPrice && (
                        <span className="availability-special-offer">
                          ◇ Special offer
                        </span>
                      )}

                      {roomImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="availability-gallery-arrow availability-gallery-prev"
                            aria-label={`Previous ${room.name} image`}
                            onClick={() => changeImage(-1)}
                          >
                            ‹
                          </button>

                          <button
                            type="button"
                            className="availability-gallery-arrow availability-gallery-next"
                            aria-label={`Next ${room.name} image`}
                            onClick={() => changeImage(1)}
                          >
                            ›
                          </button>
                        </>
                      )}

                      {roomImages.length > 1 && (
                        <span className="availability-gallery-count">
                          {imageIndex + 1} / {roomImages.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="availability-room-info">
                    <h3>{room.name}</h3>

                    <div className="availability-room-meta">
                      <span>▧ &nbsp;{room.size}</span>

                      <span>♙ &nbsp;Max guests: {room.guests}</span>
                    </div>

                    <p>{room.description}</p>

                    <div className="availability-amenities availability-premium-amenities">
                      {visibleAmenities.map((amenity) => (
                        <span
                          className="availability-amenity-chip"
                          key={amenity}
                        >
                          <span
                            className="availability-amenity-icon"
                            aria-hidden="true"
                          >
                            {amenityIcons[amenity] || "✧"}
                          </span>

                          {amenity}
                        </span>
                      ))}
                    </div>

                    {room.amenities.length > 8 && (
                      <button
                        type="button"
                        className="availability-see-more"
                        onClick={() =>
                          setExpandedAmenities((current) => ({
                            ...current,
                            [room.name]: !current[room.name],
                          }))
                        }
                      >
                        {expandedAmenities[room.name]
                          ? "See less ⌃"
                          : "See more ⌄"}
                      </button>
                    )}
                  </div>

                  <div className="availability-room-price">
                    <span>Starting from</span>

                    <strong>{money(room.price)}</strong>

                    <small>per night</small>

                    {room.oldPrice && (
                      <>
                        <small className="availability-discount">
                          <del>{money(room.oldPrice)}</del>
                        </small>

                        <small>
                          Taxes excluded
                          <br />
                          for {nights} night
                          {nights === 1 ? "" : "s"}
                        </small>
                      </>
                    )}

                    <button
                      type="button"
                      className={
                        selectedRoom === room.name ? "selected-room-button" : ""
                      }
                      onClick={() => {
                        setSelectedRoom(room.name);
                        setAvailabilityMessage("");
                      }}
                    >
                      {selectedRoom === room.name ? "Selected" : "Book Now"}{" "}
                      <span aria-hidden="true">⌄</span>
                    </button>
                  </div>
                </article>
              );
            })}

            {selectedRoom && (
              <div className="availability-selection-notice">
                <span>{selectedRoom} selected</span>

                <button type="button" onClick={continueToReservation}>
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default BookingAvailability;
