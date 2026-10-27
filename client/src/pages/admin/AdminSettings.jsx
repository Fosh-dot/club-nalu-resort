import { useCallback, useEffect, useState } from "react";
import "./AdminSettings.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://club-nalu-api.onrender.com"
).replace(/\/$/, "");

const emptySettings = {
  bank_name: "",
  account_name: "",
  account_number: "",
  branch_name: "",
  payment_instructions: "",
  gcash_number: "",
  gcash_account_name: "",
  gcash_instructions: "",
  gcash_enabled: 0,
};

function AdminSettings() {
  const [settings, setSettings] = useState(emptySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setError("");

      const token = sessionStorage.getItem("clubNaluAdminToken");

      if (!token) {
        setError("Your admin session is missing. Please sign in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/payment-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        sessionStorage.removeItem("clubNaluAdminToken");
        sessionStorage.removeItem("clubNaluAdmin");
        window.location.assign("/admin/login");
        return;
      }

      if (response.status === 404) {
        setSettings(emptySettings);
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load payment settings.");
      }

      const data = result.data || {};

      setSettings({
        ...emptySettings,
        ...data,
        bank_name: data.bank_name || "",
        account_name: data.account_name || "",
        account_number: data.account_number || "",
        branch_name: data.branch_name || "",
        payment_instructions: data.payment_instructions || "",
        gcash_number: data.gcash_number || "",
        gcash_account_name: data.gcash_account_name || "",
        gcash_instructions: data.gcash_instructions || "",
        gcash_enabled: Number(data.gcash_enabled) === 1 ? 1 : 0,
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load payment settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 0);

    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleGcashToggle = (event) => {
    setSettings((current) => ({
      ...current,
      gcash_enabled: event.target.checked ? 1 : 0,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !settings.bank_name.trim() ||
      !settings.account_name.trim() ||
      !settings.account_number.trim()
    ) {
      setError("Bank name, account name, and account number are required.");
      return;
    }

    if (
      Number(settings.gcash_enabled) === 1 &&
      (!settings.gcash_number.trim() || !settings.gcash_account_name.trim())
    ) {
      setError(
        "Enter the GCash number and account name before enabling GCash.",
      );
      return;
    }

    const token = sessionStorage.getItem("clubNaluAdminToken");

    if (!token) {
      setError("Your admin session is missing. Please sign in again.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/payment-settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...settings,
          gcash_enabled: Number(settings.gcash_enabled),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        sessionStorage.removeItem("clubNaluAdminToken");
        sessionStorage.removeItem("clubNaluAdmin");
        window.location.assign("/admin/login");
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to update payment settings.",
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save payment settings.");
      }

      const data = result.data || {};

      setSettings({
        ...emptySettings,
        ...data,
        bank_name: data.bank_name || "",
        account_name: data.account_name || "",
        account_number: data.account_number || "",
        branch_name: data.branch_name || "",
        payment_instructions: data.payment_instructions || "",
        gcash_number: data.gcash_number || "",
        gcash_account_name: data.gcash_account_name || "",
        gcash_instructions: data.gcash_instructions || "",
        gcash_enabled: Number(data.gcash_enabled) === 1 ? 1 : 0,
      });

      setSuccess("Payment settings saved successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save payment settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-settings-page">
        {" "}
        <p>Loading payment settings...</p>{" "}
      </main>
    );
  }

  return (
    <main className="admin-settings-page">
      {" "}
      <header className="admin-settings-header">
        {" "}
        <div>
          {" "}
          <p className="admin-settings-eyebrow">CLUB NALU RESORT</p>{" "}
          <h1>Payment Settings</h1>{" "}
          <p>
            Manage the Bank Transfer and GCash details displayed to guests when
            they make a reservation.{" "}
          </p>{" "}
        </div>{" "}
      </header>
      {error && (
        <div
          className="admin-settings-message admin-settings-error"
          role="alert"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="admin-settings-message admin-settings-success"
          role="status"
        >
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* BANK TRANSFER SETTINGS */}
        <section className="admin-settings-card">
          <div className="admin-settings-card-heading">
            <h2>Bank Transfer Details</h2>
            <p>
              Manage the bank account guests use to pay for their reservations.
            </p>
          </div>

          <div className="admin-settings-card-body">
            <div className="admin-settings-form-grid">
              <div className="admin-settings-field">
                <label htmlFor="bank_name">Bank Name *</label>
                <input
                  id="bank_name"
                  name="bank_name"
                  type="text"
                  maxLength={150}
                  value={settings.bank_name}
                  onChange={handleChange}
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div className="admin-settings-field">
                <label htmlFor="account_name">Account Name *</label>
                <input
                  id="account_name"
                  name="account_name"
                  type="text"
                  maxLength={150}
                  value={settings.account_name}
                  onChange={handleChange}
                  placeholder="Enter account holder name"
                  required
                />
              </div>

              <div className="admin-settings-field">
                <label htmlFor="account_number">Account Number *</label>
                <input
                  id="account_number"
                  name="account_number"
                  type="text"
                  maxLength={100}
                  inputMode="numeric"
                  autoComplete="off"
                  value={settings.account_number}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div className="admin-settings-field">
                <label htmlFor="branch_name">Bank Branch</label>
                <input
                  id="branch_name"
                  name="branch_name"
                  type="text"
                  maxLength={100}
                  value={settings.branch_name}
                  onChange={handleChange}
                  placeholder="Enter branch (optional)"
                />
              </div>

              <div className="admin-settings-field admin-settings-field-full">
                <label htmlFor="payment_instructions">
                  Bank Transfer Instructions
                </label>
                <textarea
                  id="payment_instructions"
                  name="payment_instructions"
                  rows={4}
                  value={settings.payment_instructions}
                  onChange={handleChange}
                  placeholder="Explain how guests should make a bank transfer."
                />
              </div>
            </div>
          </div>
        </section>

        {/* GCASH SETTINGS */}
        <section className="admin-settings-card admin-settings-gcash-card">
          <div className="admin-settings-card-heading">
            <h2>GCash Details</h2>
            <p>
              Configure the GCash account guests can use to pay for
              reservations.
            </p>
          </div>

          <div className="admin-settings-card-body">
            <label className="admin-settings-toggle">
              <span>
                <strong>Enable GCash payments</strong>
                <small>
                  When enabled, guests can select GCash during checkout.
                </small>
              </span>

              <input
                type="checkbox"
                checked={Number(settings.gcash_enabled) === 1}
                onChange={handleGcashToggle}
                aria-label="Enable GCash payments"
              />

              <span
                className="admin-settings-toggle-switch"
                aria-hidden="true"
              />
            </label>

            <div className="admin-settings-form-grid">
              <div className="admin-settings-field">
                <label htmlFor="gcash_number">GCash Number *</label>
                <input
                  id="gcash_number"
                  name="gcash_number"
                  type="tel"
                  inputMode="tel"
                  maxLength={50}
                  autoComplete="off"
                  value={settings.gcash_number}
                  onChange={handleChange}
                  placeholder="Enter registered GCash number"
                  required={Number(settings.gcash_enabled) === 1}
                />
              </div>

              <div className="admin-settings-field">
                <label htmlFor="gcash_account_name">GCash Account Name *</label>
                <input
                  id="gcash_account_name"
                  name="gcash_account_name"
                  type="text"
                  maxLength={150}
                  value={settings.gcash_account_name}
                  onChange={handleChange}
                  placeholder="Enter registered account name"
                  required={Number(settings.gcash_enabled) === 1}
                />
              </div>

              <div className="admin-settings-field admin-settings-field-full">
                <label htmlFor="gcash_instructions">
                  GCash Payment Instructions
                </label>
                <textarea
                  id="gcash_instructions"
                  name="gcash_instructions"
                  rows={4}
                  value={settings.gcash_instructions}
                  onChange={handleChange}
                  placeholder="Explain how guests should pay through GCash and provide their transaction reference."
                />
              </div>
            </div>
          </div>
        </section>

        <div className="admin-settings-form-footer">
          <p>
            * Required for Bank Transfer. GCash details are required when GCash
            is enabled.
          </p>

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving Changes..." : "Save Payment Settings"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AdminSettings;
