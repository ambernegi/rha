"use client";

import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";

type AdminBooking = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  source?: "guest" | "manual";
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

type Configuration = {
  id: string;
  slug: string;
  label: string;
  price_per_night: number;
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [selectedConfigSlug, setSelectedConfigSlug] = useState<string>("entire_villa");
  const [blockStart, setBlockStart] = useState<string>("");
  const [blockEnd, setBlockEnd] = useState<string>("");
  const [blockNote, setBlockNote] = useState<string>("");
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
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
    void (async () => {
      try {
        const res = await fetch("/api/supa/configurations");
        const data = (await res.json()) as { configurations?: Configuration[] } & ApiError;
        if (res.ok && data.configurations) {
          setConfigs(data.configurations);
          if (data.configurations.length > 0) {
            setSelectedConfigSlug(data.configurations[0].slug);
          }
        }
      } catch {
        // ignore; configs are optional for rendering bookings table
      }
    })();
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

  const createManualBlock = async () => {
    setError(null);
    setBlockMessage(null);
    if (!selectedConfigSlug || !blockStart || !blockEnd) {
      setError("Please select a stay option and dates to block.");
      return;
    }
    setUpdatingId("manual-block");
    try {
      const res = await fetch("/api/supa/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configurationSlug: selectedConfigSlug,
          startDate: blockStart,
          endDate: blockEnd,
          note: blockNote || undefined,
        }),
      });
      const data = (await res.json()) as ApiError | { booking: unknown };
      if (!res.ok || "error" in data) {
        throw new Error((data as ApiError).error || "Failed to create manual block");
      }
      setBlockMessage("Blocked dates saved.");
      setBlockStart("");
      setBlockEnd("");
      setBlockNote("");
      await loadBookings();
    } catch (err: any) {
      setError(err.message || "Failed to create manual block");
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
          <span className="badge badge-warning">Owner</span>
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Block dates (manual)</div>
              <div className="card-subtitle">
                Use this when you receive bookings from other channels.
              </div>
            </div>
            <span className="badge">Manual</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Stay option</label>
              <select
                value={selectedConfigSlug}
                onChange={(e) => setSelectedConfigSlug(e.target.value)}
              >
                {configs.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <BookingCalendar
            configurationSlug={selectedConfigSlug}
            mode="range"
            startDate={blockStart || undefined}
            endDate={blockEnd || undefined}
            onChangeRange={(range) => {
              setBlockStart(range.startDate);
              setBlockEnd(range.endDate);
            }}
          />

          <div className="field" style={{ marginTop: "0.75rem" }}>
            <label>Note (optional)</label>
            <input
              type="text"
              value={blockNote}
              onChange={(e) => setBlockNote(e.target.value)}
              placeholder="e.g. Airbnb booking #123"
            />
          </div>

          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn-primary"
              disabled={updatingId === "manual-block"}
              onClick={() => void createManualBlock()}
            >
              Save blocked dates
            </button>
            {blockMessage && <p className="muted">{blockMessage}</p>}
          </div>
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
                    <div>{b.guest_name || (b.source === "manual" ? "Manual block" : "Unknown")}</div>
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
                      {b.source !== "manual" && (
                        <>
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
                        </>
                      )}
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




