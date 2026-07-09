# SDD: Partido Support for Locations (Buenos Aires)

## 🎯 Objective
Enable association of a "Partido" (district) to locations with postal codes starting with "B" (Provincia de Buenos Aires). This allows for better grouping, filtering, and statistical analysis of locations without affecting travel visualization logic.

## 🏗️ Proposed Architecture
- Added a `partido` field to the Location model.
- Created a centralized list of 135 partidos of Buenos Aires.
- Implemented a dynamic sorting utility to prioritize most used partidos in selectors.
- Updated UI to show dynamic tabs based on the top 3 most common partidos.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `backend` | Updated `Location` model and `locationController` to persist the `partido` field. |
| `frontend` | Updated Types, added `BUENOS_AIRES_PARTIDOS` constants, and created `getSortedPartidos` utility. |
| `frontend-ui` | Updated `LocationForm`, `LocationTableContent`, and `LocationsPageClient` to support the new field and dynamic filtering. Created `BaseSelector` and `PartidoCell` components to encapsulate logic. |

## 🛠️ Implementation Details
- **Logic**: The top 3 partidos are calculated on the fly from the current locations list. They are used to render the main filter tabs and prioritized at the top of the selection dropdowns.
- **Data Models**: Added `partido: String` to the Location schema.
- **Utility**: `getSortedPartidos(locations)` generates a list with Top 3 first, then alphabetical rest.

## ✅ Verification Plan
- [x] Manual Check: Verified that Zipcodes starting with "B" show the Partido selector.
- [x] Manual Check: Verified Top 3 partidos appear as tabs and at the top of selectors.
- [x] Manual Check: Verified data correctly persists in the database after creation/edit.

## 📝 Notes & Risks
- The list of partidos is static for now. If municipalities change, `partidos.ts` needs updating.
- The "Top 3" logic relies on client-side calculation; for very large datasets, this might need optimization or backend support.
