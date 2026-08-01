# SDD: `/api/v2/stats/dashboard` in statistics-service

## 🎯 Objective
The dashboard (`useDashQuery`) currently reads from Node (`GET /api/travels?statsOnly=true`), which computes `monthlyStats` (`km`, `zipcodes`, `kmByZipcode`), `topRoutes` and `home` — fields no other consumer of that endpoint needs. Per [ADR 001](../ADR.md), move this screen-shaped calculation to Quarkus as a dedicated `/dashboard` endpoint, reusing the totals/`placesVisited` core (`StatsService.calculateBasicStatsFromContext`) instead of duplicating it, rather than growing `TravelStatsDTO`/`from-ids` with fields the Travels page doesn't consume.

Out of scope: `records` (unused by the dashboard since #97; its loss under Travels filters is a separate, pre-existing issue).

## 🏗️ Proposed Architecture
`StatsService.calculateBasicStats(dateFrom, dateTo, userId)` already exists (via `findByDateRangeAndUser`) but is unwired to any REST endpoint. A new `DashboardService` builds on the same `StatsContextDTO`/`LocatedTravelDTO` context, reusing `calculateBasicStatsFromContext` for the shared totals, and layers on monthly bucketing + route-frequency ranking + home detection — ported from Node's `travelService.js`/`routeService.js`.

`Location` (Quarkus domain) is missing `name`, which Node's route/home logic keys on (Quarkus today only has `zipcode`). Adding it also lets `PlacesVisitedDTO` carry the same `data: { [zipcode]: { name, id } }` map Node already returns (used by the zipcode ticker and the top-places heatmap) — currently a gap in every Quarkus stats endpoint, not just the new one, so it's fixed once in the shared core.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `statistics-service` | Add `Location.name`. Extend `PlacesVisitedDTO` to include `data`. Add `DashboardStatsDTO`/`MonthlyStatDTO`/`TopRouteDTO`. Add `DashboardService` (monthly bucketing, route ranking). Port `calculateHome` onto `StatsService` (shared, not dashboard-specific — `TravelsPageClient`'s `backendHome` will need it later). New `GET /api/v2/stats/dashboard` on `StatsResource`. |
| `frontend` | `TravelService.getDashboardStats(dateFrom, dateTo, userId)` calling the new endpoint. `useDashQuery` switches both range queries to it instead of `TravelService.getAll(...).stats`. No component changes — response shape matches the existing `TravelStats` type consumed by `TravelDashboard`/`MonthlyCharts`/`TopPlacesByMonths`/`FrequentRoutes`/`ZipcodeTicker`. |
| `backend` | None — Node's `/api/travels` calculation is left as-is (still used by `records`/table stats); no write-path changes. |

## 🛠️ Implementation Details
- **Data Models**:
  - `Location.name: String` (mapped field, read-only, mirrors Node's `LocationSchema.name`).
  - `PlacesVisitedDTO` gains `data: Map<String, PlaceInfoDTO>` (`PlaceInfoDTO(String name, String id)`), built from the already-loaded `context.locations` — no extra query. Existing `PlacesVisitedDTO(Set<String>)` constructor stays for callers/tests that don't have locations on hand.
  - `DashboardStatsDTO extends TravelStatsDTO` adding `monthlyStats: Map<String, MonthlyStatDTO>` (key `YYYY-MM`), `topRoutes: List<TopRouteDTO>`, `home: String`.
  - `MonthlyStatDTO { km, minutes, count, zipcodes: List<String>, kmByZipcode: Map<String, Double> }` — mutable accumulator, same shape as Node's.
  - `TopRouteDTO { route: String, count: int }` — mutable (route string gets rewritten once `home` is known, same as Node).
- **Logic** (`DashboardService.calculateDashboardStats(dateFrom, dateTo, userId)`):
  1. `findByDateRangeAndUser` → `StatsContextDTO` (same as `StatsService.calculateBasicStats`).
  2. `baseStats = statsService.calculateBasicStatsFromContext(context)` for count/totals/averages/`placesVisited`.
  3. Iterate `context.locatedTravels` once: bucket into `monthlyStats[monthKey]` by `travel.date.substring(0, 7)` (`Travel.date` is already the UTC-literal `YYYY-MM-DD` string set by `Travel.enrich()` — see CLAUDE.md's note on Argentina wall-clock digits stored as literal UTC); accumulate km/minutes/count, zipcodes (dedup), and `kmByZipcode` credited to the **destination** only (matches Node's single-scalar-per-trip rule); count name-sorted route pairs (`origin.name ↔ destination.name`, `ROUTE_SEPARATOR = " ↔ "`).
  4. Top 5 routes by count → `StatsService.calculateHome(topRoutes)` (ported 1:1 from `routeService.js`: picks whichever endpoint of the top-2 routes appears in the most of the top-5) → rewrite each route string so `home` is always first.
- **API Endpoints**: `GET /api/v2/stats/dashboard?dateFrom=<ISO instant>&dateTo=<ISO instant>&userId=<int>` → `DashboardStatsDTO`. Query params (not a `POST` body) since, unlike `from-ids`/`map-config`, this is date-range-driven, not travel-ID-driven — mirrors `calculateBasicStats(Instant, Instant, Integer)`'s existing signature. `dateFrom`/`dateTo` parsed via `Instant.parse` (frontend already sends `.toISOString()`).
- **Frontend contract**: empty range still returns `{}`-shaped emptiness the frontend merges over `EMPTY_TRAVEL_STATS` — `monthlyStats: {}`, `topRoutes: []`, `home: null` for a zero-travel range (no special-casing needed since the loops simply don't run).

## ✅ Verification Plan
- [ ] Quarkus unit tests: `DashboardServiceTest` (monthly bucketing, `kmByZipcode` crediting, top-routes ordering, home tie-breaking — port cases from `backend/test/routeService.test.js` if present) and `StatsServiceTest` (`calculateHome`).
- [ ] `StatsResourceTest`: `GET /dashboard` REST-assured contract test (mocked `DashboardService`).
- [ ] Manual: dashboard page (`/dashboard` or wherever `TravelDashboard` mounts) shows identical `topRoutes`/`home`/monthly heatmap/ticker names before/after the switch, for both current and previous-year ranges.
- [ ] `npm run lint` clean; `docker compose up --build -d` boots the stack end-to-end.

## 📝 Notes & Risks
- **Duplicated calculation, not shared code, vs Node**: this ports Node's `topRoutes`/`home`/monthly logic to Java rather than extracting a shared library (no such thing across the Node/Java boundary) — same pattern as the rest of the strangler-fig migration (`calculateBasicStats` already duplicates Node's totals logic). Drift risk if one side changes without the other; low likelihood since Node's `records`-adjacent logic is frozen post-migration.
- **Several locations per zipcode**: Node's `LocationSchema` indexes `{ name, latitude }` unique, not `zipcode`, so many locations share one. Node resolved the displayed name by `Map.set` overwrite over travels sorted `startTime: -1`, i.e. *the oldest travel won* — an artifact of the sort order, not a decision. Quarkus can't reproduce that without sorting explicitly, and Mongo's return order for `context.locations` is unspecified, so `PlacesService.getPlaceInfoByZipcode` instead picks the **most visited** location of each zipcode (ties → oldest `ObjectId`). Deterministic, order-independent, and it shows the place you actually go to rather than a one-off stop.
- **No fallback to Node**: `useDashQuery` switches outright, consistent with how `useTravelStats`/`MapService` already call the stats service with no try/catch fallback (there is no real fallback pattern anywhere in the current codebase, despite CLAUDE.md describing the strangler fig that way).
