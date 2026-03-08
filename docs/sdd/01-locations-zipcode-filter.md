# SDD: Zipcode Quick Filters for Locations

## 🎯 Objective
Add quick filter buttons in the Locations page to filter locations by their Zipcode prefix (B - Buenos Aires Provincia, C - Capital Federal, U - Uruguay). This complements the existing search functionality.

## 🏗️ Proposed Architecture
We will use a new state in `LocationsPageClient` to track the active prefix filter. This state will be used in the `useMemo` that filters the locations.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `LocationsPageClient` | Add state `selectedPrefix`. Add the filter buttons UI next to the search bar. Update filtering logic to include prefix filtering. |
| `LocationTable` | (No changes expected, it just receives the filtered list) |

## 🛠️ Implementation Details
- **Logic**: 
  - If a prefix is selected, only show locations where `zipcode` starts with that letter.
  - If no prefix is selected (or "All"), show all (subject to search term).
  - Clicking a prefix button toggles it (if already selected, it clears).
- **Data Models**: No changes.
- **API Endpoints**: No changes (filtering done client-side).

## ✅ Verification Plan
- [ ] Manual check: Click "B" and verify only B-zipcodes appear.
- [ ] Manual check: Click "C" and verify only C-zipcodes appear.
- [ ] Manual check: Click "U" and verify only U-zipcodes appear.
- [ ] Manual check: Combine with search term (e.g., Select "B" and search for "Lanus").
- [ ] Manual check: Verify clear filter works.
