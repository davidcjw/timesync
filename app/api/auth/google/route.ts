import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { authUrl } from "@/lib/google";

export const dynamic = "force-dynamic";

export const OAUTH_STATE_COOKIE = "timesync_oauth_state";

export function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${req.nextUrl.origin}/setup?error=missing_client`);
  }
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${req.nextUrl.origin}/api/auth/google/callback`;

  // CSRF protection: mint a random state, echo it to Google, and stash it in a
  // short-lived httpOnly cookie so the callback can verify the round-trip.
  const state = crypto.randomBytes(32).toString("hex");
  const res = NextResponse.redirect(authUrl(redirectUri, state));
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // survives the top-level GET redirect back from Google
    path: "/",
    maxAge: 600, // 10 minutes
  });
  return res;
}
