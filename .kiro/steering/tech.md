---
inclusion: always
---

# Tech Stack

## Stack
- **React 18 + TypeScript**, built with **Vite**
- **Plain CSS** with CSS custom properties (variables) for the theme colours; one global theme file plus component-scoped CSS modules
- **localStorage** for saving courses (no backend, no database)
- **Vitest** + **React Testing Library** for tests
- **Vercel** for hosting (static build, free tier)

## Rules
- TypeScript `strict` mode. No `any` unless there's a comment explaining why.
- All grade math lives in pure functions in `src/lib/`. These have **no React imports** and **must have unit tests**, including edge cases:
  - weights not summing to 100
  - a category with no items
  - no remaining work
  - a target already guaranteed (Safe)
  - a target impossible (Doomed)
  - scores above the max (extra credit)
- Percentages are stored as numbers 0–100, not 0–1.
- Round only when displaying (1 decimal place), never in calculations.
- Function components and hooks only. No class components.
- No extra runtime dependencies without a clear reason. Prefer small, built-in solutions (for example, `Intl.DateTimeFormat` rather than a date library).
- Keep the app accessible: semantic HTML, labelled inputs, keyboard navigable, WCAG AA colour contrast.
- Never write files with PowerShell Set-Content/Out-File; use the file-write tool so files are UTF-8 without BOM.

## Commands
- `npm install`: install dependencies
- `npm run dev`: start the local dev server
- `npm run build`: production build
- `npm run test`: run Vitest once (use `vitest --run`, not watch mode)
- `npm run lint`: lint the code

## Persistence
- One localStorage key: `deadline-reaper:v1`
- Validate data on load. If it's missing or corrupt, start fresh instead of crashing.
- Include a `version` field in the saved data so the format can change later.