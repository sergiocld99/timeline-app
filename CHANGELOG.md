# CHANGELOG

## v0.7.0
- COD7-001: Provide Visit Hour Parts from Backend to enable filtering (#26) [105]
- COD7-002: Add Search to Locations Page (#27) [64]
- COD7-003: Add Collision Control on Travel Creation (#29) [101]
- COD7-004: Allow bus line for bus type travels (#30) [101]
- COD7-008: Migrate Zoom y Map Center to Statistics Backend (#28) [469]
- COD7-012: Locations Responsive Page (#33) [664]
- COD7-013: Date Range Selector Validation (#34) [81]
- COD7-014: Zipcode quick filters and empty table fix (#35) [126]
- COD7-015: Show Unique Routes in Travel Footer (#36) [101]
- COD7-018: Home Dashboard & Clean Unused Hour Bars (#37) [349]

## v0.6.0 (2026-02-22)
- COD6-001: Pick Map to fill coordinates on create location + delete btn (#17) [148]
- COD6-002: Give Access from Other Devices in same network (#18) [125]
- COD6-003: New changelog + PR template (#20) [90]
- COD6-006: Responsive Visits + Hide Map/Stats on Mobile (#19) [366]
- COD6-012: Apply Filters by Hour and Weekday (#21) [628]
- COD6-016: Add TanStack Query for Locations and Crosses (#22) [456]
- COD6-017: Add Changelog & Milestone Compliance Workflow (#25)
- COD6-018: Reload Known Centers on Apply Filtering (#24) [317]

## v0.5.0 (2026-02-10)
- COD5-005: Migrate Hour Parts to backend + New Line Stats (#13) [537]
- COD5-006: Responsive Crosses UI (#14) [344]
- COD5-007: bump axios 1.13.5 (#15) [134]
- COD5-008: backend delete status from 200 to 204 (#16) [90]

## v0.4.0 (2026-02-08)
- COD4-032: Quarkus microservice for stats recalculations (#7) [3292]
- COD4-040: combine travel pages (#8) [802]
- COD4-052: major bump up to next 16 (#9) [1327]
- COD4-060: make header and creator responsive (#11) [1025]
- COD4-064: update pie stats with filtered zipcode (#12) [417]

## v0.3.0 (2026-01-16)
- COD3-204: E2E testing + travel management improvements (#6) [20482]
  - **Backend**: New `/find-last` and zipcode search endpoints; business logic validations; visit update events; API documentation.
  - **Frontend**: Travel distance autocomplete; "Same day" travel support; `useTravelCreator` hook; Refactored table components & common Selector; Stats logic moved to backend; Work-travel awareness (>60 days).
  - **General**: New Playwright E2E test suite; Docker build optimizations; Strict ESLint rules for import order and types; Coordinate and date utility fixes.

## v0.2.0 (2026-01-02)
- COD2-036: Add guest and multi-user management for travels and visits (#3) [3604]

- COD2-048: Travels Map, Filter by Location and Date Navigation (#4) [1680]
  - **Map**: Initial Leaflet integration with typed markers and auto-zoom based on distance.
  - **Navigation**: Added "Previous/Next week" buttons and quick date jumps (week/month) to the range selector.
  - **Interactivity**: Bar chart filtering (click to filter travels); custom generic Button and RemoveButton components.
  - **Logic**: Validations for travel duration (<24h); PR template addition; layout adjustments for travel creation.

- COD2-086: Location and Travel Edition (#5) [4373]
  - **Edition**: Full support for editing location coordinates and updating travel origins/destinations within the same zipcode.
  - **Sync**: Automated visit location updates when a related travel's origin changes.
  - **Features**: New "Arrivals" and "Departures" views for locations; advanced travel search by zipcode with speed/duration metrics.
  - **Performance**: SSR improvements by separating Client and Server components in the Header; optimized hooks by minimizing `use client` usage.

## v0.1.0 (2025-08-24)
- COD1-103: Core Foundation: Locations, Travels, Visits (#1) [10359]
  - **Core**: Initial setup with Node.js/Express backend and React/Vite frontend.
  - **Database**: MongoDB integration with schemas for Locations, Travels, and Visits.
  - **Backend**: REST API with controllers and services; visit calculation and weight logic.
  - **Frontend**: TypeScript migration; dedicated forms and tables for all models; service-based communication.
  - **Infrastructure**: Docker & Docker Compose setup for localized development.

- COD1-114: Travel Action Buttons & Toast Notifications (#2) [1418]
  - **Backend**: Middleware for visit persistence; new update and delete endpoints.
  - **UI/UX**: Replaced alerts with a modern toast system; added transport mode emojis to the table.
  - **Components**: Refactored table logic and date range selectors into dedicated reusable components.
  - **Features**: Added date range filtering for travels/visits and delete actions for travels.
  - **Fixes**: Corrected 00:00h date handling in travel forms.
