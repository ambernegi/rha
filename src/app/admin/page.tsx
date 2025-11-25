"use client";

import { useEffect, useState } from "react";

type AdminBooking = {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  resource: {
    id: string;
    name: string;
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
      const res = await fetch("/api/admin/bookings");
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

  const updateStatus = async (id: string, status: AdminBooking["status"]) => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
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
    if (status === "PENDING") dotClass = "chip-dot-warning";
    if (status === "CANCELLED") dotClass = "chip-dot-error";

    return (
      <span className="chip">
        <span className={`chip-dot ${dotClass}`} />
        {status.toLowerCase()}
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
                <th>Resource</th>
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
                    <div>{b.user.name || "Unknown"}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>
                      {b.user.email}
                    </div>
                  </td>
                  <td>{b.resource.name}</td>
                  <td>
                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td>${b.totalPrice.toFixed(0)}</td>
                  <td>{statusChip(b.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, "CONFIRMED")}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}
                        disabled={updatingId === b.id}
                        onClick={() => updateStatus(b.id, "PENDING")}
                      >
                        Pending
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
                        onClick={() => updateStatus(b.id, "CANCELLED")}
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




