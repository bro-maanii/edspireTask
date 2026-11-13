# WeatherBoard — Project Rules

These rules apply to all code in this repository, no exceptions.

1. **TypeScript strict, no `any`.** `strict` is on in tsconfig and
   `@typescript-eslint/no-explicit-any` is an ESLint error. If a type is
   genuinely unknown, use `unknown` and narrow it — never cast to `any`.
2. **Every async call must have loading, error, and empty states.** Any
   component or hook that fetches data (weather, geocoding, etc.) must
   render all three: a loading state while the request is in flight, an
   error state on failure, and an explicit empty state when the request
   succeeds but returns nothing to show.
3. **Error messages must say what failed and what the user can do.**
   Never show a generic "Something went wrong." State what failed (e.g.
   "Couldn't load weather for Lahore") and a next step (e.g. "Check your
   connection and try again," or "Try a different city").
4. **All interactive elements: minimum 44×44px touch target.** Buttons,
   links, inputs, and any other tappable/clickable element must have a
   hit area of at least 44×44px, even if the visible icon/label is smaller.
5. **Mobile-first CSS, with breakpoints at 768px and 1280px.** Write base
   styles for phones first, then layer on `@media (min-width: 768px)` for
   tablet and `@media (min-width: 1280px)` for desktop. Do not write
   desktop-first styles that get overridden downward.
