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


