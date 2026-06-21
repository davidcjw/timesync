// Timesync configuration — the single source of truth for availability rules.
// Everything here is non-secret and safe to expose to the booking UI.
// Secrets (Google OAuth client/refresh token) are read separately in lib/google.ts.

export type EventType = {
  id: string;
  label: string;
  duration: number; // minutes
  description: string;
};

export type DayWindow = { start: string; end: string }; // "HH:mm" in owner's timezone

export type TimesyncConfig = {
  ownerName: string;
  ownerEmail: string;
  timeZone: string;
  /** Weekly availability. Key = weekday (0=Sun .. 6=Sat). Omit a day to make it unavailable. */
  weeklyHours: Record<number, DayWindow[]>;
  eventTypes: EventType[];
  slotInterval: number; // minutes between candidate slot start times
  minNoticeMinutes: number; // soonest a slot can be booked from "now"
  maxAdvanceDays: number; // furthest day ahead that can be booked
  bufferMinutes: number; // padding kept free around existing events
};

const WEEKDAY_HOURS: DayWindow[] = [{ start: "09:00", end: "17:00" }];

export const config: TimesyncConfig = {
  ownerName: process.env.OWNER_NAME ?? "David Chong",
  ownerEmail: process.env.OWNER_EMAIL ?? "davidcjw@gmail.com",
  timeZone: process.env.TIMESYNC_TZ ?? "Asia/Singapore",
  weeklyHours: {
    1: WEEKDAY_HOURS, // Mon
    2: WEEKDAY_HOURS, // Tue
    3: WEEKDAY_HOURS, // Wed
    4: WEEKDAY_HOURS, // Thu
    5: WEEKDAY_HOURS, // Fri
  },
  eventTypes: [
    { id: "15min", label: "Quick Chat", duration: 15, description: "A brief 15-minute intro call." },
    { id: "30min", label: "30 Minute Meeting", duration: 30, description: "A standard 30-minute meeting." },
    { id: "60min", label: "Deep Dive", duration: 60, description: "A focused 60-minute working session." },
    { id: "120min", label: "Workshop", duration: 120, description: "An extended 2-hour workshop or working session." },
  ],
  slotInterval: 30,
  minNoticeMinutes: 120,
  maxAdvanceDays: 30,
  bufferMinutes: 0,
};

export function getEventType(id: string | null | undefined): EventType | undefined {
  if (!id) return config.eventTypes[0];
  return config.eventTypes.find((e) => e.id === id);
}

/** True when real Google Calendar credentials are configured; otherwise the app runs in demo mode. */
export function isLive(): boolean {
  return Boolean(
    process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );
}

export function availableWeekdays(): number[] {
  return Object.keys(config.weeklyHours).map(Number);
}
