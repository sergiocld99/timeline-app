# SDD: Arbitrary date range on the Dashboard

## 🎯 Objective
The dashboard (`HomePageClient` → `useDashQuery`) is locked to a **rolling 11-month window** computed in `frontend-v2/src/hooks/useDashQuery.ts:24-59`, with `?offset=` month-paging as the only way to move the window. Several consumers (top-places-by-months heatmap, FrequentRoutes, zipcode ticker) would benefit from slicing an arbitrary window (e.g. "just last quarter", or a specific historical range) instead of always the trailing 11 months.

`statistics-service` already accepts arbitrary dates: `GET /api/v2/stats/dashboard?dateFrom=<ISO>&dateTo=<ISO>&userId=<n>` (see SDD `05-stats-dashboard-endpoint.md`). This SDD exposes that flexibility in the UI with **zero backend or Quarkus changes**.

## 🏗️ Proposed Architecture
Extend `useDashQuery` so an explicit range wins over the computed 11-month window, while keeping the current behavior as the default and `?offset=` month-paging working in the default view:

- New optional URL params on the Home route: `?from=<ISO>&to=<ISO>`. When both are present they define the "current" range verbatim.
- The **previous-period** range (used by the Year-over-Year overlay + comparisons) is derived automatically: each bound shifted exactly 1 year (`setFullYear(y - 1)`), matching the existing `prevFrom/prevTo` logic.
- UI: a compact range picker on the dashboard header (From/To date inputs, reusing the shadcn `Input`/date pattern already in the app), a "Reset" button that clears `from/to`, writing changes into the URL search params (`router.replace`) so the selection is shareable, consistent with how `offset` is URL-driven today.
- The YoY / monthly overlay only makes sense above a minimum window width: if the chosen range spans fewer than **2 distinct months**, hide the previous-year comparison components rather than render a 1-bucket overlay.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `frontend` | `useDashQuery` reads `from`/`to` next to `offset`; when set, `ranges.currentFrom/currentTo` = those values and `ranges.prevFrom/prevTo` = year-shifted, skipping the `addMonths(now, offset)` math. New `DashboardRangePicker` component in `HomePageClient` (header row, near the month-paging controls). `MonthlyCharts` / `TopPlacesByMonths`: hide YoY overlay when `monthlyStats` keys span < 2 months. Nothing else consumes a fixed-11-months invariant (bucketing is `YYYY-MM`-keyed on `TravelStats.monthlyStats`, see SDD 05). |
| `backend` | None. |
| `statistics-service` | None. |

## 🛠️ Implementation Details
- **Logic** **(`useDashQuery`)**:
  1. Parse `from`/`to` (ISO strings) before computing ranges; if both parse (`!isNaN(Date.parse(...))`) and `from <= to`, use them; otherwise fall back to today's `addMonths` path (offset still applies to the default view only).
  2. Validate sanity clamp: if `to - from` > 24 months, cap `to` (UI guide, non-blocking).
  3. Pass `currentUser` unchanged; the query keys (`["home_stats", from, to, user]`) already encode the dates so cache dedupe still works.
- **Data Models**: none (URL params only, `TravelStats` shape reused as-is).
- **API Endpoints**: none (values forwarded verbatim by `TravelService.getDashboardStats` → `GET /stats/dashboard`).
- **i18n**: new keys under `Dashboard` namespace for `fromLabel`, `toLabel`, `applyRange`, `resetRange`, `emptyRange` hint in `messages/{en,es}.json`.
- **UI placement**: the picker sits in the dashboard header next to the existing month navigation, `lg:`-gated like the rest of the dashboard chrome; on mobile it collapses to a button opening the two date inputs in a popover/sheet.

## ✅ Verification Plan
- [ ] Manual: navigate to `/` with `?from=<date>&to=<date>` → cards, heatmap and ticker reflect exactly that window; same range last year shown for YoY.
- [ ] Manual: 3-month range → YoY overlay appears; 1-month range → overlay hidden.
- [ ] Manual: Reset → returns to rolling 11-month default and `?from&to` removed from URL; `offset` still pages the default view.
- [ ] Shareable: copy URL with `from/to` and reload → same view.
- [ ] `npm run lint` clean; `docker compose up --build -d` boots.

## 📝 Notes & Risks
- **Timezone/literal-UTC quirk** (CLAUDE.md): dates from the picker must be serialized as Argentina wall-clock digits (`getArgentineCurrentTime`/`convertToArgentineTime` in `frontend-v2/src/utils/index.ts`, i.e. `setHours(hours-3)` before `.toISOString()`), the same way the Travels date-range selector already does — never a naive `new Date().toISOString()`, or ranges will be off by 3 hours.
- **Previous-period comparison semantics**: for arbitrary windows the "previous period" is the year-shifted twin, not a sibling 11-month window — this matches how the existing `prevFrom/prevTo` are built, so no new convention is introduced.
- **Frontend-only**: consistent with SDD 05's "no real fallback pattern" note — the dashboard already calls the stats service directly with no try/catch fallback; this design keeps that.