## Prompt 1 — Project setup

```
I'm building "WeatherBoard", a responsive, installable weather dashboard PWA for a frontend technical challenge. Client-side only, no backend.

Set up the project:
- Vite + React + TypeScript 
- Plain CSS with CSS variables (no Tailwind, no UI library) - I want full control over the design
- Folder structure: src/components, src/hooks, src/services (API clients), src/utils, src/types, src/styles
- .env.example with VITE_OWM_API_KEY and VITE_GEODB_API_KEY, and make sure .env is in .gitignore
- Empty README.md and keep my PROMPTS.md as it is

Also create a rules file with these rules for the whole project:
- TypeScript strict, no `any`
- Every async call must have loading, error and empty states
- Error messages must say what failed and what the user can do — never "Something went wrong"
- All interactive elements min 44x44px touch target
- Mobile first CSS, breakpoints 768px and 1280px

Don't build any features yet. Just the setup, then tell me how to run it.
```


## Prompt 2 — API layer

```
Now build the API service layer in src/services. No UI yet.

1. geoDbService.ts — search cities by name prefix using GeoDB Cities API (RapidAPI). Return id, name, region, country, countryCode, lat, lon. Note: free tier allows only 1 request per second, so handle 429 properly.

2. weatherService.ts — get current weather + 5-day forecast for lat/lon.
- Primary: OpenWeatherMap (/weather and /forecast endpoints, units metric)
  - The OWM /forecast returns 3-hour steps, so group them by day and calculate daily min/max temp, and pick the midday condition as the day's icon
  - Fallback: Open-Meteo (no key). If OWM fails with 429, 401 or a network error, automatically try Open-Meteo
  - Both sources must return the SAME normalized type (WeatherData) so the UI doesn't care which one was used. Include a `source` field.
  - Map Open-Meteo weather codes to the same condition names/icons we use for OWM

3. A typed error class (ApiError) with kinds: 'network', 'rate_limit', 'not_found', 'auth', 'unknown', each with a user-friendly message and suggested action.

4. Use AbortController so old requests can be cancelled.

Put all types in src/types. Explain briefly how the fallback works when you're done.

```
