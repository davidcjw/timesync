import { describe, expect, it, vi } from "vitest";

// Simulate Google rejecting an expired/revoked refresh token. googleapis surfaces
// this as a Gaxios error whose message and response body carry `invalid_grant`.
vi.mock("googleapis", () => {
  const invalidGrant = Object.assign(
    new Error("invalid_grant (Token has been expired or revoked.)"),
    {
      response: {
        data: { error: "invalid_grant", error_description: "Token has been expired or revoked." },
      },
    },
  );
  class OAuth2 {
    setCredentials() {}
    generateAuthUrl() {
      return "";
    }
    async getToken() {
      return { tokens: {} };
    }
  }
  return {
    google: {
      auth: { OAuth2 },
      calendar: () => ({
        freebusy: { query: () => Promise.reject(invalidGrant) },
        events: { insert: () => Promise.reject(invalidGrant) },
      }),
    },
  };
});

import { CalendarAuthError, createEvent, getBusy, isInvalidGrant } from "../google";

describe("isInvalidGrant", () => {
  it("matches the invalid_grant message", () => {
    expect(isInvalidGrant(new Error("invalid_grant"))).toBe(true);
  });

  it("matches a Gaxios-shaped error body", () => {
    expect(isInvalidGrant({ response: { data: { error: "invalid_grant" } } })).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isInvalidGrant(new Error("network timeout"))).toBe(false);
    expect(isInvalidGrant(null)).toBe(false);
  });
});

describe("calendar calls surface a typed re-auth error", () => {
  it("getBusy throws CalendarAuthError on invalid_grant", async () => {
    await expect(getBusy("2026-06-22T00:00:00Z", "2026-06-22T23:59:00Z")).rejects.toBeInstanceOf(
      CalendarAuthError,
    );
  });

  it("createEvent throws CalendarAuthError on invalid_grant", async () => {
    const err = await createEvent({
      summary: "Chat",
      description: "",
      start: "2026-06-22T01:00:00.000Z",
      end: "2026-06-22T01:30:00.000Z",
      attendeeEmail: "jane@example.com",
      attendeeName: "Jane",
    }).catch((e) => e);
    expect(err).toBeInstanceOf(CalendarAuthError);
    expect((err as CalendarAuthError).code).toBe("reauth_required");
  });
});
