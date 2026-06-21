<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Notably (Next 16): `cookies()`, `headers()`, `params`, and the page `searchParams` prop are **async**. This app sidesteps that by using `req.nextUrl.searchParams` in route handlers and the `useSearchParams()` hook on the client.
<!-- END:nextjs-agent-rules -->

# Timesync — agent notes

Calendly-style booking widget for one owner's Google Calendar. Standalone booking page **and** an
embeddable modal. No database — Google Calendar is the source of truth.

## Architecture

- **`lib/config.ts`** — non-secret availability rules (weekly hours, event types, timezone, notice
  windows). `isLive()` flips the app between live Google and demo mode based on env presence.
- **`lib/time.ts`** — timezone math via `Intl` only (no deps). `zonedWallToUtc` converts owner-local
  wall times to UTC; DST-aware via offset refinement.
- **`lib/availability.ts`** — `computeSlots(date, eventType, busy, now)`: pure slot generator. Takes
  busy intervals, applies working hours, min-notice, and buffer.
- **`lib/provider.ts`** — picks `lib/google.ts` (real free/busy + event insert) when `isLive()`,
  else deterministic mock busy blocks. **All calendar access goes through here.**
- **`lib/google.ts`** — `googleapis` OAuth + `freebusy.query` + `events.insert` (with Meet link).
- **`lib/clientHooks.ts`** — `useOrigin` / `useBookerTimeZone` via `useSyncExternalStore`
  (SSR-safe, and avoids the `set-state-in-effect` lint rule).

## Routes

- `app/api/config` · `app/api/availability` · `app/api/book` — JSON + CORS.
- `app/api/auth/google` + `/callback` — one-time owner OAuth → refresh token.
- `app/book` — `BookClient` reads `?embed=1` etc.; `components/BookingWidget.tsx` is the whole flow.
- `app/page.tsx` → `components/Landing.tsx`; `app/embed-demo` — embed demo + `onBooked` toast.
- `public/embed.js` — the widget loader (`Timesync.open`, `[data-timesync]` binding, postMessage).

## Design system (clico-ds)

- The UI uses **clico-ds** (neo-brutalist: cream paper, 2px ink borders + hard offset shadows, pill
  CTAs, lime accent, Instrument Sans/Serif + JetBrains Mono). Installed as a `file:` dep; `.npmrc`
  has `install-links=true` so Turbopack can resolve it (a bare symlink fails to resolve).
- `app/layout.tsx` imports `clico-ds/styles.css` first, then `globals.css`. Components import
  `Button/Panel/Badge/BrowserFrame/FeatureCard/DisplayHeading/SerifAccent/WindowDots` from `clico-ds`.
- **Cascade-layer gotcha:** clico-ds rules are unlayered and beat Tailwind v4 utilities (which live in
  `@layer utilities`). To override a DS component's own properties (display/padding/font-size/max-width)
  use a `!` important utility, or use a plain element instead of the DS component. Adding margins/width/
  height (no competing DS rule) works normally.
- Accent = `--clico-lime`; the embed `color` option retints it by setting `--clico-lime` on the widget root.

## Conventions

- Embed ⇄ host communication is `window.postMessage`: `timesync:booked`, `timesync:close`.
- `/book` sets `Content-Security-Policy: frame-ancestors *` (see `next.config.ts`) so any app can iframe it.

## Workflow

- `npm run build` (type-checks) and `npm run lint` must both pass before considering work done.
- Verify booking math against `/api/availability` and the flow in `/book` after any change to
  `lib/availability.ts`, `lib/time.ts`, or `lib/config.ts`.
- Keep README.md and this file in sync with any feature/config change.
