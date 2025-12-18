export function isIsoDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseIsoDateOnly(value: string) {
  // Treat date-only as UTC midnight to avoid timezone drift.
  if (!isIsoDateOnly(value)) throw new Error("Invalid YYYY-MM-DD");
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatIsoDateOnly(date: Date) {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function startOfNextMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export function endOfMonth(date: Date) {
  // last day of month at UTC midnight (start of day)
  return addDays(startOfNextMonth(date), -1);
}

export function getWeekdayIndexMon0(date: Date) {
  // JS: Sun=0..Sat=6; convert to Mon=0..Sun=6
  const js = date.getUTCDay();
  return (js + 6) % 7;
}

export function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime();
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function clampToUtcStartOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}


