import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to sign in.");
      }

      if (!result.data?.token || !result.data?.admin) {
        throw new Error("The server returned an incomplete login response.");
      }

      // Store the token only after a successful login.
      sessionStorage.setItem("clubNaluAdminToken", result.data.token);
      sessionStorage.setItem(
        "clubNaluAdmin",
        JSON.stringify(result.data.admin),
      );

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      {" "}
      <section className="admin-login-card">
        {" "}
        <Link to="/" className="admin-login-brand" aria-label="Club Nalu home">
          {" "}
          <span className="admin-login-logo">
            CLUB <br />
            〰 <br />
            NALU{" "}
          </span>{" "}
          <span className="admin-login-brand-caption">
            RESORT MANAGEMENT{" "}
          </span>{" "}
        </Link>
        ```
        <div className="admin-login-heading">
          <span className="admin-login-eyebrow">ADMINISTRATION</span>
          <h1>Welcome back</h1>
          <p>Sign in to manage your resort operations.</p>
        </div>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Password</span>

            <div className="admin-password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="admin-login-security">
          Authorised personnel only. Your account activity is protected.
        </p>
        <Link to="/" className="admin-login-back">
          ← Return to Club Nalu
        </Link>
      </section>
    </main>
  );
}

export default AdminLogin;
