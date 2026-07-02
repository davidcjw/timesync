import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { exchangeCode } from "@/lib/google";
import { OAUTH_STATE_COOKIE } from "../route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/setup?error=no_code`);

  // CSRF: the `state` returned by Google must match the cookie we set when the
  // flow started. Reject mismatches before exchanging the code.
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!state || !cookieState || state !== cookieState) {
    const bad = new NextResponse("Invalid OAuth state", { status: 400 });
    bad.cookies.delete(OAUTH_STATE_COOKIE);
    return bad;
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;

  try {
    const tokens = await exchangeCode(code, redirectUri);
    const refresh = tokens.refresh_token;
    if (!refresh) return NextResponse.redirect(`${origin}/setup?error=no_refresh_token`);

    // The refresh token is the secret you store. In local dev we persist it to
    // .env.local automatically. NEVER log the full token — only a masked hint so
    // secrets don't leak into server/host logs.
    console.log(
      `[timesync] connected — GOOGLE_REFRESH_TOKEN=${refresh.slice(0, 6)}… (masked)`,
    );

    if (process.env.NODE_ENV !== "production") {
      try {
        const envPath = path.join(process.cwd(), ".env.local");
        const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
        const cleaned = existing
          .split("\n")
          .filter((l) => !l.startsWith("GOOGLE_REFRESH_TOKEN="))
          .join("\n")
          .trimEnd();
        fs.writeFileSync(envPath, `${cleaned}\nGOOGLE_REFRESH_TOKEN=${refresh}\n`.trimStart());
      } catch (e) {
        console.warn("[timesync] could not write .env.local", e);
      }
    }

    const masked = `${refresh.slice(0, 6)}…${refresh.slice(-4)}`;
    const ok = NextResponse.redirect(
      `${origin}/setup?connected=1&masked=${encodeURIComponent(masked)}`,
    );
    ok.cookies.delete(OAUTH_STATE_COOKIE); // single-use state
    return ok;
  } catch (err) {
    const message = err instanceof Error ? err.message : "exchange_failed";
    const fail = NextResponse.redirect(`${origin}/setup?error=${encodeURIComponent(message)}`);
    fail.cookies.delete(OAUTH_STATE_COOKIE);
    return fail;
  }
}
