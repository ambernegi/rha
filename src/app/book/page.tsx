"use client";

import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { LoginModal } from "@/components/LoginModal";

type Configuration = {
  id: string;
  slug: string;
  label: string;
  price_per_night: number;
};

type ApiError = { error: string };

export default function BookPage() {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Allow returning from login with preserved choices:
    // /book?configurationSlug=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("startDate");
    const e = params.get("endDate");
    if (s) setStartDate(s);
    if (e) setEndDate(e);
  }, []);

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

      if (res.status === 401) {
        // Keep state in-place and prompt login. Also preserve choices in the URL for after OAuth redirect.
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("configurationSlug", selectedSlug);
          url.searchParams.set("startDate", startDate);
          url.searchParams.set("endDate", endDate);
          window.history.replaceState({}, "", url.toString());
        }
        setShowLogin(true);
        return;
      }

      if (!res.ok || "error" in data) {
        throw new Error((data as ApiError).error || "Failed to create booking");
      }

      setMessage("Booking request submitted! Awaiting host confirmation.");
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedConfig = configs.find((c) => c.slug === selectedSlug);
  const nights =
    startDate && endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(`${endDate}T00:00:00.000Z`).getTime() -
              new Date(`${startDate}T00:00:00.000Z`).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;
  const total =
    selectedConfig && nights > 0 ? Number(selectedConfig.price_per_night) * nights : 0;

  return (
    <div className="stack-lg">
      <LoginModal
        open={showLogin}
        nextPath={
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/book"
        }
        onClose={() => setShowLogin(false)}
      />
      <div className="booking-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Request a booking</div>
              <div className="card-subtitle">
                Select a stay option, then pick dates from the calendar.
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
              <div className="field">
                <label>Stay option</label>
                <select
                  value={selectedSlug}
                  onChange={(e) => {
                    setSelectedSlug(e.target.value);
                    // reset dates when switching options to avoid confusion
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  {configs.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.label} – ₹{Number(c.price_per_night).toFixed(0)}/night
                    </option>
                  ))}
                </select>
              </div>

              <div className="card" style={{ padding: "1rem" }}>
                <div className="card-title">Summary</div>
                <div className="muted" style={{ marginTop: "0.35rem" }}>
                  {startDate && endDate ? (
                    <>
                      Dates: {startDate} → {endDate}
                      <br />
                      Nights: {nights}
                      <br />
                      Total (estimate): ₹{Number(total).toFixed(0)}
                    </>
                  ) : (
                    "Choose your check-in and check-out dates from the calendar."
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !selectedSlug || !startDate || !endDate}
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
              <div className="card-title">Select dates</div>
              <div className="card-subtitle">
                Booked days are crossed out (confirmed only).
              </div>
            </div>
            <span className="badge">Calendar</span>
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
        </div>
      </div>
    </div>
  );
}




