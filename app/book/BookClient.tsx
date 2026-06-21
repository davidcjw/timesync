"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WindowDots } from "clico-ds";
import BookingWidget from "@/components/BookingWidget";

export default function BookClient() {
  const sp = useSearchParams();
  const embed = sp.get("embed") === "1";
  const presetEventType = sp.get("eventType") ?? undefined;
  const presetName = sp.get("name") ?? undefined;
  const presetEmail = sp.get("email") ?? undefined;
  const brandColor = sp.get("color") ?? undefined;

  if (embed) {
    return (
      <div className="min-h-dvh w-full bg-surface">
        <BookingWidget
          embed
          presetEventType={presetEventType}
          presetName={presetName}
          presetEmail={presetEmail}
          brandColor={brandColor}
        />
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border-2 border-ink bg-[var(--clico-lime)] shadow-[2px_2px_0_#0a0a0a]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#0a0a0a" strokeWidth={3}>
              <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Timesync
        </Link>

        <div className="flex flex-col overflow-hidden rounded-[14px] border-2 border-ink bg-surface shadow-[6px_6px_0_#0a0a0a] md:h-[680px]">
          <div className="flex items-center gap-3 border-b-2 border-ink bg-paper px-4 py-2.5">
            <WindowDots bordered />
            <span className="flex-1 text-center font-mono text-[11px] text-muted">timesync · /book</span>
            <span className="w-[52px]" />
          </div>
          <div className="min-h-0 flex-1">
            <BookingWidget
              presetEventType={presetEventType}
              presetName={presetName}
              presetEmail={presetEmail}
              brandColor={brandColor}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
