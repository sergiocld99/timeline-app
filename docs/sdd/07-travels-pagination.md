# SDD: Client-side pagination for the Travels table

## 🎯 Objective
The Travels table currently renders **every** travel in the active date range at once. `useTravels` (`frontend-v2/src/hooks/useTravels.tsx`) fetches the full range via `TravelService.getAll` with no `limit`, and `TravelTable`/`TravelListContent` (mobile) render all rows. For large ranges (a full year can be 1000+ trips) that means a heavy DOM and a sluggish page. This design adds **client-side** pagination to the travels table so only a bounded page of rows is rendered at a time.

Deliberately out of scope: server-side pagination. The backend already accepts `limit` (`travelController.js:39`), but the dataset here is one user's personal travels — comfortably manageable client-side. Server-side paging is noted in §Risks as the future path if data grows past a few thousand rows.

## 🏗️ Proposed Architecture
Pagination lives entirely on the **filtered** array — the output of `useTravelFilter(travels)` — so it composes *after* date-range, cross, origin/destination and row-object filters. That ordering is the key constraint: pagination must not change what the map, charts or `TravelStatsSummary` see; all of those keep consuming the full `filteredTravels` array.

A new hook `usePagination<T>(items: T[], pageSize = 50)` returns `{ page, pageSize, totalPages, pageItems, goToPage, next, prev }`, resetting `page` to 1 whenever the input array identity/length changes. `TravelsPageClient` (or `TravelTable` itself) uses it to slice `filteredTravels` for the table only.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `frontend` | New `src/hooks/usePagination.ts`. New `TravelTablePagination` footer component (page indicator + Prev/Next + `N–M of K`), rendered under the table on desktop and under `TravelListContent` on mobile. `TravelTable`/`TravelListContent` receive `pageItems` instead of the full `filteredTravels` array. `TravelStatsSummary`, `TravelMap` and the four chart views keep receiving `filteredTravels` **unsliced** — zero change there. |
| `backend` | None. |
| `statistics-service` | None. |

## 🛠️ Implementation Details
- **Logic**: `usePagination` subscribes to `items.length`; any change (refetch, filter applied/removed, delete in `TravelsPageClient`) snaps back to the first page. Page size 50 desktop, configurable constant. If the current page index falls beyond `totalPages` after a shrink, clamp it.
- **Data Models**: none (no new types; `pageItems: T[]`, `page: number`).
- **API Endpoints**: none.
- **i18n**: new `Actions.prevPage`/`nextPage`/`pageOf` (or similar) keys in `messages/{en,es}.json` for the pagination labels; tally `of` label like `"1–50 of 320"`.
- **Mobile**: `TravelListContent` gets the same footer — one shared component reused on both breakpoints.

## ✅ Verification Plan
- [ ] Unit: `usePagination` reset/clamp behavior (plain TS test, consistent with backend `node:test` style but as a frontend util under `frontend-v2` — check where FE unit tests live first; if none, cover via manual check).
- [ ] Manual: range of 1000+ travels (or lower page size to simulate) — map/charts/summary still show full-range numbers while table shows only one page.
- [ ] Manual: apply a row filter → pagination resets to page 1 and `K` reflects the filtered count; delete the last row of a page → clamps back.
- [ ] Mobile viewport: footer renders inside the card list; no overflow.
- [ ] `npm run lint` clean; `docker compose up --build -d` boots.

## 📝 Notes & Risks
- **Stats integrity**: `useTravels` refetch keeps computing backend `stats` over the whole range regardless of any `limit` sent (`travelController.js:34`), but this design sends **no** `limit` at all — the backend contract is untouched, so there is zero risk of stats drifting from the table.
- **future**: when a single user's dataset grows to the point the full fetch is heavy (memory/DOM, not correctness), move to server-side paging reusing the existing `limit` + add an `offset` + `total` to `GET /api/travels`, and switch `usePagination` to drive the query params. The `usePagination` hook interface (page/totalPages/pageItems) is designed to absorb that switch unchanged.
- **href conflict**: `TravelTable` already has inline edit/delete that re-fetches the list; pagination just indexes into the slice, so edits that change sorting/order of the *current* page may shift rows — acceptable for now, noted as a known quirk (same as today's client-side sort behavior).