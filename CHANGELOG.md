# CHANGELOG
## v0.11.0
- COD11-003: Location names on zipcode stats + click-to-filter on from/to pages + go-to-date action (#95) [344]
- COD11-005: predict endTime on Creator + limit/travelsOnly params on GET /travels (#96) [284]

## v0.10.0
- COD10-001: Add offset as dashboard query param (#74) [120]
- COD10-005: Add Travel Modals for Notes and Details (#77) [500]
- COD10-006: Populate origin and destination in records + new circle in map (#80) [202]
- COD10-007: Support query params for date range in travels (#82) [179]
- COD10-008: Add VIP styles to Travels Page when applies (#83) [103]
- COD10-009: Add purge button to date range selector (#84) [114]
- COD10-013: Add location filter and weekday-colored hourly chart to Visits bar stats (#89) [424]
- COD10-016: Add mode filter on pie stats and calendar view for Travels (#91) [399]
- COD10-017: Autocomplete travel destination from origin + time-of-day history (#92) [114]
- COD10-040: Category cards + generic subdivision registry (CABA barrios) on Locations (#93) [2367]

## v0.9.0
- COD9-003: Add Partido for Locations with B-Prefix zipcodes (#57) [388]
- COD9-004: Select Crosses in Travel Creator (#59) [140]
- COD9-012: Optimize Travel Dashboard analytics and modularize components (#60) [1236]
  - **Backend**: New `statsOnly` query parameter to reduce payload size.
  - **Frontend**: Modular Dashboard refactor; Year-over-Year Comparison chart; new `useDashQuery` hook.
- COD9-013: Remove totalPrice and averagePrice from Travel Stats (#60) [120]
- COD9-015: Show all zipcodes in ticker (#60) [229]
- COD9-016: Places highlighting by active zipcode on ticker (#62) [61]
- COD9-017: Collapse Travel Table Content (#65) [109]
- COD9-018: Refactor Schedule and Actions columns (#68) [203]

### Internationalization
- COD9-046: Implement i18n support for Dashboard and Travels pages (#64) [4693]
- COD9-066: Implement i18n support for rest of the pages (#67) [2264]

## v0.8.0 (2026-04-17)
- COD8-001: Add Purple Weight for Travels with Crosses (#39) [23]
- COD8-010: Add Travel and Visit Date Edition & Refactor travel.d.ts (#38) [1054]
- COD8-011: Backend - Calculate home and reorder route keys (#42) [26]
- COD8-012: Add Mixed as new mode of transport (#49) [18]
- COD8-013: Refactor buildChartConfig to dynamically label 'others' category (#51) [11] [IA: 4]
- COD8-014: Bump up Axios to 1.15.0 (#51) [192]
- COD8-021: New Java Map Service and Show Milestones (#52) [758]

## v0.7.0 (2026-03-20)
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
