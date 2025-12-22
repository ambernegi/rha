"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  clampToUtcStartOfDay,
  endOfMonth,
  formatIsoDateOnly,
  getWeekdayIndexMon0,
  isBefore,
  isSameDay,
  parseIsoDateOnly,
  startOfMonth,
  startOfNextMonth,
} from "@/lib/dateOnly";

type BookingLock = {
  id: string;
  resource_id: string;
  start_date: string;
  end_date: string;
  booking_id: string;
};

type Props = {
  configurationSlug: string;
  mode: "readonly" | "range";
  startDate?: string;
  endDate?: string;
  onChangeRange?: (range: { startDate: string; endDate: string }) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function isBlockedDay(dayIso: string, locks: BookingLock[]) {
  // A day is blocked if it falls within any lock's half-open range [start_date, end_date).
  for (const l of locks) {
    if (l.start_date <= dayIso && dayIso < l.end_date) return true;
  }
  return false;
}

function rangeHasBlockedDays(startIso: string, endIso: string, locks: BookingLock[]) {
  // Check days in [start, end) (end is checkout).
  let d = parseIsoDateOnly(startIso);
  const end = parseIsoDateOnly(endIso);
  while (isBefore(d, end)) {
    const iso = formatIsoDateOnly(d);
    if (isBlockedDay(iso, locks)) return true;
    d = addDays(d, 1);
  }
  return false;
}

export function BookingCalendar(props: Props) {
  const { configurationSlug, mode, startDate, endDate, onChangeRange } = props;
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [locks, setLocks] = useState<BookingLock[]>([]);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // selection state for range picking (we keep this independent so we can drive via clicks)
  const [draftStart, setDraftStart] = useState<string | null>(startDate ?? null);
  const [draftEnd, setDraftEnd] = useState<string | null>(endDate ?? null);

  useEffect(() => {
    setDraftStart(startDate ?? null);
    setDraftEnd(endDate ?? null);
  }, [startDate, endDate]);

  useEffect(() => {
    if (!configurationSlug) return;
    const fetchLocks = async () => {
      setLoading(true);
      setLocalError(null);
      try {
        const from = formatIsoDateOnly(startOfMonth(month));
        const to = formatIsoDateOnly(startOfNextMonth(month));
        const query = new URLSearchParams({ configurationSlug, from, to });
        const res = await fetch(`/api/supa/availability?${query.toString()}`);
        const data = (await res.json()) as { locks?: BookingLock[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load availability");
        setLocks(data.locks ?? []);
      } catch (e: any) {
        setLocalError(e?.message ?? "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };
    void fetchLocks();
  }, [configurationSlug, month]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const leadingEmpty = getWeekdayIndexMon0(start); // 0..6

    const days: Array<{ iso: string; date: Date } | null> = [];
    for (let i = 0; i < leadingEmpty; i++) days.push(null);

    let d = start;
    while (d.getTime() <= end.getTime()) {
      days.push({ iso: formatIsoDateOnly(d), date: d });
      d = addDays(d, 1);
    }

    // pad to full weeks
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [month]);

  const title = useMemo(() => {
    const d = month;
    return d.toLocaleString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
  }, [month]);

  const selection = useMemo(() => {
    const s = draftStart;
    const e = draftEnd;
    return { s, e };
  }, [draftStart, draftEnd]);

  const onPickDay = (iso: string) => {
    if (mode !== "range") return;
    if (!onChangeRange) return;

    // Disallow selecting a blocked check-in day.
    if (isBlockedDay(iso, locks)) return;

    // If no start yet or we already have a full range, start over.
    if (!selection.s || (selection.s && selection.e)) {
      setDraftStart(iso);
      setDraftEnd(null);
      return;
    }

    // Selecting checkout (must be after checkin).
    if (iso <= selection.s) {
      setDraftStart(iso);
      setDraftEnd(null);
      return;
    }

    // Validate range doesn’t include blocked days.
    if (rangeHasBlockedDays(selection.s, iso, locks)) {
      setLocalError("Selected range includes booked dates.");
      setDraftEnd(null);
      return;
    }

    setLocalError(null);
    setDraftEnd(iso);
    onChangeRange({ startDate: selection.s, endDate: iso });
  };

  const isInSelectedRange = (iso: string) => {
    if (!selection.s || !selection.e) return false;
    return selection.s <= iso && iso < selection.e;
  };

  const isSelectedStart = (iso: string) => selection.s === iso;
  const isSelectedEnd = (iso: string) => selection.e === iso;

  // Today marker (UTC day)
  const todayIso = useMemo(() => formatIsoDateOnly(clampToUtcStartOfDay(new Date())), []);

  // Mobile gesture: swipe left/right to change month.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    // Ignore mostly vertical gestures (scroll).
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) setMonth((m) => startOfMonth(addMonths(m, 1)));
    else setMonth((m) => startOfMonth(addMonths(m, -1)));
  };

  return (
    <div className="calendar" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="calendar-header">
        <button
          type="button"
          className="btn-secondary calendar-nav"
          onClick={() => setMonth((m) => startOfMonth(addMonths(m, -1)))}
          aria-label="Previous month"
        >
          Prev
        </button>
        <div className="calendar-title">{title}</div>
        <button
          type="button"
          className="btn-secondary calendar-nav"
          onClick={() => setMonth((m) => startOfMonth(addMonths(m, 1)))}
          aria-label="Next month"
        >
          Next
        </button>
      </div>

      {loading && <div className="muted">Loading availability…</div>}
      {localError && <div className="muted" style={{ color: "var(--error)" }}>{localError}</div>}

      <div className="calendar-legend">
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-legend-swatch--booked" /> Booked
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-legend-swatch--selected" /> Selected
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-legend-swatch--today" /> Today
        </span>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {monthDays.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="calendar-cell calendar-cell--empty" />;
          }

          const iso = cell.iso;
          const blocked = isBlockedDay(iso, locks);
          const selected =
            isSelectedStart(iso) || isSelectedEnd(iso) || isInSelectedRange(iso);
          const inRange = isInSelectedRange(iso);
          const isToday = iso === todayIso;

          const className = [
            "calendar-cell",
            blocked ? "calendar-cell--booked" : "",
            selected ? "calendar-cell--selected" : "",
            inRange ? "calendar-cell--inrange" : "",
            isToday ? "calendar-cell--today" : "",
            mode === "readonly" ? "calendar-cell--readonly" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={iso}
              type="button"
              className={className}
              onClick={() => onPickDay(iso)}
              disabled={mode === "readonly"}
              title={blocked ? "Booked" : "Available"}
            >
              {cell.date.getUTCDate()}
            </button>
          );
        })}
      </div>

      {mode === "range" && (
        <div className="muted" style={{ marginTop: "0.75rem" }}>
          {selection.s && selection.e
            ? `Selected: ${selection.s} → ${selection.e}`
            : selection.s
              ? `Select checkout date after ${selection.s}`
              : "Select your check-in date"}
        </div>
      )}
    </div>
  );
}


