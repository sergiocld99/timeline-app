# SDD: Fix Headers Visibility in Empty Locations Table

## 🎯 Objective
Fix a bug where table headers were still visible when no locations matched the search/filter criteria, interfering with the "No results found" message and the design.

## 🏗️ Proposed Architecture
We will conditionalize the rendering of the table contents (`LocationTableContent` and `LocationListContent`) in `LocationTable.tsx` so they only appear if `locations.length > 0`.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `LocationTable` | Wrap the table body/header components in a conditional check for `locations.length > 0`. |

## 🛠️ Implementation Details
- **Logic**: Wrap the `div` containers for desktop and mobile table versions with `{locations.length > 0 && (...)}`.

## ✅ Verification Plan
- [ ] **Manual Repro**: Type a non-existent search term and verify headers disappear.
- [ ] **Manual Check**: Clear search and verify headers reappear when data is present.
