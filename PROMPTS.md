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
<!-- ## Prompt 

```

``` -->