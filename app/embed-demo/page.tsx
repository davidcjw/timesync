"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { Badge, Button } from "clico-ds";
import { CalendarClock, CheckCircle2, Phone } from "lucide-react";

export default function EmbedDemo() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "timesync:booked") {
        const p = e.data.payload;
        const when = p?.start ? new Date(p.start).toLocaleString() : "your slot";
        setToast(`Booked: ${when}`);
        setTimeout(() => setToast(null), 6000);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  function open(eventType?: string) {
    if (window.Timesync) window.Timesync.open({ eventType });
    else window.location.href = "/book";
  }

  return (
    <main className="min-h-dvh bg-[var(--clico-lilac)] text-ink">
      <Script src="/embed.js" strategy="afterInteractive" />

      {/* Pretend this is some other product's marketing site */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="text-lg font-black tracking-tight">Acme&nbsp;Studio</span>
        <Button data-timesync data-event-type="30min" size="sm" variant="secondary">
          Contact sales
        </Button>
      </nav>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <div className="flex justify-center">
          <Badge tone="lime" mono>A different app, embedding Timesync</Badge>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
          We build delightful brands.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-ink/70">
          This page isn&apos;t Timesync — it&apos;s a demo of another product dropping in the booking
          modal. Click any button below; it opens over this page, no redirect.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {/* Declarative: the embed script binds [data-timesync] automatically */}
          <Button data-timesync data-event-type="15min" variant="primary" size="lg" icon={<Phone className="h-4 w-4" />}>
            Quick 15-min chat
          </Button>

          {/* Programmatic: call Timesync.open() yourself */}
          <Button onClick={() => open("60min")} variant="secondary" size="lg" icon={<CalendarClock className="h-4 w-4" />}>
            Book a deep dive
          </Button>
        </div>

        <p className="mt-6 font-mono text-[11px] text-ink/60">
          The bottom toast fires from this page&apos;s own <code>message</code> listener when a
          booking completes.
        </p>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-ink bg-[var(--clico-green)] px-5 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_#0a0a0a]">
          <CheckCircle2 className="h-5 w-5" /> {toast}
        </div>
      )}
    </main>
  );
}
