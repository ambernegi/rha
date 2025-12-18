"use client";

import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";

type Configuration = {
  id: string;
  slug: string;
  label: string;
  price_per_night: number;
};

type BookingLock = {
  id: string;
  resource_id: string;
  start_date: string;
  end_date: string;
  booking_id: string;
};

type ApiError = { error: string };

export default function BookPage() {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [locks, setLocks] = useState<BookingLock[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfigurations = async () => {
      setLoadingConfigs(true);
      try {
        const res = await fetch("/api/supa/configurations");
        const data = (await res.json()) as
          | { configurations: Configuration[] }
          | ApiError;
        if (!res.ok || "error" in data) {
          throw new Error((data as ApiError).error || "Failed to load configurations");
        }
        const configurations = (data as { configurations: Configuration[] }).configurations;
        setConfigs(configurations);

        // Optional deep-link preselect: /book?configurationSlug=entire_villa
        const preferred =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("configurationSlug")
            : null;
        const preferredExists = preferred
          ? configurations.some((c) => c.slug === preferred)
          : false;

        if (configurations.length > 0) {
          setSelectedSlug(preferredExists ? (preferred as string) : configurations[0].slug);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load configurations");
      } finally {
        setLoadingConfigs(false);
      }
    };

    void loadConfigurations();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedSlug) return;
      setLoadingAvailability(true);
      try {
        const query = new URLSearchParams({ configurationSlug: selectedSlug });
        const res = await fetch(`/api/supa/availability?${query.toString()}`);
        const data = (await res.json()) as { locks?: BookingLock[] } | ApiError;
        if (!res.ok || "error" in data) {
          throw new Error((data as ApiError).error || "Failed to load availability");
        }
        setLocks((data as { locks?: BookingLock[] }).locks ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to load availability");
      } finally {
        setLoadingAvailability(false);
      }
    };

    void loadAvailability();
  }, [selectedSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedSlug || !startDate || !endDate) {
      setError("Please select a stay option and dates.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/supa/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configurationSlug: selectedSlug,
          startDate,
          endDate,
        }),
      });
      const data = (await res.json()) as ApiError | { booking: unknown };

      if (!res.ok || "error" in data) {
        throw new Error((data as ApiError).error || "Failed to create booking");
      }

      setMessage("Booking request submitted! Awaiting host confirmation.");
      // Refresh availability (locks won't change until confirmed, but keeps UI consistent)
      const query = new URLSearchParams({ configurationSlug: selectedSlug });
      const availRes = await fetch(`/api/supa/availability?${query.toString()}`);
      if (availRes.ok) {
        const availData = (await availRes.json()) as { locks?: BookingLock[] };
        setLocks(availData.locks ?? []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedConfig = configs.find((c) => c.slug === selectedSlug);

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

        {loadingConfigs ? (
          <p className="muted">Loading stay options…</p>
        ) : configs.length === 0 ? (
          <p className="muted">
            No configurations configured yet. Seed Supabase configurations to enable booking.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-grid">
              <div className="field">
                <label>Stay option</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                >
                  {configs.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.label} – ₹{Number(c.price_per_night).toFixed(0)}/night
                    </option>
                  ))}
                </select>
                {selectedConfig?.slug && <span className="muted">{selectedConfig.slug}</span>}
              </div>
            </div>

            <BookingCalendar
              configurationSlug={selectedSlug}
              mode="range"
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              onChangeRange={(range) => {
                setStartDate(range.startDate);
                setEndDate(range.endDate);
              }}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !selectedSlug}
            >
              {submitting ? "Submitting…" : "Request booking"}
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
              Confirmed stays that block this option (lock-based).
            </div>
          </div>
          <span className="badge">Read only</span>
        </div>
        {loadingAvailability && <p className="muted">Loading availability…</p>}
        <BookingCalendar configurationSlug={selectedSlug} mode="readonly" />
      </div>
    </div>
  );
}




