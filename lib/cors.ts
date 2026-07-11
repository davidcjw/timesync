import { NextResponse } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { ...CORS, ...init?.headers } });
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * Typed 503 for an expired/revoked Google refresh token. Distinct from a generic
 * 500 so clients can detect it via `code: "reauth_required"` and show a clear
 * "owner needs to re-authenticate" message instead of a broken state.
 */
export function reauthRequired(message: string) {
  return json({ error: message, code: "reauth_required" }, { status: 503 });
}
