import { describe, expect, it } from "vitest";
import { computeSlots } from "../availability";

// Config defaults: Asia/Singapore, Mon–Fri 09:00–17:00, slotInterval 30, minNotice 120.
const FAR_PAST_NOW = new Date("2026-06-01T00:00:00Z"); // so min-notice never filters

describe("computeSlots", () => {
  it("returns a full Monday of 30-min slots when nothing is busy", () => {
    const slots = computeSlots("2026-06-22", "30min", [], FAR_PAST_NOW);
    // 09:00 → 16:30 inclusive at 30-min steps = 16 slots
    expect(slots).toHaveLength(16);
    expect(slots[0].start).toBe("2026-06-22T01:00:00.000Z"); // 09:00 SGT
    expect(slots[0].end).toBe("2026-06-22T01:30:00.000Z");
    expect(slots[slots.length - 1].start).toBe("2026-06-22T08:30:00.000Z"); // 16:30 SGT
  });

  it("excludes slots overlapping a busy block", () => {
    const busy = [{ start: "2026-06-22T02:00:00.000Z", end: "2026-06-22T02:30:00.000Z" }]; // 10:00 SGT
    const slots = computeSlots("2026-06-22", "30min", busy, FAR_PAST_NOW);
    expect(slots).toHaveLength(15);
    expect(slots.some((s) => s.start === "2026-06-22T02:00:00.000Z")).toBe(false);
  });

  it("supports a 2-hour (120-min) event type", () => {
    const slots = computeSlots("2026-06-22", "120min", [], FAR_PAST_NOW);
    // 09:00 → 15:00 inclusive at 30-min steps (needs 120 min before 17:00) = 13 slots
    expect(slots).toHaveLength(13);
    expect(slots[0].start).toBe("2026-06-22T01:00:00.000Z"); // 09:00 SGT
    expect(slots[slots.length - 1].start).toBe("2026-06-22T07:00:00.000Z"); // 15:00 SGT
    expect(slots[slots.length - 1].end).toBe("2026-06-22T09:00:00.000Z"); // 17:00 SGT
  });

  it("returns nothing on a non-working day (Sunday)", () => {
    expect(computeSlots("2026-06-21", "30min", [], FAR_PAST_NOW)).toEqual([]);
  });

  it("yields fewer slots for a longer event type", () => {
    const slots = computeSlots("2026-06-22", "60min", [], FAR_PAST_NOW);
    // 09:00 → 16:00 inclusive at 30-min steps (needs 60 min before 17:00) = 15 slots
    expect(slots).toHaveLength(15);
    expect(slots[slots.length - 1].start).toBe("2026-06-22T08:00:00.000Z"); // 16:00 SGT
  });

  it("respects minimum notice", () => {
    // now = 10:00 SGT on the same day → earliest bookable = 12:00 SGT (120 min notice)
    const now = new Date("2026-06-22T02:00:00.000Z");
    const slots = computeSlots("2026-06-22", "30min", [], now);
    // First allowed slot is 12:00 SGT = 04:00Z
    expect(slots[0].start).toBe("2026-06-22T04:00:00.000Z");
  });

  it("ignores unknown event types", () => {
    expect(computeSlots("2026-06-22", "nope", [], FAR_PAST_NOW)).toEqual([]);
  });
});
