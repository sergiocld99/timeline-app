# SDD: Bus Lines Explorer

## 🎯 Objective
`Travel.line` is already stored for bus travels (optional `String`, numeric line ids in current data) but is only visible in the travels table/detail views. Add a dedicated page to explore which bus lines were ridden in the last year, ranked by rides with distance alongside, and let the user click a line to inspect the underlying travels.

## 🏗️ Proposed Architecture
The existing `GET /api/travels` response can include a `stats.byLine` aggregation when `includeByLine=true`. The aggregation lives in its own service function so generic consumers neither compute nor receive it. No new endpoint, query key, or database field is needed.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `frontend` | New `/lines` route + client page, ranked line list with rides/speed/duration/km sort selector, `line` filter in `useTravelFilter`, `DateRangeProvider initialDays={365}` (same as the location viewer), `includeByLine` flag on `useTravels`, new `Lines` i18n namespace and nav entry (`BusFront` icon). |
| `backend` | `calculateByLineStats()` returns the per-line ranking, `getAllTravels` adds it only when `includeByLine=true`, and accepts an optional `modeOfTransport` filter applied before stats are computed. |
| `database` | None. |

## 🛠️ Implementation Details
- **Logic**:
  - The client page wraps itself in `<DateRangeProvider initialDays={365}>`, matching the location viewer's one-year rolling window (start at day boundary through today at `20:59`). Explicit `?dateFrom=&dateTo=` URL params still take precedence.
  - `calculateByLineStats()` keeps only bus travels with a non-empty `line`, groups by line and totals rides, km and minutes, and derives `averageSpeed` as aggregate `totalKm / (totalMinutes / 60)` rounded to 2 decimals (`0` when duration is zero). Entries are sorted by rides descending, then total minutes descending, then numeric line ascending as a final deterministic tie-break. The controller calls it only for `includeByLine=true`, over the full range even when `limit` trims the travels payload.
  - The page calls `useTravels('duration', '', '', 'bus', true)`, so both travels and stats are bus-only and the opt-in ranking is included; no client-side mode filtering is needed. Each ranking row shows rides, `km - min` joined on the left and backend-computed km/h on the right. `sortLines()` reorders the already-aggregated rows by rides (default), speed, duration or km in the frontend; the card title follows the chosen metric, ties keep the backend order and the bar width scales to it. For lines with 6 or more rides only the bus icon and bar turn green; the active selection is still marked with a blue ring. When no lines exist, only the summary cards and ranking are replaced by the empty message — the travels table stays visible. Clicking a ranked line emits `{ type: "line", value }` through the shared `useTravelFilter`; the filtered travels feed the table. Clicking the selected line again (or the remove-filter button) clears the filter. Selecting a line scrolls to the table wrapper; clearing the filter (via the table button or by clicking the selected line again) scrolls back to the top.
- **Data Models**: `StatByLine` (including `averageSpeed`) and `FilteringByLine` in frontend `src/types/stats.d.ts`; `stats.byLine` added to the existing travels response when requested.
- **API Endpoints**: Reuses `GET/POST /api/travels` with the new optional `modeOfTransport` and `includeByLine` query params; `stats.byLine` comes from the same response, and `TravelTable` keeps using the existing per-travel stats call. No new endpoint.

## ✅ Verification Plan
- [x] Reuses the existing `initialDays` range behavior and its existing tests; no new date helper or provider prop.
- [x] Backend unit tests for `calculateByLineStats` (bus-only, empty lines ignored, ordering, totals, rounded speed, zero-duration guard) and for keeping it out of generic stats.
- [x] Unit tests for the new `line` branch in `useTravelFilter` and for `sortLines` (all four keys, stable ties, no mutation).
- [x] `npm test`, `npm run lint`, source typecheck.
- [ ] Manual check: navigate to `/lines` on desktop and mobile, confirm one-year default range, click a line to filter the table, clear the filter, verify nav entry/active state and i18n (en/es).

## 📝 Notes & Risks
- Data sparsity: in the local snapshot only 16/233 travels have a line and 10 distinct values exist. Users with no line data get an explicit empty state.
- `line` is unconstrained free text; the UI only exposes it for `modeOfTransport === "bus"`, so aggregation filters on bus travels only to avoid stray values on other modes.
- The travels table renders its own `DateRangeSelector`; the nested provider makes its CSV export and the page use the same one-year range. Changing the range refreshes both rankings and table via `useTravels()`.
- Backend changed, so a full-stack rebuild is required before any commit. Only the Node backend is touched; the Java stats service stays read-only and unchanged.
