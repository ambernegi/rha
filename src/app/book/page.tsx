"use client";

import { useEffect, useState } from "react";

type Resource = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  parentId: string | null;
};

type BookingAvailability = {
  id: string;
  resourceId: string;
  startDate: string;
  endDate: string;
};

type ApiError = { error: string };

export default function BookPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [availability, setAvailability] = useState<BookingAvailability[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      setLoadingResources(true);
      try {
        const res = await fetch("/api/resources");
        const data = (await res.json()) as { resources?: Resource[] } & ApiError;
        if (!res.ok || !data.resources) {
          throw new Error(data.error || "Failed to load resources");
        }
        setResources(data.resources);
        if (data.resources.length > 0) {
          setSelectedResourceId(data.resources[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load resources");
      } finally {
        setLoadingResources(false);
      }
    };

    void loadResources();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedResourceId) return;
      setLoadingAvailability(true);
      try {
        const res = await fetch(
          `/api/bookings/availability?resourceId=${selectedResourceId}`,
        );
        const data = (await res.json()) as
          | { bookings: BookingAvailability[] }
          | ApiError;
        if (!res.ok || "error" in data) {
          throw new Error(
            (data as ApiError).error || "Failed to load availability",
          );
        }
        setAvailability(data.bookings);
      } catch (err: any) {
        setError(err.message || "Failed to load availability");
      } finally {
        setLoadingAvailability(false);
      }
    };

    void loadAvailability();
  }, [selectedResourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedResourceId || !startDate || !endDate) {
      setError("Please select a resource and dates.");
      return;
    }

    const startIso = new Date(startDate).toISOString();
    const endIso = new Date(endDate).toISOString();

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: selectedResourceId,
          startDate: startIso,
          endDate: endIso,
        }),
      });
      const data = (await res.json()) as ApiError | { booking: unknown };

      if (!res.ok || "error" in data) {
        throw new Error((data as ApiError).error || "Failed to create booking");
      }

      setMessage("Booking confirmed! You can see it in your dashboard.");
      // Refresh availability after successful booking
      const availRes = await fetch(
        `/api/bookings/availability?resourceId=${selectedResourceId}`,
      );
      if (availRes.ok) {
        const availData = (await availRes.json()) as {
          bookings: BookingAvailability[];
        };
        setAvailability(availData.bookings);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Book your stay</div>
            <div className="card-subtitle">
              Choose a resource and dates to request a booking.
            </div>
          </div>
          <span className="badge badge-success">Live</span>
        </div>

        {loadingResources ? (
          <p className="muted">Loading resources…</p>
        ) : resources.length === 0 ? (
          <p className="muted">
            No resources configured yet. Add villa and rooms via Prisma Studio.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-grid">
              <div className="field">
                <label>Resource</label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} – ${r.price.toFixed(0)}/night
                    </option>
                  ))}
                </select>
                {selectedResource?.description && (
                  <span className="muted">{selectedResource.description}</span>
                )}
              </div>

              <div className="field">
                <label>Check-in</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Check-out</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !selectedResourceId}
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>

            {message && <p className="muted">{message}</p>}
            {error && <p className="muted" style={{ color: "var(--error)" }}>{error}</p>}
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Availability</div>
            <div className="card-subtitle">
              Existing bookings that block this resource (parent/children aware).
            </div>
          </div>
          <span className="badge">Read only</span>
        </div>
        {loadingAvailability ? (
          <p className="muted">Loading availability…</p>
        ) : availability.length === 0 ? (
          <p className="muted">No conflicting bookings yet for this resource.</p>
        ) : (
          <ul className="stack">
            {availability.map((b) => (
              <li key={b.id} className="muted">
                {new Date(b.startDate).toLocaleDateString()} →{" "}
                {new Date(b.endDate).toLocaleDateString()} (resource {b.resourceId})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}




