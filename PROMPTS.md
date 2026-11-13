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


## Prompt 3 — City search with autocomplete

```
Build the CitySearch component with autocomplete using geoDbService.

Requirements:
- Debounce 300ms after user stops typing, minimum 2 characters before searching
- Cancel the previous request when a new one starts (no race conditions — old results must never overwrite new ones)
- Dropdown shows city, region, country with a flag or country code
- Full keyboard support: arrow up/down, Enter to select, Escape to close. Use proper ARIA combobox roles.
- States shown inside the dropdown: loading (small spinner), no results ("No cities match 'xyz' — check the spelling or try a bigger nearby city"), error with a Retry button, rate limit ("Too many searches, wait a second")
- Validation on BLUR, not only submit: if the field is empty show "Enter a city name", if they typed text but didn't pick a suggestion show "Pick a city from the list so we get the right location"
- Inline error under the input, red border, aria-describedby linked to the error
- When a city is selected, call onSelect(city) prop

Make it look clean — I'll do a full design pass later but don't make it ugly.
```


## Prompt 4 - Weather display

```
1st prompt
Now build the weather display. When a city is selected from CitySearch, fetch weather

2nd prompt good look

show:

1. CurrentWeather card: city name, big temperature, condition text + icon, feels like, humidity, wind speed (with direction if available), and "Updated X min ago"
2. Forecast: 5 day cards — day name (Today, Tue, Wed...), icon, max/min temp
3. A useWeather(city) hook that handles loading, error, data, and refetch

States:
- Loading: skeleton placeholders with the same shape as the real cards (no layout shift), not just a spinner
- Error: card that explains what failed based on ApiError kind + Retry button. Example for network: "Couldn't reach the weather service. Check your internet connection and try again."
- Empty state (no city selected yet): friendly first-time screen asking to search a city, maybe with a few quick-pick cities like Karachi, London, Dubai, New York
- If the data came from the Open-Meteo fallback, show a small subtle note "Data from backup source"

3rd prompt 

Save the last selected city in localStorage so it loads again on refresh.

4th prompt:

When I select a city from the dropdown, the input keeps the selected city name inside it and stays focused. Change it so that once a city is selected, the search input clears out completely and blurs, ready for the next search. Just make sure clearing it after a valid selection doesn't trigger the "Enter a city name" blur validation error.

```

## Prompt 5 - Design Improment

```
Now let's do a proper design pass. Right now it looks generic. I want it to feel like a polished consumer product, calm, clean, confident, good typography hierarchy, not a FYP Type project.

Font: Inter (or a similar clean font)
Subtle background that changes slightly based on weather condition (clear/cloudy/rain/snow/night) — subtle, not cheesy
Current weather card is the hero — big temperature, strong hierarchy
Layout:
  - 375px: single column, search on top, current weather, forecast as horizontal scroll row
  - 768px: current weather full width, forecast grid of 5
  - 1280px: sidebar on the left (search), main area on the right
NO horizontal page scroll at any width (forecast row scroll is fine on mobile only)
Subtle motion: fade/slide when data loads, respect prefers-reduced-motion
Visible focus states for keyboard users

After you're done, list anything that might break at 375px so I can check it.

```
## Prompt 6 - Favourites

```
1st prompt
Add Favourite Cities:

A star/heart button on the current weather card to add or remove the city.Maximum 5 favourites. If they try to add a 6th, don't fail silently show a message and disable 


2nd prompt
Favourites panel for quick access 
sidebar on desktop
horizontal chips on mobile 
Each shows city name + current temp


3rd prompt
Clicking a favourite loads its weather 


4th prompt
Removing a favourite must ask for confirmation use a small custom confirm dialog 


5th prompt
Persist in localStorage in a useFavourites hook
If localStorage is not available (private mode, blocked, or quota full), wrap all access in try/catch, keep favourites in memory for the session, and show a small notice "Favourites won't be saved after you close this tab"
No duplicates (compare by city id)
if Favourites are present dont show Quick picks

```

## Prompt 7 — PWA + offline

```
1 prompt
Make it an installable PWA using vite-plugin-pwa.

Web manifest: name "WeatherBoard", short_name, description, theme_color and background_color matching our design tokens, display: standalone, start_url, icons 192x192 and 512x512 (also a maskable one). Generate simple clean icons as PNG in public/


2 prompt
Service worker:
  - Precache the app shell (HTML, JS, CSS, fonts, icons)
  - Runtime cache for weather API responses with NetworkFirst strategy so the last viewed city's weather is available offline
  - Also save the last WeatherData to localStorage as a backup, so even if the SW cache misses we can show it


3 prompt
offline mode:
  - useOnlineStatus hook (navigator.onLine + online/offline events)
  - When offline show a banner at the top: "You're offline — showing saved weather for Karachi from 2:30 PM". Hide when back online and refetch automatically
  - Disable search when offline with a clear message why


4 prompt
Add an "Install app" button that uses the beforeinstallprompt event, only shown when installable


5 prompt
Tell me how to test above thinks.


```

## Prompt 8 - Daily notifications

```
prompt 1:

Add a daily morning weather reminder notification.

Using the best client-side approach:
1. Periodic Background Sync API (Chrome, installed PWA) — register a daily sync, in the service worker check if it's past the user's chosen time today and not yet notified, then fetch weather for the last city and show a notification like "Good morning! Karachi: 28°C, Sunny"
2. When the app is open, use a timer to fire at the chosen time
3. When the app opens and today's reminder was missed, show it once


prompt2:
UI flow:
- A "Daily reminder" settings section with a time picker (default 8:00 AM)
- BEFORE triggering the browser permission prompt, show our own explainer: why we want it, what they'll get, how often. Only request permission when they click "Enable reminders"
- If notifications are unsupported: show "Your browser doesn't support notifications" and hide the controls
- If permission is denied: show how to re-enable it in browser settings. Nothing else in the app should break
- Add a "Send test notification" button
- Save time + enabled state in localStorage, and also store it in IndexedDB so the service worker can read it

prompt3:
The daily reminder notification isn't firing at all neither when the scheduled time arrives nor when I click the "Send test notification" button. Even though reminders are enabled and permission is granted, clicking "Send test notification" does nothing.

Please debug and fix why notifications aren't triggering

```

<!-- 
## Prompt 

```

``` -->