import { config, isLive } from "@/lib/config";
import { json, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export function GET() {
  return json({
    ownerName: config.ownerName,
    timeZone: config.timeZone,
    eventTypes: config.eventTypes,
    availableWeekdays: Object.keys(config.weeklyHours).map(Number),
    minNoticeMinutes: config.minNoticeMinutes,
    maxAdvanceDays: config.maxAdvanceDays,
    mode: isLive() ? "live" : "demo",
  });
}
