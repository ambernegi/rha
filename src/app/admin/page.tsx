"use client";

import { useEffect, useState } from "react";

type AdminBooking = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  guest_email: string | null;
  guest_name: string | null;
  decision_note: string | null;
  configuration: {
    slug: string;
    label: string;
    price_per_night: number;
  };
};

type ApiError = { error: string };

export default function AdminPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/supa/admin/bookings");
      const data = (await res.json()) as { bookings?: AdminBooking[] } & ApiError;
      if (!res.ok || !data.bookings) {
        throw new Error(data.error || "Failed to load bookings");
      }
      setBookings(data.bookings);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const updateBooking = async (
    id: string,
    action: "confirm" | "reject" | "cancel",
  ) => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch("/api/supa/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = (await res.json()) as ApiError | { booking: AdminBooking };
      if (!res.ok || "error" in data) {
        throw new Error((data as ApiError).error || "Failed to update booking");
      }
      await loadBookings();
    } catch (err: any) {
      setError(err.message || "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusChip = (status: AdminBooking["status"]) => {
    let dotClass = "chip-dot-success";
    if (status === "pending") dotClass = "chip-dot-warning";
    if (status === "cancelled" || status === "rejected") dotClass = "chip-dot-error";

    return (
      <span className="chip">
        <span className={`chip-dot ${dotClass}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Owner dashboard</div>
            <div className="card-subtitle">
              All bookings across the villa and individual rooms.
            </div>
          </div>
          <span className="badge badge-warning">Admin</span>
        </div>

        {loading && <p className="muted">Loading bookings…</p>}
        {error && (
          <p className="muted" style={{ color: "var(--error)" }}>
            {error}
          </p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="muted">No bookings yet.</p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Stay option</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div>{b.guest_name || "Unknown"}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      {b.guest_email}
                    </div>
                  </td>
                  <td>{b.configuration.label}</td>
                  <td>
                    {new Date(b.start_date).toLocaleDateString()} →{" "}
                    {new Date(b.end_date).toLocaleDateString()}
                  </td>
                  <td>₹{Number(b.total_price).toFixed(0)}</td>
                  <td>{statusChip(b.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}
                        disabled={updatingId === b.id}
                        onClick={() => updateBooking(b.id, "confirm")}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}
                        disabled={updatingId === b.id}
                        onClick={() => updateBooking(b.id, "reject")}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          padding: "0.3rem 0.7rem",
                          fontSize: "0.8rem",
                          borderColor: "var(--error)",
                          color: "var(--error)",
                        }}
                        disabled={updatingId === b.id}
                        onClick={() => updateBooking(b.id, "cancel")}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}




