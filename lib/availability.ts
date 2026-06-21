import { config, getEventType } from "./config";
import { parseDateStr, weekdayOf, zonedWallToUtc } from "./time";

export type Interval = { start: string; end: string }; // ISO strings
export type Slot = { start: string; end: string }; // ISO strings

function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Compute bookable slots for a given owner-local date and event type,
 * given the owner's busy intervals for that day.
 */
export function computeSlots(
  date: string,
  eventTypeId: string,
  busy: Interval[],
  now: Date,
): Slot[] {
  const et = getEventType(eventTypeId);
  if (!et) return [];

  const { y, mo, d } = parseDateStr(date);
  const windows = config.weeklyHours[weekdayOf(y, mo, d)] ?? [];
  if (windows.length === 0) return [];

  const busyMs = busy.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
  const bufMs = config.bufferMinutes * 60000;
  const earliestMs = now.getTime() + config.minNoticeMinutes * 60000;

  const slots: Slot[] = [];
  for (const w of windows) {
    const startMin = hmToMinutes(w.start);
    const endMin = hmToMinutes(w.end);
    for (let t = startMin; t + et.duration <= endMin; t += config.slotInterval) {
      const slotStart = zonedWallToUtc(y, mo, d, Math.floor(t / 60), t % 60, config.timeZone);
      const startMs = slotStart.getTime();
      const endMs = startMs + et.duration * 60000;

      if (startMs < earliestMs) continue;

      const overlaps = busyMs.some((b) => startMs < b.end + bufMs && endMs + bufMs > b.start);
      if (overlaps) continue;

      slots.push({
        start: new Date(startMs).toISOString(),
        end: new Date(endMs).toISOString(),
      });
    }
  }
  return slots;
}
