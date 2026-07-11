// Chooses the real Google Calendar provider when credentials are present,
// otherwise a deterministic demo provider so the whole app is testable offline.

import { isLive, config } from "./config";
import type { Interval } from "./availability";
import { zonedDateParts, zonedWallToUtc } from "./time";
import * as gcal from "./google";

// Re-exported so routes catch the typed re-auth error via the provider boundary.
export { CalendarAuthError } from "./google";

export async function fetchBusy(timeMin: string, timeMax: string): Promise<Interval[]> {
  if (isLive()) return gcal.getBusy(timeMin, timeMax);
  return mockBusy(timeMin);
}

export type BookArgs = gcal.CreateEventArgs;

export async function book(args: BookArgs) {
  if (isLive()) return gcal.createEvent(args);
  // Demo mode: pretend to book and hand back a placeholder Meet link.
  return {
    eventId: `demo-${Date.now()}`,
    htmlLink: null as string | null,
    meetLink: "https://meet.google.com/demo-timesync",
  };
}

/** Fabricate believable busy blocks (owner-local) so demo availability looks real. */
function mockBusy(timeMin: string): Interval[] {
  const { y, mo, d } = zonedDateParts(config.timeZone, new Date(timeMin));
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();

  const windowsByWeekday: Record<number, [string, string][]> = {
    1: [["10:00", "10:30"], ["14:00", "15:00"]], // Mon
    2: [["09:30", "10:00"], ["13:00", "13:30"], ["16:00", "16:30"]], // Tue
    3: [["11:00", "12:00"]], // Wed
    4: [["09:00", "09:30"], ["15:30", "16:30"]], // Thu
    5: [["10:30", "11:00"], ["14:30", "15:00"]], // Fri
  };

  const windows = windowsByWeekday[wd] ?? [];
  return windows.map(([s, e]) => {
    const [sh, sm] = s.split(":").map(Number);
    const [eh, em] = e.split(":").map(Number);
    return {
      start: zonedWallToUtc(y, mo, d, sh, sm, config.timeZone).toISOString(),
      end: zonedWallToUtc(y, mo, d, eh, em, config.timeZone).toISOString(),
    };
  });
}
