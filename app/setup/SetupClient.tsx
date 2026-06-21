"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Panel } from "clico-ds";
import { AlertTriangle, ArrowLeft, Check, ExternalLink, Loader2 } from "lucide-react";
import { useOrigin } from "@/lib/clientHooks";

export default function SetupClient() {
  const sp = useSearchParams();
  const connected = sp.get("connected") === "1";
  const error = sp.get("error");

  const origin = useOrigin();
  const [mode, setMode] = useState<"live" | "demo" | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => setMode(c.mode))
      .catch(() => setMode(null));
  }, []);

  const redirectUri = origin ? `${origin}/api/auth/google/callback` : "…";

  return (
    <main className="min-h-dvh bg-paper">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="text-4xl font-extrabold tracking-tight">Connect Google Calendar</h1>
        <p className="mt-2 text-muted">
          Authorize Timesync once to read your free/busy times and create events.
        </p>

        {/* status */}
        <div className="mt-6 space-y-3">
          {mode === "live" ? (
            <Banner tone="green" icon={<Check className="h-5 w-5" />}>
              Timesync is connected and running on live Google Calendar data.
            </Banner>
          ) : mode === "demo" ? (
            <Banner tone="amber" icon={<AlertTriangle className="h-5 w-5" />}>
              Currently running in <strong>demo mode</strong> with fabricated availability. Complete
              the steps below to go live.
            </Banner>
          ) : (
            <Banner tone="surface" icon={<Loader2 className="h-5 w-5 animate-spin" />}>
              Checking status…
            </Banner>
          )}

          {connected && (
            <Banner tone="green" icon={<Check className="h-5 w-5" />}>
              Authorized! Your refresh token was saved to <code>.env.local</code> (local dev) and
              printed to the server console. Restart the dev server, or copy it into your host&apos;s
              environment variables to go live.
            </Banner>
          )}
          {error && (
            <Banner tone="coral" icon={<AlertTriangle className="h-5 w-5" />}>
              Authorization failed: <code>{error}</code>
            </Banner>
          )}
        </div>

        {/* steps */}
        <ol className="mt-8 space-y-5">
          <Step n={1} title="Create OAuth credentials">
            <p>
              In the{" "}
              <a className="link" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">
                Google Cloud Console <ExternalLink className="inline h-3 w-3" />
              </a>{" "}
              create an <strong>OAuth 2.0 Client ID</strong> (type: Web application) and enable the{" "}
              <strong>Google Calendar API</strong>. Add this exact redirect URI:
            </p>
            <Code>{redirectUri}</Code>
          </Step>

          <Step n={2} title="Add environment variables">
            <p>Put the credentials in <code>.env.local</code> (and your host&apos;s env):</p>
            <Code>{`GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OWNER_EMAIL=you@example.com
TIMESYNC_TZ=Asia/Singapore`}</Code>
          </Step>

          <Step n={3} title="Authorize">
            <p>Click below, pick your Google account, and grant calendar access.</p>
            <Button as="a" href="/api/auth/google" variant="primary" className="mt-3" icon={<GoogleMark />}>
              Connect Google Calendar
            </Button>
          </Step>
        </ol>
      </div>

      <style>{`
        .link { color: var(--clico-link); font-weight: 700; }
        .link:hover { text-decoration: underline; }
        code { background: var(--clico-butter); border: 2px solid var(--clico-ink); border-radius: 6px; padding: 0 5px; font-family: var(--clico-font-mono); font-size: .85em; }
      `}</style>
    </main>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li>
      <Panel tone="surface" shadow="sm" radius="md" padding={20} className="list-none">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-[var(--clico-lime)] text-sm font-bold shadow-[2px_2px_0_#0a0a0a]">
            {n}
          </span>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="mt-3 space-y-1 pl-11 text-sm leading-relaxed text-muted">{children}</div>
      </Panel>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-[10px] border-2 border-ink bg-ink p-3.5 font-mono text-[13px] text-paper">
      {children}
    </pre>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "green" | "amber" | "coral" | "surface";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Panel tone={tone} shadow="sm" radius="md" padding={16}>
      <div className="flex items-start gap-3 text-sm text-ink">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>{children}</div>
      </div>
    </Panel>
  );
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.4-1.6 4.1-5.35 4.1a6.1 6.1 0 1 1 0-12.2c1.9 0 3.18.8 3.9 1.5l2.66-2.6A9.6 9.6 0 0 0 12 2.4 9.6 9.6 0 1 0 12 21.6c5.55 0 9.2-3.9 9.2-9.4 0-.6-.07-1.1-.15-1.1z" />
    </svg>
  );
}
