# SDD: Generic Subdivision Registry (CABA Barrios)

## 🎯 Objective
Add a "Barrio" subdivision for Ciudad de Buenos Aires locations (zipcode prefix `C`), mirroring the existing "Partido" subdivision for the province (prefix `B`) introduced in [03-partido-support-locations.md](./03-partido-support-locations.md).

Instead of hardcoding a second `if zipcode startsWith 'C'` branch (and a third, fourth… later), generalize the mechanism into a **config-driven subdivision registry** keyed on the zipcode prefix, so future subdivision types (e.g. Uruguay departamentos, prefix `U`) are a one-line addition with zero backend/schema/stats-service changes.

## 🏗️ Proposed Architecture
The `partido` mechanism today is a generic "subdivision name" (a plain `String` on `Location`, set manually via a selector gated on `zipcode.startsWith('B')`, then counted/filtered). We keep the storage and generalize the selection/labeling:

- **Keep the physical field `partido`** as the single, generic subdivision holder for every jurisdiction. No data migration (chosen over renaming to `subdivision` to avoid a `$rename` over shared production data — see Notes).
- Introduce a **subdivision registry**: `prefix → { labelKey, options }`. All UI gating, labeling and filtering read from the registry instead of hardcoding `'B'`.
- Add `CABA_BARRIOS` (the 48 official barrios) as the `C` entry's options.

### Component Changes
| Component | Description of Changes |
| :--- | :--- |
| `backend` | **None.** `Location.partido` already stores/persists a free `String`; controller passes it through. |
| `statistics-service` | **None.** Does not reference `partido`. |
| `frontend (data)` | Add `CABA_BARRIOS` constant. Add `constants/subdivisions.ts` registry + `getSubdivisionConfig(zipcode)`. Generalize `getSortedPartidos` → `getSortedSubdivisions(locations, prefix)`. |
| `frontend (ui)` | `LocationForm` and `PartidoCell` read the registry (show selector + label for any configured prefix, not just `B`). `LocationsPageClient` sources its per-subdivision quick filters from the registry; card sub-filter works for `C` too. Column header label becomes contextual/generic. |

## 🛠️ Implementation Details
- **Registry**:
  ```ts
  type SubdivisionConfig = { prefix: string; labelKey: string; options: string[] };
  export const SUBDIVISIONS: SubdivisionConfig[] = [
    { prefix: 'B', labelKey: 'partido', options: BUENOS_AIRES_PARTIDOS },
    { prefix: 'C', labelKey: 'barrio',  options: CABA_BARRIOS },
  ];
  export const getSubdivisionConfig = (zipcode?: string) =>
    SUBDIVISIONS.find(s => zipcode?.toUpperCase().startsWith(s.prefix));
  ```
- **Selector gating**: replace `zipcode.toUpperCase().startsWith('B')` in `LocationForm`/`PartidoCell` with `getSubdivisionConfig(zipcode)`; use `cfg.options` for the dropdown and `cfg.labelKey` for the label.
- **Sorting util**: `getSortedSubdivisions(locations, prefix)` counts only locations whose zipcode matches `prefix`, returns Top 3 + alphabetical rest (same shape as today).
- **Data Models**: unchanged (`partido: String`).
- **i18n**: add `Locations.tableHeaders.barrio` / field label `barrio` (en/es). Consider a generic column header (e.g. "Zona") since one column now holds mixed subdivision types.

## ✅ Verification Plan
- [ ] Manual: zipcode starting with `C` shows a **Barrio** selector (options = CABA_BARRIOS) in both the create form and inline table edit.
- [ ] Manual: zipcode `B` still shows the **Partido** selector unchanged (no regression).
- [ ] Manual: selecting the CABA card + a barrio quick-filter narrows the table correctly; value persists after save.
- [ ] `npm run lint` clean; `docker compose up --build -d` boots the stack.

## 📝 Notes & Risks
- **Field naming wart**: the physical field stays `partido` while holding barrios/departamentos. Accepted trade-off to avoid a migration on shared data; mitigated by contextual labels. A future rename to `subdivision` would need a one-time Mongo `$rename` + ~10 file touch.
- **Static lists**: `CABA_BARRIOS` is static like `BUENOS_AIRES_PARTIDOS`; needs manual updates if official barrios change.
- **Backfill**: existing CABA locations have no barrio and will show "-" until edited — same rollout behavior as partidos.
- **Top-N is client-side** (inherited from the partido design); fine at current data scale.
