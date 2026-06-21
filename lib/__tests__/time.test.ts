import { describe, expect, it } from "vitest";
import { weekdayOf, zonedDateParts, zonedWallToUtc, zoneOffsetMinutes } from "../time";

describe("zonedWallToUtc", () => {
  it("converts Singapore wall time (UTC+8, no DST)", () => {
    expect(zonedWallToUtc(2026, 6, 22, 9, 0, "Asia/Singapore").toISOString()).toBe(
      "2026-06-22T01:00:00.000Z",
    );
  });

  it("handles DST: New York winter (EST -5)", () => {
    expect(zonedWallToUtc(2026, 1, 15, 9, 0, "America/New_York").toISOString()).toBe(
      "2026-01-15T14:00:00.000Z",
    );
  });

  it("handles DST: New York summer (EDT -4)", () => {
    expect(zonedWallToUtc(2026, 7, 15, 9, 0, "America/New_York").toISOString()).toBe(
      "2026-07-15T13:00:00.000Z",
    );
  });
});

describe("weekdayOf", () => {
  it("knows Monday and Sunday", () => {
    expect(weekdayOf(2026, 6, 22)).toBe(1); // Mon
    expect(weekdayOf(2026, 6, 21)).toBe(0); // Sun
  });
});

describe("zonedDateParts", () => {
  it("rolls to the next calendar day across the timezone boundary", () => {
    // 17:30Z + 8h = 01:30 next day in Singapore
    expect(zonedDateParts("Asia/Singapore", new Date("2026-06-21T17:30:00Z"))).toEqual({
      y: 2026,
      mo: 6,
      d: 22,
    });
  });
});

describe("zoneOffsetMinutes", () => {
  it("returns +480 for Singapore", () => {
    expect(zoneOffsetMinutes("Asia/Singapore", new Date("2026-06-22T00:00:00Z"))).toBe(480);
  });
});
