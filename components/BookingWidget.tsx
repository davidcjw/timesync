"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Button, Panel, SerifAccent } from "clico-ds";
import { useBookerTimeZone } from "@/lib/clientHooks";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  Video,
} from "lucide-react";

type EventType = { id: string; label: string; duration: number; description: string };
type Cfg = {
  ownerName: string;
  timeZone: string;
  eventTypes: EventType[];
  availableWeekdays: number[];
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  mode: "live" | "demo";
};
type Slot = { start: string; end: string };
type BookResult = {
  ok: true;
  start: string;
  end: string;
  eventType: EventType;
  eventId: string;
  meetLink: string | null;
  htmlLink: string | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ymdInTZ(date: Date, timeZone: string) {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const [y, mo, d] = s.split("-").map(Number);
  return { y, mo, d };
}

const toStr = (y: number, mo: number, d: number) =>
  `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const toNum = (y: number, mo: number, d: number) => y * 10000 + mo * 100 + d;
const weekdayOf = (y: number, mo: number, d: number) => new Date(Date.UTC(y, mo - 1, d)).getUTCDay();

function fmtTime(iso: string, tz: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(new Date(iso));
}

function fmtFullDate(iso: string, tz: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: tz,
  }).format(new Date(iso));
}

function fmtDayHeading(dateStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, mo - 1, d, 12)));
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function BookingWidget({
  embed = false,
  presetEventType,
  presetName,
  presetEmail,
  brandColor,
}: {
  embed?: boolean;
  presetEventType?: string;
  presetName?: string;
  presetEmail?: string;
  brandColor?: string;
}) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [loadError, setLoadError] = useState(false);
  const bookerTz = useBookerTimeZone();

  const [eventTypeId, setEventTypeId] = useState<string>(presetEventType ?? "");
  const [view, setView] = useState<{ y: number; mo: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [step, setStep] = useState<"pick" | "details" | "done">("pick");
  const [name, setName] = useState(presetName ?? "");
  const [email, setEmail] = useState(presetEmail ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<BookResult | null>(null);

  // Optional embed accent retints the clico lime token across the whole widget.
  const accent = brandColor ? `#${brandColor.replace("#", "")}` : null;
  const rootStyle = accent ? ({ ["--clico-lime"]: accent } as React.CSSProperties) : undefined;

  const loadSlots = useCallback(async (dateStr: string, etId: string) => {
    setSlotsLoading(true);
    setSlots(null);
    try {
      const r = await fetch(`/api/availability?date=${dateStr}&eventType=${etId}`);
      const j = await r.json();
      setSlots(j.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // Load config, then jump to the first available day and preload its slots.
  // setState lives inside the promise callback (not the effect body) by design.
  useEffect(() => {
    let alive = true;
    fetch("/api/config")
      .then((r) => r.json())
      .then((c: Cfg) => {
        if (!alive) return;
        setCfg(c);
        const validPreset = c.eventTypes.find((e) => e.id === presetEventType);
        const etId = validPreset?.id ?? c.eventTypes[0].id;
        setEventTypeId(etId);

        const t = ymdInTZ(new Date(), c.timeZone);
        for (let i = 0; i <= c.maxAdvanceDays; i++) {
          const dt = new Date(Date.UTC(t.y, t.mo - 1, t.d + i));
          const y = dt.getUTCFullYear();
          const mo = dt.getUTCMonth() + 1;
          const d = dt.getUTCDate();
          if (c.availableWeekdays.includes(weekdayOf(y, mo, d))) {
            setView({ y, mo });
            const ds = toStr(y, mo, d);
            setSelectedDate(ds);
            loadSlots(ds, etId);
            return;
          }
        }
        setView({ y: t.y, mo: t.mo });
      })
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, [presetEventType, loadSlots]);

  const today = useMemo(() => (cfg ? ymdInTZ(new Date(), cfg.timeZone) : null), [cfg]);
  const maxYmd = useMemo(() => {
    if (!cfg || !today) return null;
    const m = new Date(Date.UTC(today.y, today.mo - 1, today.d + cfg.maxAdvanceDays));
    return { y: m.getUTCFullYear(), mo: m.getUTCMonth() + 1, d: m.getUTCDate() };
  }, [cfg, today]);

  const selectedEventType = cfg?.eventTypes.find((e) => e.id === eventTypeId) ?? cfg?.eventTypes[0];

  const isSelectable = useCallback(
    (y: number, mo: number, d: number) => {
      if (!cfg || !today || !maxYmd) return false;
      const n = toNum(y, mo, d);
      if (n < toNum(today.y, today.mo, today.d)) return false;
      if (n > toNum(maxYmd.y, maxYmd.mo, maxYmd.d)) return false;
      return cfg.availableWeekdays.includes(weekdayOf(y, mo, d));
    },
    [cfg, today, maxYmd],
  );

  // Notify the embedding app on success.
  useEffect(() => {
    if (result && embed && typeof window !== "undefined") {
      window.parent?.postMessage({ type: "timesync:booked", payload: result }, "*");
    }
  }, [result, embed]);

  function pickEventType(id: string) {
    setEventTypeId(id);
    setSelectedSlot(null);
    if (selectedDate) loadSlots(selectedDate, id);
  }

  function pickDate(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    loadSlots(dateStr, eventTypeId);
  }

  function pickSlot(slot: Slot) {
    setSelectedSlot(slot);
    setFormError(null);
    setStep("details");
  }

  async function submit() {
    if (!selectedSlot || !selectedEventType) return;
    if (!name.trim()) return setFormError("Please enter your name.");
    if (!EMAIL_RE.test(email)) return setFormError("Please enter a valid email.");
    setSubmitting(true);
    setFormError(null);
    try {
      const r = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: selectedEventType.id,
          start: selectedSlot.start,
          name,
          email,
          notes,
          timeZone: bookerTz,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setFormError(j.error ?? "Something went wrong. Please try again.");
        if (r.status === 409 && selectedDate) loadSlots(selectedDate, selectedEventType.id);
        setSubmitting(false);
        return;
      }
      setResult(j as BookResult);
      setStep("done");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForAnother() {
    setResult(null);
    setSelectedSlot(null);
    setNotes("");
    setStep("pick");
    if (selectedDate) loadSlots(selectedDate, eventTypeId);
  }

  /* ----------------------------- render states ----------------------------- */

  if (loadError) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-surface p-8 text-center">
        <div>
          <p className="text-lg font-bold text-ink">Couldn’t load availability</p>
          <p className="mt-1 text-sm text-muted">Please refresh and try again.</p>
        </div>
      </div>
    );
  }

  if (!cfg || !selectedEventType) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-ink" />
      </div>
    );
  }

  return (
    <div style={rootStyle} className="flex min-h-[520px] flex-col bg-surface text-ink md:h-full">
      <AnimatePresence mode="wait">
        {step === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Header cfg={cfg} eventTypeId={eventTypeId} onPick={pickEventType} selected={selectedEventType} />
            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_318px] md:overflow-hidden md:[grid-template-rows:minmax(0,1fr)]">
              <CalendarPanel
                view={view}
                setView={setView}
                today={today!}
                maxYmd={maxYmd!}
                selectedDate={selectedDate}
                isSelectable={isSelectable}
                onPick={pickDate}
              />
              <SlotPanel
                selectedDate={selectedDate}
                bookerTz={bookerTz}
                slots={slots}
                loading={slotsLoading}
                onPick={pickSlot}
              />
            </div>
          </motion.div>
        )}

        {step === "details" && selectedSlot && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8"
          >
            <button
              onClick={() => setStep("pick")}
              className="mb-5 inline-flex w-fit items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="mx-auto w-full max-w-md">
              <SummaryCard
                eventType={selectedEventType}
                slot={selectedSlot}
                bookerTz={bookerTz}
                ownerName={cfg.ownerName}
              />

              <div className="mt-6 space-y-4">
                <Field label="Name" required>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className="ts-input"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="jane@company.com"
                    className="ts-input"
                  />
                </Field>
                <Field label="What's this about?">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Share anything that'll help me prepare (optional)."
                    className="ts-input resize-none"
                  />
                </Field>

                {formError && (
                  <Panel tone="coral" shadow="sm" radius="md" padding={12} role="alert">
                    <span className="text-sm font-semibold text-ink">{formError}</span>
                  </Panel>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  block
                  onClick={submit}
                  disabled={submitting}
                  icon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                >
                  {submitting ? "Scheduling…" : "Confirm booking"}
                </Button>
                <p className="text-center font-mono text-[11px] text-muted">
                  A calendar invite{cfg.mode === "live" ? " with a Google Meet link" : ""} will be
                  emailed to you.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-[var(--clico-green)] shadow-[4px_4px_0_#0a0a0a]"
            >
              <Check className="h-8 w-8 text-ink" strokeWidth={3} />
            </motion.div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              You&apos;re <SerifAccent>booked!</SerifAccent>
            </h2>
            <p className="mt-1 text-sm text-muted">
              Confirmation sent to <span className="font-semibold text-ink">{email}</span>
            </p>

            <Panel tone="mint" shadow="sm" radius="md" padding={20} className="mt-6 w-full max-w-sm text-left">
              <p className="font-bold">{result.eventType.label}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink">
                <CalendarIcon className="h-4 w-4" />
                {fmtFullDate(result.start, bookerTz)}
              </p>
              <p className="mt-1.5 flex items-center gap-2 font-mono text-sm text-ink tabular">
                <Clock className="h-4 w-4" />
                {fmtTime(result.start, bookerTz)} – {fmtTime(result.end, bookerTz)}
              </p>
              {bookerTz && (
                <p className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-muted">
                  <Globe className="h-3.5 w-3.5" /> {bookerTz.replace(/_/g, " ")}
                </p>
              )}
              {result.meetLink && (
                <Button
                  as="a"
                  href={result.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  block
                  className="mt-4"
                  icon={<Video className="h-4 w-4" />}
                >
                  Join Google Meet
                </Button>
              )}
            </Panel>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {result.htmlLink && (
                <a
                  href={result.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--clico-link)] hover:underline"
                >
                  Open in Google Calendar <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={resetForAnother}
                className="text-sm font-semibold text-muted transition-colors hover:text-ink"
              >
                Book another time
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ts-input {
          width: 100%;
          border: 2px solid #0a0a0a;
          border-radius: 10px;
          background: #fff;
          padding: 0.6rem 0.85rem;
          font-size: 0.95rem;
          font-family: var(--clico-font-sans);
          color: #0a0a0a;
          transition: box-shadow .16s ease;
        }
        .ts-input::placeholder { color: #999; }
        .ts-input:focus {
          outline: none;
          box-shadow: 2px 2px 0 #0a0a0a;
        }
      `}</style>
    </div>
  );
}

/* -------------------------------- subviews -------------------------------- */

function Header({
  cfg,
  eventTypeId,
  onPick,
  selected,
}: {
  cfg: Cfg;
  eventTypeId: string;
  onPick: (id: string) => void;
  selected: EventType;
}) {
  const initials = cfg.ownerName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="border-b-2 border-ink px-6 pt-6 pb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-ink text-sm font-bold text-paper shadow-[2px_2px_0_#0a0a0a]">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] uppercase tracking-wide text-muted">
            {cfg.ownerName}
          </p>
          <h2 className="truncate text-lg font-bold tracking-tight">{selected.label}</h2>
        </div>
        {cfg.mode === "demo" && (
          <span className="ml-auto">
            <Badge tone="amber" mono>Demo data</Badge>
          </span>
        )}
      </div>

      {cfg.eventTypes.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {cfg.eventTypes.map((et) => (
            <Button
              key={et.id}
              size="sm"
              variant={et.id === eventTypeId ? "primary" : "secondary"}
              onClick={() => onPick(et.id)}
            >
              {et.label}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" /> {selected.duration} MIN
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Video className="h-4 w-4" /> GOOGLE MEET
        </span>
      </div>
    </div>
  );
}

function CalendarPanel({
  view,
  setView,
  today,
  maxYmd,
  selectedDate,
  isSelectable,
  onPick,
}: {
  view: { y: number; mo: number } | null;
  setView: (v: { y: number; mo: number }) => void;
  today: { y: number; mo: number; d: number };
  maxYmd: { y: number; mo: number; d: number };
  selectedDate: string | null;
  isSelectable: (y: number, mo: number, d: number) => boolean;
  onPick: (dateStr: string) => void;
}) {
  if (!view) return <div className="p-6" />;
  const { y, mo } = view;
  const firstWeekday = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();

  const canPrev = toNum(y, mo, 1) > toNum(today.y, today.mo, 1);
  const nextMonth = mo === 12 ? { y: y + 1, mo: 1 } : { y, mo: mo + 1 };
  const canNext = toNum(nextMonth.y, nextMonth.mo, 1) <= toNum(maxYmd.y, maxYmd.mo, maxYmd.d);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-6 md:min-h-0 md:overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold">
          {MONTHS[mo - 1]} <span className="text-muted">{y}</span>
        </h3>
        <div className="flex gap-2">
          <NavBtn
            disabled={!canPrev}
            onClick={() => setView(mo === 1 ? { y: y - 1, mo: 12 } : { y, mo: mo - 1 })}
            label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </NavBtn>
          <NavBtn disabled={!canNext} onClick={() => setView(nextMonth)} label="Next month">
            <ChevronRight className="h-4 w-4" />
          </NavBtn>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-medium uppercase text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const dateStr = toStr(y, mo, d);
          const selectable = isSelectable(y, mo, d);
          const isSelected = selectedDate === dateStr;
          const isToday = toNum(y, mo, d) === toNum(today.y, today.mo, today.d);
          return (
            <button
              key={dateStr}
              disabled={!selectable}
              onClick={() => onPick(dateStr)}
              aria-pressed={isSelected}
              className={[
                "relative flex items-center justify-center rounded-[8px] border-2 text-sm font-bold transition",
                "aspect-square md:aspect-auto md:h-12",
                isSelected
                  ? "border-ink bg-[var(--clico-lime)] text-ink shadow-[2px_2px_0_#0a0a0a]"
                  : selectable
                    ? "border-transparent text-ink hover:border-ink hover:bg-[var(--clico-lime)] hover:shadow-[2px_2px_0_#0a0a0a]"
                    : "border-transparent text-faint",
              ].join(" ")}
            >
              {d}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ink" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-ink bg-surface text-ink shadow-[2px_2px_0_#0a0a0a] transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#0a0a0a] disabled:pointer-events-none disabled:opacity-25 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function SlotPanel({
  selectedDate,
  bookerTz,
  slots,
  loading,
  onPick,
}: {
  selectedDate: string | null;
  bookerTz: string;
  slots: Slot[] | null;
  loading: boolean;
  onPick: (slot: Slot) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col border-t-2 border-ink p-6 md:border-t-0 md:border-l-2">
      <div className="mb-4">
        <p className="font-bold">{selectedDate ? fmtDayHeading(selectedDate) : "Select a day"}</p>
        {bookerTz && (
          <p className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <Globe className="h-3.5 w-3.5" /> {bookerTz.replace(/_/g, " ")}
          </p>
        )}
      </div>

      <div className="slot-scroll -mr-2 min-h-[120px] flex-1 space-y-2.5 pr-2 md:overflow-y-auto md:min-h-0">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-[10px] border-2 border-ink/10 bg-[#efece3]" />
          ))
        ) : slots && slots.length > 0 ? (
          slots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => onPick(slot)}
              className="tabular flex w-full items-center justify-center rounded-[10px] border-2 border-ink bg-surface py-3 font-mono text-sm font-semibold text-ink shadow-[2px_2px_0_#0a0a0a] transition hover:-translate-x-px hover:-translate-y-px hover:bg-[var(--clico-lime)] hover:shadow-[4px_4px_0_#0a0a0a]"
            >
              {fmtTime(slot.start, bookerTz || "UTC")}
            </button>
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <CalendarIcon className="h-7 w-7 text-faint" />
            <p className="mt-2 text-sm font-bold text-ink">No times available</p>
            <p className="font-mono text-[11px] text-muted">Try another day.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  eventType,
  slot,
  bookerTz,
  ownerName,
}: {
  eventType: EventType;
  slot: Slot;
  bookerTz: string;
  ownerName: string;
}) {
  return (
    <Panel tone="butter" shadow="sm" radius="md" padding={20}>
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">With {ownerName}</p>
      <p className="mt-1 text-lg font-bold">{eventType.label}</p>
      <div className="mt-3 space-y-1.5 text-sm">
        <p className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {fmtFullDate(slot.start, bookerTz || "UTC")}
        </p>
        <p className="flex items-center gap-2 font-mono tabular">
          <Clock className="h-4 w-4" />
          {fmtTime(slot.start, bookerTz || "UTC")} – {fmtTime(slot.end, bookerTz || "UTC")} ·{" "}
          {eventType.duration} min
        </p>
        {bookerTz && (
          <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
            <Globe className="h-3.5 w-3.5" /> {bookerTz.replace(/_/g, " ")}
          </p>
        )}
      </div>
    </Panel>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-[color:var(--clico-coral)]"> *</span>}
      </span>
      {children}
    </label>
  );
}
