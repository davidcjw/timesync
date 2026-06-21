"use client";

import Script from "next/script";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Badge,
  BrowserFrame,
  Button,
  DisplayHeading,
  FeatureCard,
  Panel,
  SerifAccent,
  WindowDots,
} from "clico-ds";
import { ArrowRight, CalendarClock, Check, Code2, Copy, Globe, Video, Zap } from "lucide-react";
import { useOrigin } from "@/lib/clientHooks";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function openModal(eventType?: string) {
  if (typeof window !== "undefined" && window.Timesync) window.Timesync.open({ eventType });
  else window.location.href = "/book";
}

export default function Landing() {
  const base = useOrigin("https://your-timesync.app");

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <Script src="/embed.js" strategy="afterInteractive" />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <Button size="sm" variant="primary" onClick={() => openModal()}>
            Book a call
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dotgrid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_25%,black,transparent)]" />
        <div className="relative mx-auto max-w-3xl px-5 pt-16 pb-12 text-center sm:pt-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex justify-center">
            <Badge tone="mint" dot mono>
              Wired to Google Calendar
            </Badge>
          </motion.div>

          <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
            <DisplayHeading
              align="center"
              className="mt-6 text-[2.5rem]! sm:text-[3.5rem]! lg:text-[4.25rem]!"
            >
              Book time on my calendar, <SerifAccent>without the back-and-forth.</SerifAccent>
            </DisplayHeading>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted"
          >
            Timesync shows my real availability and books the slot instantly — with a Google Meet
            link. Drop it into any app as a modal, or share the link.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={3}
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button variant="primary" size="lg" onClick={() => openModal()} icon={<CalendarClock className="h-4 w-4" />}>
              Book a call
            </Button>
            <Button as="a" href="/book" variant="secondary" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Open booking page
            </Button>
          </motion.div>
        </div>

        {/* Live product preview */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl px-5 pb-20"
        >
          <BrowserFrame
            title={`${base.replace(/^https?:\/\//, "")}/book`}
            bodyTone="paper"
            className="shadow-[8px_8px_0_#0a0a0a]!"
          >
            <iframe
              src="/book?embed=1"
              title="Timesync booking preview"
              className="h-[560px] w-full rounded-[6px] border-2 border-ink bg-surface"
              loading="lazy"
            />
          </BrowserFrame>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="border-t-2 border-ink bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: <Zap className="h-5 w-5" />,
                tone: "mint" as const,
                title: "Real-time availability",
                body: "Pulls free/busy straight from Google Calendar, so you only ever see slots that are actually open.",
              },
              {
                icon: <Video className="h-5 w-5" />,
                tone: "peach" as const,
                title: "Meet link, automatically",
                body: "Every confirmed booking creates a calendar event with a Google Meet link and emails both sides.",
              },
              {
                icon: <Code2 className="h-5 w-5" />,
                tone: "lilac" as const,
                title: "Embed anywhere",
                body: "One script tag turns any button into a booking modal — no redirect, no iframe wrangling.",
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                variants={fadeUp}
              >
                <FeatureCard
                  icon={b.icon}
                  iconTone={b.tone}
                  title={b.title}
                  shadow="sm"
                  className="h-full max-w-none!"
                >
                  {b.body}
                </FeatureCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Booked in <SerifAccent>three taps</SerifAccent>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { n: "1", t: "Pick a day", d: "The calendar greys out anything you're not free for." },
              { n: "2", t: "Choose a time", d: "Slots are shown in the visitor's own timezone." },
              { n: "3", t: "Confirm", d: "Name and email, and the event lands on your calendar." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                custom={i}
                variants={fadeUp}
              >
                <Panel tone="surface" shadow="sm" radius="md" padding={24} className="h-full">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-[var(--clico-lime)] text-lg font-bold shadow-[2px_2px_0_#0a0a0a]">
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-muted">{s.d}</p>
                </Panel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Embed */}
      <section className="border-t-2 border-ink bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Add it to your app in 30 seconds</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Include the script once, then mark any element with{" "}
              <code className="rounded-[6px] border-2 border-ink bg-[var(--clico-butter)] px-1.5 py-0.5 font-mono text-sm">
                data-timesync
              </code>
              .
            </p>
          </div>
          <EmbedSnippet base={base} />
          <div className="mt-6 flex justify-center">
            <Button variant="primary" size="lg" onClick={() => openModal("30min")} icon={<CalendarClock className="h-4 w-4" />}>
              Try the modal
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo />
          <p className="inline-flex items-center gap-1.5 font-mono text-xs">
            <Globe className="h-3.5 w-3.5" /> Self-hosted scheduling for your Google Calendar.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-base font-bold tracking-tight">
      <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border-2 border-ink bg-[var(--clico-lime)] shadow-[2px_2px_0_#0a0a0a]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#0a0a0a" strokeWidth={3}>
          <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      Timesync
    </span>
  );
}

function EmbedSnippet({ base }: { base: string }) {
  const [copied, setCopied] = useState(false);
  const code = `<script src="${base}/embed.js"></script>
<button data-timesync data-event-type="30min">
  Book a call
</button>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <Panel padding={0} radius="md" shadow="md" className="mt-8 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-paper px-4 py-2.5">
        <div className="flex items-center gap-3">
          <WindowDots bordered />
          <span className="font-mono text-[11px] text-muted">index.html</span>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-[6px] border-2 border-ink bg-surface px-2 py-1 font-mono text-[11px] font-semibold text-ink shadow-[2px_2px_0_#0a0a0a] transition hover:-translate-x-px hover:-translate-y-px hover:bg-[var(--clico-lime)]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-ink p-5 font-mono text-[13px] leading-relaxed text-paper">
        <code>
          <span className="text-faint">{"<script "}</span>
          <span className="text-[color:var(--clico-lilac)]">src</span>
          <span className="text-faint">=</span>
          <span className="text-[color:var(--clico-lime)]">{`"${base}/embed.js"`}</span>
          <span className="text-faint">{"></script>"}</span>
          {"\n"}
          <span className="text-faint">{"<button "}</span>
          <span className="text-[color:var(--clico-lilac)]">data-timesync</span>{" "}
          <span className="text-[color:var(--clico-lilac)]">data-event-type</span>
          <span className="text-faint">=</span>
          <span className="text-[color:var(--clico-lime)]">{`"30min"`}</span>
          <span className="text-faint">{">"}</span>
          {"\n  Book a call\n"}
          <span className="text-faint">{"</button>"}</span>
        </code>
      </pre>
    </Panel>
  );
}
