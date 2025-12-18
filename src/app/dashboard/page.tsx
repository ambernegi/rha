"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  configuration: {
    slug: string;
    label: string;
    price_per_night: number;
  };
};

type ApiError = { error: string };

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/supa/bookings");
        const data = (await res.json()) as { bookings?: Booking[] } & ApiError;
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

    void loadBookings();
  }, []);

  const statusChip = (status: Booking["status"]) => {
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
            <div className="card-title">My bookings</div>
            <div className="card-subtitle">
              All stays you have booked through this account.
            </div>
          </div>
          <span className="badge">Guest</span>
        </div>

        {loading && <p className="muted">Loading bookings…</p>}
        {error && (
          <p className="muted" style={{ color: "var(--error)" }}>
            {error}
          </p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="muted">
            You do not have any bookings yet. Visit the Book page to make one.
          </p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Stay option</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.configuration.label}</td>
                  <td>
                    {new Date(b.start_date).toLocaleDateString()} →{" "}
                    {new Date(b.end_date).toLocaleDateString()}
                  </td>
                  <td>₹{Number(b.total_price).toFixed(0)}</td>
                  <td>{statusChip(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}




