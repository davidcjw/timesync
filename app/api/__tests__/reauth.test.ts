import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Make the provider behave as if Google's refresh token is expired/revoked.
vi.mock("@/lib/provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/provider")>();
  return {
    ...actual,
    fetchBusy: vi.fn(async () => {
      throw new actual.CalendarAuthError();
    }),
    book: vi.fn(async () => {
      throw new actual.CalendarAuthError();
    }),
  };
});

import { GET as availabilityGET } from "@/app/api/availability/route";
import { POST as bookPOST } from "@/app/api/book/route";

describe("graceful invalid_grant handling", () => {
  it("availability returns a typed 503 instead of an unhandled 500", async () => {
    const req = new NextRequest("http://localhost/api/availability?date=2026-07-13&eventType=30min");
    const res = await availabilityGET(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe("reauth_required");
    expect(typeof body.error).toBe("string");
  });

  it("booking returns a typed 503 instead of an unhandled 500", async () => {
    const req = new NextRequest("http://localhost/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: "30min",
        start: "2026-07-13T01:00:00.000Z", // 09:00 SGT, a Monday
        name: "Jane Doe",
        email: "jane@example.com",
      }),
    });
    const res = await bookPOST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe("reauth_required");
    expect(body.error).toMatch(/re-?authenticate/i);
  });
});
