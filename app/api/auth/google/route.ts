import { NextResponse, type NextRequest } from "next/server";
import { authUrl } from "@/lib/google";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${req.nextUrl.origin}/setup?error=missing_client`);
  }
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${req.nextUrl.origin}/api/auth/google/callback`;
  return NextResponse.redirect(authUrl(redirectUri));
}
