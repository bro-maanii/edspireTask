# WeatherBoard

A responsive, installable weather dashboard PWA — search any city, track up to 5 favourites, and get a daily weather reminder notification. Client-side only, no backend.

**Live demo:** _add deployed URL here_

## Features

- City search with debounced autocomplete, keyboard navigation, and full ARIA combobox support
- Current weather + 5-day forecast, with an automatic fallback weather source
- Up to 5 favourite cities, persisted locally, with a confirm-to-remove dialog
- Quick-pick cities for first-time use
- Installable PWA with offline support (cached app shell + last-viewed city's weather)
- Offline banner that shows saved weather and re-fetches automatically once back online
- Daily weather reminder notifications (in-app timer, plus best-effort background sync when installed)
- Dark / Light / System theme, with no flash of the wrong theme on load
- °C / °F unit toggle, converted client-side with no refetch
- Animated weather icons that respect `prefers-reduced-motion`
- Responsive from 375px to 1280px+, no horizontal scroll, 44×44px touch targets throughout

## Tech stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript (strict mode, no `any`)
- Plain CSS with custom-property design tokens — no Tailwind, no UI library
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (`injectManifest` mode) + [Workbox](https://developer.chrome.com/docs/workbox) for the service worker
- IndexedDB (via a small custom wrapper) for state the service worker needs to read
- ESLint with `typescript-eslint` and `eslint-plugin-react-hooks`

## Setup

```bash
git clone <repo-url>
cd weatherboard
npm install
cp .env.example .env
```

Add your API keys to `.env`:

| Variable | Where to get it |
|---|---|
| `VITE_OWM_API_KEY` | Sign up at [openweathermap.org/api](https://openweathermap.org/api) and grab a free API key |
| `VITE_GEODB_API_KEY` | Subscribe to the free tier of [GeoDB Cities on RapidAPI](https://rapidapi.com/wirefreethought/api/geodb-cities) and copy your `X-RapidAPI-Key` |

```bash
npm run dev       # start the dev server
npm run build     # production build (also generates the manifest + service worker)
npm run preview   # serve the production build locally — needed to test offline mode and installability
```

## Architecture decisions

**A normalized weather type + automatic fallback.** OpenWeatherMap and Open-Meteo return completely different shapes and condition-code systems. Every provider maps onto one shared `WeatherData` type and one shared condition vocabulary, so the UI never needs to know which source answered. If OWM fails with a rate limit, an auth error, or a network error, the app automatically retries with Open-Meteo, which needs no API key at all — a missing or exhausted OWM key degrades the app instead of breaking it.

**Debounce + `AbortController` on search.** The debounce (300ms) exists mainly to respect GeoDB's free-tier limit of 1 request/second, not just to reduce chattiness. `AbortController` solves a different problem debouncing alone doesn't: if a slower request from an earlier keystroke resolves *after* a newer one, it can't be allowed to overwrite the newer results. Every search (and weather fetch) cancels its predecessor before starting.

**Plain CSS with design tokens, no framework.** Full control over the visual design, and it's what makes the dark/light theme toggle essentially free: every component already reads `var(--color-bg)` etc. instead of a hardcoded value, so re-theming is a matter of redefining the tokens once rather than touching every component.

**Offline caching, two layers.** The service worker precaches the app shell (HTML/JS/CSS/icons) and runtime-caches weather API responses (`NetworkFirst`) and Google Fonts (`CacheFirst`). Separately, the last successfully fetched weather is also written to `localStorage` as a backup, read directly when the browser reports offline — so even a service worker cache miss still has somewhere to fall back to.

**Folder structure.**

```
src/
  components/   UI components (one .tsx + its own .css per component)
  hooks/        Reusable stateful logic — search, weather, favourites, theme, reminders...
  services/     API clients and persistence (REST calls, IndexedDB, localStorage caching)
  types/        Shared TypeScript domain types
  utils/        Small pure helpers — formatting, unit conversion, time math
  styles/       Global CSS and design tokens
  sw.ts         Custom service worker (injectManifest mode)
```

## APIs used

- **[OpenWeatherMap](https://openweathermap.org/api)** — `/weather` and `/forecast`, the primary source for current conditions and a 3-hourly forecast (grouped into daily summaries client-side).
- **[Open-Meteo](https://open-meteo.com)** — `/v1/forecast`, a no-key fallback for current + daily weather when OpenWeatherMap is rate-limited, unauthorized, or unreachable.
- **[GeoDB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities)** (via RapidAPI) — city name autocomplete with coordinates.

## Known limitations

**Daily reminders.** This app has no backend, so true Web Push — a server waking the browser even while it's fully closed — isn't possible here; what's implemented is the best available client-only approximation. While the app is open, a foreground timer fires the reminder at the chosen time, and a catch-up check fires it once if you open the app after missing today's time; this works in any browser that supports the Notifications API. The background path (Periodic Background Sync) only works in Chromium browsers (Chrome, Edge) and only once the app is installed as a PWA — and even then, Chrome decides the real schedule based on a site-engagement score and device conditions, so `minInterval` is a floor, not a promise, and a tick can simply be skipped if the device is off, offline, or the engagement bar isn't met. Firefox and Safari don't support it at all, so there the reminder only ever fires while the app is actually open.

To do this properly, I'd add a small server: the client subscribes via the Push API (`PushManager.subscribe`) using a VAPID key pair, sends that subscription (plus the chosen reminder time) to the server, and a cron job checks each saved subscription on a schedule and `POST`s a Web Push message to it at the right moment — delivered by the browser's own push service even if the app is closed or not installed. The server, not the client, would then own "whose turn is it to be notified," which is the piece a purely client-side app can never really solve.

**API keys are visible in the frontend bundle.** With no backend, the `VITE_*` environment variables are inlined into the client bundle at build time and are visible to anyone who inspects it. That's acceptable for a demo on free-tier keys, but in production I'd proxy requests through a serverless function that holds the real keys server-side, so the client only ever talks to my own endpoint.

**GeoDB's free tier is rate-limited to 1 request/second.** The app handles a 429 gracefully — a clear "too many searches" message instead of a generic failure — but doesn't proactively queue or throttle requests beyond the 300ms debounce, so unusually fast typing could still trip the limit in theory.

## AI tool used

Built with **Cursor**, using **Claude Sonnet 5**. Full prompt history: [PROMPTS.md](./PROMPTS.md)
