import { google } from "googleapis";
import { config } from "./config";
import type { Interval } from "./availability";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

function client(redirectUri?: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri ?? process.env.GOOGLE_REDIRECT_URI,
  );
}

export function authUrl(redirectUri: string): string {
  return client(redirectUri).generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // force a refresh_token every time
    scope: SCOPES,
  });
}

export async function exchangeCode(code: string, redirectUri: string) {
  const { tokens } = await client(redirectUri).getToken(code);
  return tokens;
}

function calendar() {
  const c = client();
  c.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: "v3", auth: c });
}

export async function getBusy(timeMin: string, timeMax: string): Promise<Interval[]> {
  const res = await calendar().freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: config.timeZone,
      items: [{ id: "primary" }],
    },
  });
  const busy = res.data.calendars?.primary?.busy ?? [];
  return busy
    .filter((b): b is { start: string; end: string } => Boolean(b.start && b.end))
    .map((b) => ({ start: b.start, end: b.end }));
}

export type CreateEventArgs = {
  summary: string;
  description: string;
  start: string; // ISO
  end: string; // ISO
  attendeeEmail: string;
  attendeeName: string;
};

export async function createEvent(args: CreateEventArgs) {
  const requestId = `timesync-${Date.now()}-${Math.round(Math.random() * 1e9).toString(36)}`;
  const res = await calendar().events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.start, timeZone: config.timeZone },
      end: { dateTime: args.end, timeZone: config.timeZone },
      attendees: [{ email: args.attendeeEmail, displayName: args.attendeeName }],
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });
  const ev = res.data;
  const meetLink =
    ev.hangoutLink ??
    ev.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ??
    null;
  return { eventId: ev.id ?? "", htmlLink: ev.htmlLink ?? null, meetLink };
}
