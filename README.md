# Okapi Frontend (Vite)

SPA built with Vite, React, Mantine, React Router, TanStack Query, and Zustand.

## Scripts

- `npm run dev` — start Vite dev server.
- `npm run build` — production build.
- `npm run preview` — preview the production build.
- `npm test` — run Vitest.

## Routes

- Auth pages: `/login`, `/signup`.
- App shell under `/main/*` (dashboards, logs, spans, sources, profile, org, Oscar). Data/bootstrap lives in `src/app/main/layout.tsx` and uses the Zustand store for org, profile, and temp token state.

## Notes

- API calls are centralized in `src/lib/api.ts` and friends; components use TanStack Query + Zustand for data/state.
- Global providers and styles are wired in `src/main.tsx` (Mantine theme, notifications, QueryClient, router, sonner toasts).
