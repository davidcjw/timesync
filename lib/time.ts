// Timezone helpers built on Intl only (no external deps).
// DST-aware via a one-step offset refinement, and trivially correct for
// fixed-offset zones like Asia/Singapore.

/** Offset (minutes) of `timeZone` from UTC at a given instant. e.g. SGT => 480. */
export function zoneOffsetMinutes(timeZone: string, instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const m: Record<string, number> = {};
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== "literal") m[p.type] = Number(p.value);
  }
  const hour = m.hour % 24; // some engines emit 24 for midnight
  const asUTC = Date.UTC(m.year, m.month - 1, m.day, hour, m.minute, m.second);
  return (asUTC - instant.getTime()) / 60000;
}

/** Convert a wall-clock time in `timeZone` to the corresponding UTC instant. */
export function zonedWallToUtc(
  y: number,
  mo: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(y, mo - 1, d, hh, mm);
  const o1 = zoneOffsetMinutes(timeZone, new Date(guess));
  let utc = guess - o1 * 60000;
  const o2 = zoneOffsetMinutes(timeZone, new Date(utc));
  if (o2 !== o1) utc = guess - o2 * 60000;
  return new Date(utc);
}

/** Weekday (0=Sun .. 6=Sat) of a calendar date — independent of timezone. */
export function weekdayOf(y: number, mo: number, d: number): number {
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

export function parseDateStr(date: string): { y: number; mo: number; d: number } {
  const [y, mo, d] = date.split("-").map(Number);
  return { y, mo, d };
}

/** The calendar-date parts of an instant as seen in `timeZone`. */
export function zonedDateParts(timeZone: string, instant: Date): { y: number; mo: number; d: number } {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant); // en-CA => "YYYY-MM-DD"
  const [y, mo, d] = s.split("-").map(Number);
  return { y, mo, d };
}

export function toDateStr(y: number, mo: number, d: number): string {
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
