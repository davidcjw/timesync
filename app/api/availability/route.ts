import type { NextRequest } from "next/server";
import { config } from "@/lib/config";
import { computeSlots } from "@/lib/availability";
import { fetchBusy } from "@/lib/provider";
import { parseDateStr, zonedWallToUtc } from "@/lib/time";
import { json, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const eventType = req.nextUrl.searchParams.get("eventType") ?? config.eventTypes[0].id;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: "Provide ?date=YYYY-MM-DD" }, { status: 400 });
  }

  const { y, mo, d } = parseDateStr(date);
  const dayStart = zonedWallToUtc(y, mo, d, 0, 0, config.timeZone);
  const dayEnd = new Date(zonedWallToUtc(y, mo, d, 23, 59, config.timeZone).getTime() + 60_000);

  const busy = await fetchBusy(dayStart.toISOString(), dayEnd.toISOString());
  const slots = computeSlots(date, eventType, busy, new Date());

  return json({ date, timeZone: config.timeZone, eventType, slots });
}
