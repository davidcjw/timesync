import type { NextRequest } from "next/server";
import { config, getEventType } from "@/lib/config";
import { computeSlots } from "@/lib/availability";
import { book, fetchBusy } from "@/lib/provider";
import { toDateStr, zonedDateParts, zonedWallToUtc } from "@/lib/time";
import { json, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function OPTIONS() {
  return preflight();
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const { eventTypeId, start, name, email, notes } = body as Record<string, string>;

  const et = getEventType(eventTypeId);
  if (!et) return json({ error: "Unknown event type" }, { status: 400 });
  if (!start || !name?.trim() || !email?.trim()) {
    return json({ error: "Name, email and start time are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: "Please provide a valid email address" }, { status: 400 });
  }

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) {
    return json({ error: "Invalid start time" }, { status: 400 });
  }
  const endDate = new Date(startDate.getTime() + et.duration * 60_000);

  // Re-validate against live availability to prevent double-booking.
  const { y, mo, d } = zonedDateParts(config.timeZone, startDate);
  const dateStr = toDateStr(y, mo, d);
  const dayStart = zonedWallToUtc(y, mo, d, 0, 0, config.timeZone);
  const dayEnd = new Date(zonedWallToUtc(y, mo, d, 23, 59, config.timeZone).getTime() + 60_000);
  let busy;
  try {
    busy = await fetchBusy(dayStart.toISOString(), dayEnd.toISOString());
  } catch (err) {
    console.error("[timesync] fetchBusy failed", err);
    return json(
      { error: "Calendar is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
  const slots = computeSlots(dateStr, et.id, busy, new Date());
  const stillFree = slots.some((s) => new Date(s.start).getTime() === startDate.getTime());
  if (!stillFree) {
    return json({ error: "That time was just taken. Please pick another slot." }, { status: 409 });
  }

  try {
    const result = await book({
      summary: `${et.label} with ${name.trim()}`,
      description: [
        "Booked via Timesync.",
        "",
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        notes?.trim() ? `\nNotes: ${notes.trim()}` : "",
      ].join("\n"),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      attendeeEmail: email.trim(),
      attendeeName: name.trim(),
    });

    return json({
      ok: true,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      eventType: et,
      ...result,
    });
  } catch (err) {
    console.error("[timesync] booking failed", err);
    return json({ error: "Could not create the event. Please try again." }, { status: 500 });
  }
}
