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
        throw new Error(result.message || "Unable to load bank settings.");
      }

      setSettings({
        ...emptySettings,
        ...result.data,
        bank_name: result.data?.bank_name || "",
        account_name: result.data?.account_name || "",
        account_number: result.data?.account_number || "",
        branch_name: result.data?.branch_name || "",
        payment_instructions: result.data?.payment_instructions || "",
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load bank settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSettings();
    }, 0);

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
        body: JSON.stringify(settings),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        sessionStorage.removeItem("clubNaluAdminToken");
        sessionStorage.removeItem("clubNaluAdmin");
        window.location.assign("/admin/login");
        return;
      }

      if (response.status === 403) {
        throw new Error("You do not have permission to update bank settings.");
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save bank settings.");
      }

      setSettings({
        ...emptySettings,
        ...result.data,
        bank_name: result.data?.bank_name || "",
        account_name: result.data?.account_name || "",
        account_number: result.data?.account_number || "",
        branch_name: result.data?.branch_name || "",
        payment_instructions: result.data?.payment_instructions || "",
      });

      setSuccess("Bank settings saved successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save bank settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-settings-page">
        <p>Loading bank settings...</p>
      </main>
    );
  }

  return (
    <main className="admin-settings-page">
      <header className="admin-settings-header">
        <div>
          <p className="admin-settings-eyebrow">CLUB NALU RESORT</p>
          <h1>Bank Settings</h1>
          <p>
            Manage the bank transfer details displayed to guests when they make
            a reservation.
          </p>
        </div>
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

      <section className="admin-settings-card">
        <div className="admin-settings-card-heading">
          <h2>Bank Transfer Details</h2>
          <p>
            Ensure these details are correct before saving. Guests may use them
            to make payments for their reservations.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
              <label htmlFor="payment_instructions">Payment Instructions</label>
              <textarea
                id="payment_instructions"
                name="payment_instructions"
                rows={5}
                value={settings.payment_instructions}
                onChange={handleChange}
                placeholder="Explain how guests should make their bank transfer and submit payment proof."
              />
            </div>
          </div>

          <div className="admin-settings-form-footer">
            <p>* Required fields</p>

            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving Changes..." : "Save Bank Settings"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AdminSettings;
