import { useCallback, useEffect, useState } from "react";
import "./AdminAccommodations.css";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api/admin/accommodations`;

const EMPTY_FORM = {
  name: "",
  description: "",
  price_per_night: "",
  max_adults: 2,
  max_children: 0,
  total_units: 1,
  image_url: "",
  is_active: false,
};

function AdminAccommodations() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const getToken = () => sessionStorage.getItem("clubNaluAdminToken");

  const fetchAccommodations = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Your admin session has expired. Please sign in again.",
        );
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load accommodations.");
      }

      setAccommodations(result.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load accommodations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAccommodations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchAccommodations]);

  const refresh = () => {
    setLoading(true);
    setError("");
    fetchAccommodations();
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      description: item.description || "",
      price_per_night: item.price_per_night ?? "",
      max_adults: item.max_adults ?? 2,
      max_children: item.max_children ?? 0,
      total_units: item.total_units ?? 1,
      image_url: item.image_url || "",
      is_active: item.is_active === true || Number(item.is_active) === 1,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Accommodation name is required.");
      return;
    }

    if (
      form.price_per_night === "" ||
      !Number.isFinite(Number(form.price_per_night)) ||
      Number(form.price_per_night) < 0
    ) {
      setError("Enter a valid nightly price.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      price_per_night: Number(form.price_per_night),
      max_adults: Number(form.max_adults),
      max_children: Number(form.max_children),
      total_units: Number(form.total_units),
      image_url: form.image_url.trim() || null,
    };

    if (
      !Number.isInteger(payload.max_adults) ||
      payload.max_adults < 1 ||
      !Number.isInteger(payload.max_children) ||
      payload.max_children < 0 ||
      !Number.isInteger(payload.total_units) ||
      payload.total_units < 1
    ) {
      setError("Enter valid occupancy and unit counts.");
      return;
    }

    setSaving(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Your admin session has expired. Please sign in again.",
        );
      }

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save accommodation.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      setSuccess(
        isEditing
          ? "Accommodation updated successfully."
          : "Accommodation created successfully.",
      );

      await fetchAccommodations();
    } catch (err) {
      setError(err.message || "Unable to save accommodation.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    const currentlyActive =
      item.is_active === true || Number(item.is_active) === 1;

    const nextStatus = !currentlyActive;

    const confirmed = window.confirm(
      `${nextStatus ? "Activate" : "Deactivate"} ${item.name}?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Your admin session has expired. Please sign in again.",
        );
      }

      const response = await fetch(`${API_URL}/${item.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: nextStatus,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to change status.");
      }

      setSuccess(
        `Accommodation ${
          nextStatus ? "activated" : "deactivated"
        } successfully.`,
      );

      await fetchAccommodations();
    } catch (err) {
      setError(err.message || "Unable to change status.");
    }
  };

  const isActive = (item) =>
    item.is_active === true || Number(item.is_active) === 1;

  const filtered = accommodations.filter((item) => {
    const text =
      `${item.name} ${item.description || ""} ${item.id}`.toLowerCase();

    const matchesSearch = text.includes(search.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive(item)) ||
      (statusFilter === "inactive" && !isActive(item));

    return matchesSearch && matchesStatus;
  });

  const money = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const activeCount = accommodations.filter(isActive).length;

  const inactiveCount = accommodations.length - activeCount;

  const totalUnits = accommodations.reduce(
    (total, item) => total + Number(item.total_units || 0),
    0,
  );

  return (
    <main className="admin-accommodations">
      <header className="accommodations-heading">
        <div>
          <span className="accommodations-eyebrow">PROPERTY MANAGEMENT</span>

          <h1>Accommodation Management</h1>

          <p>Manage resort rooms, villas, prices, and availability.</p>
        </div>

        <button
          type="button"
          className="accommodation-primary-btn"
          onClick={openAdd}
        >
          ＋ Add Accommodation
        </button>
      </header>

      {error && !modalOpen && (
        <div
          className="accommodation-alert accommodation-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="accommodation-alert accommodation-alert-success"
          role="status"
        >
          {success}
        </div>
      )}

      <div className="accommodation-stats">
        <div className="accommodation-stat-card">
          <p>Total Accommodations</p>
          <h2>{accommodations.length}</h2>
        </div>

        <div className="accommodation-stat-card">
          <p>Active Listings</p>
          <h2>{activeCount}</h2>
        </div>

        <div className="accommodation-stat-card">
          <p>Inactive Listings</p>
          <h2>{inactiveCount}</h2>
        </div>

        <div className="accommodation-stat-card">
          <p>Total Units</p>
          <h2>{totalUnits}</h2>
        </div>
      </div>

      <section className="accommodation-list-card">
        <div className="accommodation-list-heading">
          <div>
            <h2>All Accommodations</h2>
            <p>Review and update accommodation listings.</p>
          </div>

          <button
            type="button"
            className="accommodation-refresh-btn"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <div className="accommodation-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search accommodations..."
            aria-label="Search accommodations"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All listings</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <p className="accommodation-empty-state">Loading accommodations...</p>
        ) : (
          <div className="accommodation-table-wrapper">
            <table className="accommodation-table">
              <thead>
                <tr>
                  <th>Accommodation</th>
                  <th>Price / Night</th>
                  <th>Occupancy</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>ID: {item.id}</small>
                    </td>

                    <td>{money(item.price_per_night)}</td>

                    <td>
                      {item.max_adults} adults · {item.max_children} children
                    </td>

                    <td>{item.total_units}</td>

                    <td>{isActive(item) ? "Active" : "Inactive"}</td>

                    <td>
                      <button
                        type="button"
                        className="accommodation-edit-btn"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        className="accommodation-toggle-btn"
                        onClick={() => toggleStatus(item)}
                      >
                        {isActive(item) ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="accommodation-empty-state">
                No accommodations match your search.
              </p>
            )}
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="accommodation-modal-overlay">
          <section
            className="accommodation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accommodation-modal-title"
          >
            <header className="accommodation-modal-header">
              <h2 id="accommodation-modal-title">
                {editingId ? "Edit Accommodation" : "Add Accommodation"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            {error && (
              <p
                className="accommodation-alert accommodation-alert-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <form className="accommodation-form" onSubmit={save}>
              <label>
                Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />
              </label>

              <label>
                Price per night (PHP) *
                <input
                  type="number"
                  name="price_per_night"
                  value={form.price_per_night}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Maximum adults
                <input
                  type="number"
                  name="max_adults"
                  value={form.max_adults}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </label>

              <label>
                Maximum children
                <input
                  type="number"
                  name="max_children"
                  value={form.max_children}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </label>

              <label>
                Total units
                <input
                  type="number"
                  name="total_units"
                  value={form.total_units}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </label>

              <label>
                Image URL
                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              <label className="accommodation-active-checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                Active listing
              </label>

              <div className="accommodation-form-actions">
                <button type="button" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Accommodation"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminAccommodations;
