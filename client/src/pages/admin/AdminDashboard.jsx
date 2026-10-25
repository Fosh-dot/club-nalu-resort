import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://club-nalu-api.onrender.com";

// Change this to your deployed public website URL if it uses a different domain.
const PUBLIC_SITE_URL = "/";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const token = sessionStorage.getItem("clubNaluAdminToken");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      try {
        const sessionResponse = await fetch(`${API_URL}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sessionResult = await sessionResponse.json().catch(() => ({}));

        if (
          !sessionResponse.ok ||
          !sessionResult.success ||
          !sessionResult.data?.admin
        ) {
          sessionStorage.removeItem("clubNaluAdminToken");
          sessionStorage.removeItem("clubNaluAdmin");
          navigate("/admin/login", { replace: true });
          return;
        }

        if (!isMounted) return;

        const currentAdmin = sessionResult.data.admin;

        setAdmin(currentAdmin);
        sessionStorage.setItem("clubNaluAdmin", JSON.stringify(currentAdmin));

        setIsLoadingStats(true);

        const statsResponse = await fetch(
          `${API_URL}/api/admin/dashboard-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const statsResult = await statsResponse.json().catch(() => ({}));

        if (!statsResponse.ok || !statsResult.success) {
          throw new Error(
            statsResult.message || "Unable to load dashboard statistics.",
          );
        }

        if (isMounted) {
          setStats(statsResult.data);
          setStatsError("");
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);

        if (isMounted) {
          setStatsError(
            error.message || "Unable to load dashboard statistics.",
          );
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
          setIsLoadingStats(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("clubNaluAdminToken");
    sessionStorage.removeItem("clubNaluAdmin");
    navigate("/admin/login", { replace: true });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  if (isCheckingSession) {
    return (
      <main className="admin-dashboard-page">
        <p style={{ padding: "40px" }}>Verifying administrator session...</p>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  const navigationItems = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/payments", label: "Payment Verification" },
    { to: "/admin/settings", label: "Bank Settings" },
  ];

  const firstName = admin.fullName?.trim().split(/\s+/)[0] || "Administrator";

  const avatarLetter = firstName.charAt(0).toUpperCase();

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <h2>CLUB NALU</h2>
            <p>RESORT MANAGEMENT</p>
          </div>

          <p className="admin-sidebar-label">Workspace</p>

          <nav className="admin-sidebar-nav" aria-label="Admin navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.label}
              </NavLink>
            ))}

            <a
              href={PUBLIC_SITE_URL}
              className="admin-visit-website-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">🌐</span>
              <span>Visit Main Website</span>
            </a>
          </nav>

          <button
            type="button"
            className="admin-dashboard-logout"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </aside>

        <section className="admin-dashboard-main">
          <header className="admin-dashboard-topbar">
            <div>
              <h1>Dashboard Overview</h1>
              <p>Club Nalu Resort · Management Portal</p>
            </div>

            <div className="admin-dashboard-user">
              <div className="admin-dashboard-avatar">{avatarLetter}</div>

              <div>
                <strong>{admin.fullName}</strong>
                <span>{admin.role?.replace("_", " ")}</span>
              </div>
            </div>
          </header>

          <div className="admin-dashboard-content">
            <div className="admin-dashboard-welcome">
              <h2>Welcome back, {firstName}</h2>
              <p>
                Monitor reservations and payment activity across your resort.
              </p>
            </div>

            {statsError && (
              <div role="alert" className="admin-dashboard-panel">
                <p>{statsError}</p>

                <button type="button" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            )}

            <div className="admin-dashboard-stats">
              <article className="admin-stat-card">
                <span>Total Bookings</span>
                <h3>{isLoadingStats ? "…" : (stats?.totalBookings ?? "—")}</h3>
                <p>Reservations recorded</p>
              </article>

              <article className="admin-stat-card">
                <span>Upcoming Bookings</span>
                <h3>
                  {isLoadingStats ? "…" : (stats?.upcomingBookings ?? "—")}
                </h3>
                <p>Bookings with future check-in dates</p>
              </article>

              <article className="admin-stat-card">
                <span>Payments to Verify</span>
                <h3>
                  {isLoadingStats ? "…" : (stats?.paymentsToVerify ?? "—")}
                </h3>
                <p>Receipts awaiting review</p>
              </article>

              <article className="admin-stat-card">
                <span>Approved Payments</span>
                <h3>
                  {isLoadingStats
                    ? "…"
                    : formatCurrency(stats?.verifiedPaymentTotal)}
                </h3>
                <p>Total of approved payment records</p>
              </article>
            </div>

            <section className="admin-dashboard-panel">
              <h3>Management shortcuts</h3>

              <p>
                Manage reservations, review payment receipts, or configure
                resort bank details.
              </p>

              <div className="admin-dashboard-quick-links">
                <Link to="/admin/bookings">Manage reservations →</Link>
                <Link to="/admin/payments">Review payment receipts →</Link>
                <Link to="/admin/settings">Configure bank details →</Link>

                <a
                  href={PUBLIC_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit the public website →
                </a>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
