import { useCallback, useEffect, useMemo, useState } from "react";
import "./AdminPayments.css";

const API_URL = "http://localhost:5000/api";

const STATUS_LABELS = {
  awaiting_payment: "Awaiting Payment",
  pending_verification: "Pending Verification",
  approved: "Approved",
  rejected: "Rejected",
  refunded: "Refunded",
};

function formatAmount(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [notice, setNotice] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [decision, setDecision] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Receipt viewing state
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptType, setReceiptType] = useState("");
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  // Load payment records
  const fetchPayments = useCallback(async (isRefresh = false) => {
    const token = sessionStorage.getItem("clubNaluAdminToken");

    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/admin/payments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (response.status === 401) {
        throw new Error(
          "Your admin session has expired. Please sign in again.",
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load payments.");
      }

      setPayments(result.data?.payments || []);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || "Unable to load payment records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPayments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchPayments]);

  // Release temporary receipt URLs when they change or the component unmounts.
  useEffect(() => {
    return () => {
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
      }
    };
  }, [receiptUrl]);

  // Payment summary cards
  const summary = useMemo(() => {
    return {
      total: payments.length,
      pending: payments.filter(
        (payment) => payment.payment_status === "pending_verification",
      ).length,
      approved: payments.filter(
        (payment) => payment.payment_status === "approved",
      ).length,
      rejected: payments.filter(
        (payment) => payment.payment_status === "rejected",
      ).length,
    };
  }, [payments]);

  // Search and filter payments
  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const guestName =
        `${payment.first_name || ""} ${payment.last_name || ""}`.trim();

      const matchesSearch =
        !query ||
        [
          payment.booking_reference,
          guestName,
          payment.email,
          payment.phone,
          payment.accommodation_name,
          payment.payment_method,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "all" || payment.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // Open the approval or rejection dialog
  function openDecisionDialog(payment, selectedDecision) {
    setSelectedPayment(payment);
    setDecision(selectedDecision);
    setRejectionReason("");
    setNotice("");
    setError("");
  }

  // Close the approval or rejection dialog
  function closeDecisionDialog() {
    if (processingId !== null) return;

    setSelectedPayment(null);
    setDecision("");
    setRejectionReason("");
  }

  // Submit an approval or rejection decision
  async function submitDecision(event) {
    event.preventDefault();

    if (!selectedPayment) return;

    if (decision === "rejected" && !rejectionReason.trim()) {
      setError("Please provide a reason for rejecting this payment.");
      return;
    }

    const token = sessionStorage.getItem("clubNaluAdminToken");

    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      return;
    }

    const paymentId = selectedPayment.payment_id;

    setProcessingId(paymentId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/admin/payments/${paymentId}/decision`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            decision,
            ...(decision === "rejected"
              ? { reason: rejectionReason.trim() }
              : {}),
          }),
        },
      );

      const result = await response.json();

      if (response.status === 401) {
        throw new Error(
          "Your admin session has expired. Please sign in again.",
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update this payment.");
      }

      setNotice(result.message || "Payment updated successfully.");
      setSelectedPayment(null);
      setDecision("");
      setRejectionReason("");

      await fetchPayments(true);
    } catch (err) {
      setError(err.message || "Unable to update payment status.");
    } finally {
      setProcessingId(null);
    }
  }

  // Securely fetch a receipt using the administrator's Bearer Token
  async function openReceipt(payment) {
    const token = sessionStorage.getItem("clubNaluAdminToken");

    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      return;
    }

    // Close any previously opened receipt.
    setReceiptUrl("");
    setReceiptType("");
    setReceiptError("");
    setReceiptLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/payments/${payment.payment_id}/receipt`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "image/*, application/pdf",
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const result = await response.json();

          throw new Error(
            result.message || "Unable to open the payment receipt.",
          );
        }

        throw new Error("Unable to open the payment receipt.");
      }

      const blob = await response.blob();

      if (blob.type !== "application/pdf" && !blob.type.startsWith("image/")) {
        throw new Error("The server returned an unsupported receipt format.");
      }

      const temporaryUrl = URL.createObjectURL(blob);

      setReceiptType(blob.type);
      setReceiptUrl(temporaryUrl);
    } catch (err) {
      setReceiptError(err.message || "Unable to open the payment receipt.");
    } finally {
      setReceiptLoading(false);
    }
  }

  // Close the receipt viewer
  function closeReceipt() {
    setReceiptUrl("");
    setReceiptType("");
    setReceiptError("");
    setReceiptLoading(false);
  }

  return (
    <main className="admin-payments">
      {/* Page header */}
      <header className="admin-payments-header">
        <div>
          <span className="admin-payments-eyebrow">
            FINANCE &amp; OPERATIONS
          </span>

          <h1>Payment Verification</h1>

          <p>
            Review guest payments and verify receipts before confirming
            reservations.
          </p>
        </div>

        <button
          type="button"
          className="admin-payments-refresh"
          onClick={() => fetchPayments(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh payments"}
        </button>
      </header>

      {/* Success notification */}
      {notice && (
        <div className="admin-payments-alert success" role="status">
          {notice}

          <button type="button" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="admin-payments-alert error" role="alert">
          {error}

          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {/* Summary cards */}
      <section className="admin-payments-summary" aria-label="Payment summary">
        <article className="admin-payment-stat">
          <span className="admin-payment-stat-label">Total Payments</span>

          <strong>{summary.total}</strong>

          <small>Payment records loaded</small>
        </article>

        <article className="admin-payment-stat pending">
          <span className="admin-payment-stat-label">Pending Review</span>

          <strong>{summary.pending}</strong>

          <small>Awaiting verification</small>
        </article>

        <article className="admin-payment-stat approved">
          <span className="admin-payment-stat-label">Approved</span>

          <strong>{summary.approved}</strong>

          <small>Approved payment records</small>
        </article>

        <article className="admin-payment-stat rejected">
          <span className="admin-payment-stat-label">Rejected</span>

          <strong>{summary.rejected}</strong>

          <small>Rejected payment records</small>
        </article>
      </section>

      {/* Payments table */}
      <section className="admin-payments-panel">
        <div className="admin-payments-panel-header">
          <div>
            <h2>Payment Records</h2>

            <p>Search, inspect and review guest payment submissions.</p>
          </div>

          <span className="admin-payments-record-count">
            {filteredPayments.length} records
          </span>
        </div>

        {/* Search and filters */}
        <div className="admin-payments-toolbar">
          <label className="admin-payments-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search booking, guest or accommodation..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter payments by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending_verification">Pending verification</option>
            <option value="awaiting_payment">Awaiting payment</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="admin-payments-state">
            <div className="admin-payments-spinner" />

            <p>Loading payment records...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          /* Empty state */
          <div className="admin-payments-state">
            <span className="admin-payments-empty-icon">₱</span>

            <h3>No payment records found</h3>

            <p>
              {search || statusFilter !== "all"
                ? "Try changing your search or status filter."
                : "Payment records will appear here when available."}
            </p>
          </div>
        ) : (
          /* Payment records */
          <div className="admin-payments-table-wrapper">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Booking / Guest</th>
                  <th>Accommodation</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => {
                  const guestName =
                    `${payment.first_name || ""} ${
                      payment.last_name || ""
                    }`.trim() || "Guest name unavailable";

                  const isPending =
                    payment.payment_status === "pending_verification";

                  return (
                    <tr key={payment.payment_id}>
                      <td>
                        <div className="admin-payment-booking">
                          <strong>
                            {payment.booking_reference || "No reference"}
                          </strong>

                          <span>{guestName}</span>

                          <small>{payment.email || "No email provided"}</small>
                        </div>
                      </td>

                      <td>
                        <span className="admin-payment-accommodation">
                          {payment.accommodation_name || "Not specified"}
                        </span>

                        <small className="admin-payment-dates">
                          {formatDate(payment.check_in)} –{" "}
                          {formatDate(payment.check_out)}
                        </small>
                      </td>

                      <td>
                        <strong className="admin-payment-amount">
                          {formatAmount(payment.amount)}
                        </strong>
                      </td>

                      <td>
                        <span className="admin-payment-method">
                          {String(payment.payment_method || "Not specified")
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </span>
                      </td>

                      <td>{formatDate(payment.created_at)}</td>

                      <td>
                        <span
                          className={`admin-payment-status ${payment.payment_status}`}
                        >
                          {STATUS_LABELS[payment.payment_status] ||
                            payment.payment_status ||
                            "Unknown"}
                        </span>
                      </td>

                      {/* Receipt viewing */}
                      <td>
                        {payment.payment_slip_path ? (
                          <button
                            type="button"
                            className="admin-payment-view-receipt"
                            onClick={() => openReceipt(payment)}
                          >
                            View Receipt
                          </button>
                        ) : (
                          <span className="admin-payment-no-receipt">
                            No receipt
                          </span>
                        )}
                      </td>

                      {/* Approval and rejection */}
                      <td>
                        {isPending ? (
                          <div className="admin-payment-actions">
                            <button
                              type="button"
                              className="admin-payment-review-button"
                              onClick={() =>
                                openDecisionDialog(payment, "approved")
                              }
                              disabled={processingId !== null}
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="admin-payment-reject-button"
                              onClick={() =>
                                openDecisionDialog(payment, "rejected")
                              }
                              disabled={processingId !== null}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="admin-payment-reviewed">
                            {payment.payment_status === "approved"
                              ? "Reviewed"
                              : payment.payment_status === "rejected"
                                ? "Rejected"
                                : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Last refreshed time */}
        {lastRefreshed && (
          <div className="admin-payments-last-refreshed">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </div>
        )}
      </section>

      {/* Approval and rejection modal */}
      {selectedPayment && (
        <div
          className="admin-payment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDecisionDialog();
            }
          }}
        >
          <section
            className="admin-payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-payment-modal-title"
          >
            <button
              type="button"
              className="admin-payment-modal-close"
              aria-label="Close dialog"
              onClick={closeDecisionDialog}
              disabled={processingId !== null}
            >
              ×
            </button>

            <span className="admin-payments-eyebrow">PAYMENT REVIEW</span>

            <h2 id="admin-payment-modal-title">
              {decision === "approved" ? "Approve Payment" : "Reject Payment"}
            </h2>

            <p className="admin-payment-modal-description">
              Booking reference:{" "}
              <strong>
                {selectedPayment.booking_reference || "Not available"}
              </strong>
            </p>

            <div className="admin-payment-modal-details">
              <div>
                <span>Guest</span>

                <strong>
                  {`${selectedPayment.first_name || ""} ${
                    selectedPayment.last_name || ""
                  }`.trim() || "Guest name unavailable"}
                </strong>
              </div>

              <div>
                <span>Amount</span>

                <strong>{formatAmount(selectedPayment.amount)}</strong>
              </div>
            </div>

            {decision === "approved" ? (
              <div className="admin-payment-confirmation">
                <strong>Before approving</strong>

                <p>
                  Confirm that the funds have actually reached the resort's bank
                  account. An uploaded receipt alone is not proof of payment.
                </p>

                {!selectedPayment.payment_slip_path && (
                  <p className="admin-payment-inline-warning">
                    No receipt is attached. The backend will prevent approval.
                  </p>
                )}
              </div>
            ) : (
              <label className="admin-payment-reason-field">
                Reason for rejection
                <textarea
                  rows="4"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Explain why this payment is being rejected..."
                  required
                />
              </label>
            )}

            <div className="admin-payment-modal-actions">
              <button
                type="button"
                className="admin-payment-cancel-button"
                onClick={closeDecisionDialog}
                disabled={processingId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  decision === "approved"
                    ? "admin-payment-confirm-approve"
                    : "admin-payment-confirm-reject"
                }
                onClick={submitDecision}
                disabled={
                  processingId !== null ||
                  (decision === "rejected" && !rejectionReason.trim())
                }
              >
                {processingId === selectedPayment.payment_id
                  ? "Processing..."
                  : decision === "approved"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Secure receipt viewer modal */}
      {(receiptUrl || receiptLoading || receiptError) && (
        <div
          className="admin-payment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReceipt();
            }
          }}
        >
          <section
            className="admin-payment-modal admin-payment-receipt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-modal-title"
          >
            <button
              type="button"
              className="admin-payment-modal-close"
              aria-label="Close receipt"
              onClick={closeReceipt}
            >
              ×
            </button>

            <span className="admin-payments-eyebrow">
              SECURE PAYMENT DOCUMENT
            </span>

            <h2 id="receipt-modal-title">Payment Receipt</h2>

            {receiptLoading && (
              <div className="admin-payments-state">
                <div className="admin-payments-spinner" />
                <p>Loading receipt...</p>
              </div>
            )}

            {receiptError && (
              <div className="admin-payments-alert error" role="alert">
                {receiptError}

                <button type="button" onClick={() => setReceiptError("")}>
                  Dismiss
                </button>
              </div>
            )}

            {receiptUrl && receiptType === "application/pdf" && (
              <iframe
                src={receiptUrl}
                title="Payment receipt PDF"
                className="admin-payment-receipt-frame"
              />
            )}

            {receiptUrl && receiptType.startsWith("image/") && (
              <img
                src={receiptUrl}
                alt="Uploaded payment receipt"
                className="admin-payment-receipt-image"
              />
            )}

            {receiptUrl && (
              <a
                href={receiptUrl}
                download="club-nalu-payment-receipt"
                className="admin-payment-download-receipt"
              >
                Download Receipt
              </a>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminPayments;
