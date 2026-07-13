# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timeline App: a full-stack app for tracking travels, visits, and locations with interactive maps and statistics. It's a polyglot monorepo with three runtime services plus an E2E test package:

- `backend/` — Node.js + Express 5 API (ESM, port 3000). Writes to MongoDB; owns all business logic and data mutation.
- `statistics-service/` — Java 21 + Quarkus 3 microservice (port 8081). Read-only MongoDB access; computes travel/visit stats and map geometry.
- `frontend-v2/` — Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (port 3002).
- `e2e/` — Playwright test suite against the running stack.

The stats service is being incrementally strangler-figged out of the Node backend (see `docs/ADR.md` and `.agent/IMPLEMENTATION_NOTES.md`): Quarkus only reads from MongoDB, Node.js still owns all writes. Frontend calls the stats service first with fallback to the monolith where applicable.

## Commands

### Full stack (Docker)
```bash
docker compose up --build -d
```
**Always pass `--build` after touching `frontend-v2/` or `backend/` source** — Next.js/node_modules are cached in the container and stale code will silently keep running otherwise.

**For frontend-only changes, prefer `cd frontend-v2 && npm run dev` over rebuilding the Docker container** when running Playwright MCP verification — it's much faster than a full `docker compose up --build`. Only rebuild the container when the change needs the full stack (backend/stats-service interaction) or before a final end-to-end check.

### Backend (Node/Express)
```bash
cd backend
npm install
npm start          # node --watch index.js
npm test           # node --test (runs backend/test/*.test.js)
node --test backend/test/travelRules.test.js   # run a single test file
```

### Frontend (Next.js)
```bash
cd frontend-v2
npm install
npm run dev         # Turbopack dev server, http://localhost:3002
npm run build
npm run lint         # MANDATORY before finishing any frontend task
```

### Statistics service (Quarkus)
```bash
cd statistics-service
./mvnw quarkus:dev          # hot-reload dev mode, http://localhost:8081
./mvnw clean package        # build
./mvnw test                 # run tests
```

### E2E (Playwright)
```bash
cd e2e
npm install
npm test          # playwright test
npm run test:ui   # interactive UI mode
npm run codegen   # record new tests
```

## Architecture

### Backend (`backend/`)
Layered Express app, ESM modules throughout:
- `routes/` → `controller/` → `services/` → `models/` (Mongoose schemas)
- `domain/` — pure business rules independent of persistence (`travelRules.js`) and value objects (`domain/value-objects/Distance.js`, `Money.js`)
- `events/` — a small in-process EventEmitter (`travelEvents.js`) with `publisher.js`/`subscriber.js`; e.g. updating a Travel emits `TRAVEL_UPDATED`, which `subscriber.js` uses to keep the related Visit in sync (`visitService.updateVisitFromTravel`). Check `events/subscriber.js` when tracing side effects that aren't obvious from the controller alone.
- `error/businessRuleError.js` — custom error type for domain rule violations
- Entities: Travel, Visit, Location, Cross, User, KnownCenter — see `backend/API_DOCUMENTATION.md` for the full endpoint reference (query params, request/response shapes) before adding or changing routes.
- Tests live in `backend/test/*.test.js` using the built-in `node:test` runner (no Jest/Mocha).

### Statistics service (`statistics-service/`)
Quarkus 3, package `com.timeline.stats`, MongoDB via Panache (read-only), reactive (Mutiny `Uni`/`Multi`). Consolidated endpoint `POST /api/v2/stats/travels/from-ids` returns totals + map geometry (center of gravity, zoom viewpoint) in one round trip so the frontend avoids duplicate Mongo queries and keeps the map/stat totals atomically consistent — see `docs/ADR.md` ADR 001 before changing this contract.

### Frontend (`frontend-v2/`)
Next.js App Router, i18n via `next-intl` (locales `en`/`es`, default `en`; routing config in `src/i18n/routing.ts`). **All routes live under `src/app/[locale]/`** — there is no `src/pages/`; don't look for one.

Page pattern: `src/app/[locale]/<route>/page.tsx` (Server Component entry) pairs with a Client Component in `src/components/pages/<Route>PageClient.tsx` for interactivity.

- `src/services/` — API client wrappers per entity (`TravelService.ts`, `VisitService.ts`, etc.), calling the Node backend and/or the stats service.
- `src/hooks/`, `src/contexts/` (`DateRangeContext`, `UserContext`), `src/providers/` (incl. `QueryProvider.tsx`) — data/state layer.
- `src/components/buttons/` — icon/action buttons are extracted here as their own components (e.g. `BarViewBtn`), sharing a `ButtonProps` type from `src/types/props.d.ts`. Follow this pattern for new action buttons rather than inlining them in pages.
- Server state: **TanStack Query** is standard for everything server-derived. Global `staleTime` is 60s (`QueryProvider.tsx`) — don't override locally without a specific reason. Use consistent, sorted-ID `queryKey`s so identical requests (e.g. map + table both needing the same travel stats) dedupe automatically instead of double-fetching.
- Styling: Tailwind CSS v4 + shadcn/ui (`Input`, `Button`, `Card`, `Table`, etc.), mobile-first.
- Maps: Leaflet / react-leaflet. Charts: Recharts.

Hook/component conventions:
- Declare all hooks and state at the top of a component/custom hook, before handlers or other logic.
- Prefer triggering side effects (e.g. auto-filling a distance when a destination changes) inside event handlers via imperative calls (`queryClient.fetchQuery`) rather than `useEffect`, so users can override auto-filled values without the effect fighting back.
- Check readiness flags (e.g. `areStatsReady`) before rendering components that depend on backend-calculated stats, to avoid inconsistent UI states.

ESLint enforces `import/order` (type → builtin → external → internal → parent → sibling → index, with blank lines between groups) and `consistent-type-imports`. Run `npm run lint` after any frontend change — it's required for CI (GitHub Actions) to pass.

## Cross-cutting rules

- **Software Design Documents**: non-trivial features or architectural changes should get a doc in `docs/sdd/` (copy `template.md`) before implementation.
- **CHANGELOG.md is manually curated** — never edit it directly; the team fills it in by PR number/subject. The one exception is the `changelog-cod` skill, which computes the PR size using the same formula as `.github/workflows/pr-compliance.yml` and appends the resulting `CODn-XXX` entry — only invoke it explicitly (e.g. via `/changelog-cod`), never edit the file ad hoc.
- **MongoDB is shared** across backend (writes, via Mongoose) and statistics-service (reads only, via Panache) — Mongoose schemas are app-level validation only and don't constrain what Quarkus can read. Don't add write paths to the stats service.
- Architectural decisions belong in `docs/ADR.md`; check it before changing the stats/map consolidation contract.
- **Travel/Visit timestamps are not true UTC instants.** `startTime`/`endTime` (and similar date fields) are written straight through with no timezone conversion anywhere in the backend write path (`controller/travelController.js`) — the client bakes Argentina wall-clock digits into the ISO string before sending it (see `frontend-v2/src/utils/index.ts`'s `getArgentineCurrentTime`/`convertToArgentineTime`, which does `date.setHours(date.getHours() - 3)` before serializing). So a stored value like `2026-07-04T11:55:00.000Z` means "11:55 Argentina time," not 11:55 UTC. Any consumer (frontend, statistics-service, external clients like the Android app) must read these fields as literal Argentina wall-clock digits — format/display in UTC (offset 0), not with a real `America/Argentina/Buenos_Aires` (UTC-3) conversion, or the result will be off by 3 hours.
