import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminDashboard.css";
import "./AdminBookings.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://club-nalu-api.onrender.com"
).replace(/\/$/, "");

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    const token = sessionStorage.getItem("clubNaluAdminToken");

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/bookings`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        sessionStorage.removeItem("clubNaluAdminToken");
        sessionStorage.removeItem("clubNaluAdmin");

        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load bookings.");
      }

      setBookings(result.data?.bookings || []);
      setLastRefreshed(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBookings]);

  const refreshBookings = () => {
    setLoading(true);
    setError("");
    loadBookings();
  };

  const money = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    return [
      booking.booking_reference,
      booking.guest_name,
      booking.guest_email,
      booking.guest_phone,
      booking.accommodation_name,
      booking.payment_status,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchText));
  });

  return (
    <main className="admin-dashboard-page">
      <div className="admin-bookings-page">
        <header className="admin-bookings-header">
          <div>
            <span className="admin-bookings-eyebrow">RESORT MANAGEMENT</span>

            <h1>Bookings</h1>

            <p>View and search guest reservations at Club Nalu.</p>
          </div>

          <button
            type="button"
            className="admin-bookings-refresh"
            onClick={refreshBookings}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh bookings"}
          </button>
        </header>

        {lastRefreshed && (
          <p className="admin-bookings-last-refreshed">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </p>
        )}

        <section className="admin-bookings-summary">
          <div>
            <span>Total records loaded</span>
            <strong>{bookings.length}</strong>
          </div>

          <div>
            <span>Search results</span>
            <strong>{filteredBookings.length}</strong>
          </div>
        </section>

        <section className="admin-bookings-panel">
          <div className="admin-bookings-toolbar">
            <div>
              <h2>Reservation records</h2>
              <p>
                Search by reference, guest, accommodation, or payment status.
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bookings..."
              aria-label="Search bookings"
            />
          </div>

          {error && (
            <div className="admin-bookings-error" role="alert">
              <p>{error}</p>

              <button
                type="button"
                onClick={refreshBookings}
                disabled={loading}
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="admin-bookings-message">
              Loading reservations...
            </div>
          ) : !error && filteredBookings.length === 0 ? (
            <div className="admin-bookings-message">
              {search
                ? "No reservations match your search."
                : "No reservations have been recorded yet."}
            </div>
          ) : (
            !error && (
              <div className="admin-bookings-table-wrapper">
                <table className="admin-bookings-table">
                  <thead>
                    <tr>
                      <th>Booking reference</th>
                      <th>Guest</th>
                      <th>Accommodation</th>
                      <th>Stay dates</th>
                      <th>Guests</th>
                      <th>Amount</th>
                      <th>Payment status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong className="admin-booking-reference">
                            {booking.booking_reference}
                          </strong>
                        </td>

                        <td>
                          <strong>{booking.guest_name || "Guest"}</strong>

                          <span className="admin-booking-secondary">
                            {booking.guest_email || "—"}
                          </span>

                          <span className="admin-booking-secondary">
                            {booking.guest_phone || ""}
                          </span>
                        </td>

                        <td>{booking.accommodation_name || "—"}</td>

                        <td>
                          <span>{formatDate(booking.check_in)}</span>

                          <span className="admin-booking-secondary">
                            to {formatDate(booking.check_out)}
                          </span>
                        </td>

                        <td>
                          {Number(booking.adults || 0) +
                            Number(booking.children || 0)}{" "}
                          guests
                          <span className="admin-booking-secondary">
                            {booking.rooms || 1} room(s)
                          </span>
                        </td>

                        <td>{money(booking.amount)}</td>

                        <td>
                          <span
                            className={`admin-booking-status status-${String(
                              booking.payment_status || "unknown",
                            )
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")}`}
                          >
                            {(booking.payment_status || "Unknown").replace(
                              /_/g,
                              " ",
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminBookings;
