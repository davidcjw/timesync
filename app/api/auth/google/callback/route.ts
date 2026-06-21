import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { exchangeCode } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/setup?error=no_code`);

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;

  try {
    const tokens = await exchangeCode(code, redirectUri);
    const refresh = tokens.refresh_token;
    if (!refresh) return NextResponse.redirect(`${origin}/setup?error=no_refresh_token`);

    // The refresh token is the secret you store. In local dev we persist it to
    // .env.local automatically; everywhere it is also logged to the server
    // console so you can copy it into your host's env (e.g. Vercel).
    console.log("\n[timesync] GOOGLE_REFRESH_TOKEN=" + refresh + "\n");

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
    return NextResponse.redirect(`${origin}/setup?connected=1&masked=${encodeURIComponent(masked)}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "exchange_failed";
    return NextResponse.redirect(`${origin}/setup?error=${encodeURIComponent(message)}`);
  }
}
