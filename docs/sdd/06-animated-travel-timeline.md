# SDD: Animated Travel Timeline

## ✅ Status: Implemented

Desktop-only animated replay of the user's travels, toggled via `AnimateTimelineBtn` in `TravelsPageClient`. While active, the static markers/circles view is swapped for the animated timeline view **inside the same Leaflet `MapContainer`** — this is the "replace static map entirely during animation" alternative from the original notes below, not a second map instance. The sections marked *(as built)* describe the final behavior, including the Cross Points optional enhancement.

## 🎯 Objective

Add an animated visualization to the Travels page that replays the user's travels chronologically on the map, inspired by [google-timeline-visualizer](https://github.com/mahlernim/google-timeline-visualizer). A marker moves along straight-line segments (origin → destination for each travel), with polylines appearing behind it, creating a "watch your travels come to life" experience. Desktop-only, no export/download — purely in-browser playback using Leaflet.

The existing data is sufficient: each `Travel` already carries populated `origin` and `destination` (`Location` with `latitude`/`longitude`), `startTime` for ordering, `modeOfTransport`, `distance`, and `duration`. No backend changes needed.

## 🏗️ Architecture (as built)

| File | Role |
| :--- | :--- |
| `components/TravelMap.tsx` | Owns the `isAnimating` toggle. Renders the classic view (+ `ChangeMapView`) or `<AnimatedMap>` inside the same `MapContainer`, passing the viewpoint `zoom`. |
| `components/map/AnimatedMap.tsx` | Composition root: `CameraFollow` + `PolylineLayer` + pulsing `Marker`. |
| `components/map/useSegments.tsx` | Builds flat `AnimationSegment[]` from `filteredTravels` (oldest→newest via `toReversed()`), expanding each travel into legs through its crosses. Feeds `useTick`. |
| `components/map/useTick.tsx` | `requestAnimationFrame` loop. Interpolates position across segments sequentially, tracks `AnimationState`, orchestrates pan→zoom→resume when the viewpoint zoom changes mid-animation. |
| `components/map/CameraFollow.tsx` | Sole camera owner while animating: throttled `panTo` follow + applies deferred zoom requests. |
| `components/map/PolylineLayer.tsx` | One completed `Polyline` per finished segment + progressively drawn active segment. |
| `components/buttons/AnimateTimelineBtn.tsx` | Toggle button in the stats-view button column. |
| `types/animated-timeline.d.ts` | `AnimationSegment`, `AnimationState`. |

Backend / statistics-service: unchanged, as planned.

## 🛠️ Implementation Details

### Data Flow

```
filteredTravels (Travel[])
  → buildSegments(): AnimationSegment[]   // one entry per leg, crosses expanded & ordered
    → [{ index, from: [lat,lng], to: [lat,lng], travel, durationMs, color }]
  → useTick (requestAnimationFrame loop)
    → animPosition, animState { currentSegmentIndex, segmentFraction }, pendingZoom
  → Leaflet render: PolylineLayer + Marker + CameraFollow (panTo / setZoom)
```

### AnimationSegment type (as built)

```ts
type AnimationSegment = {
  index: number
  from: [number, number]  // [lat, lng]
  to: [number, number]
  travel: Travel          // repeated across all legs of the same travel
  durationMs: number
  color: string           // WEIGHT_COLOR_MAP by travel weight, fallback light blue
}
```

### Animation Timing (as built)

Per travel: `totalMs = max(200, travel.duration * MS_PER_TRAVEL_MINUTE)` — proportional to travel **duration** (not `distanceKm` as originally drafted). When a travel is split into legs (crosses), `totalMs` is distributed across legs proportionally to each leg's length, keeping total playback time per travel unchanged. The loop restarts automatically from segment 0 when it finishes.

Within a segment, the marker interpolates linearly:

```
fraction = elapsed_in_segment / segment_duration
position = from + (to - from) * fraction
```

### Camera Behavior (as built)

- **Follow**: `CameraFollow` pans to the interpolated marker position with `map.panTo(..., { animate: true, duration: 0.3 })`, throttled to one call every ≥80ms.
- **Zoom sync**: the viewpoint zoom comes from `useViewPoint` (stats-service map config + strong-filter adjustment). If the date range changes mid-animation and the zoom differs, `useTick` runs: (1) snap `animPosition` to the new first segment's origin so the camera pans there (`PAN_SETTLE_DELAY_MS` = 350ms), (2) emit the deferred `pendingZoom` → `CameraFollow.setZoom` (`ZOOM_SETTLE_DELAY_MS` = 400ms settle), (3) restart the tick. Same-zoom rebuilds restart immediately.
- **Toggle-on**: `animPosition` initializes lazily to the first segment's origin — no detour through default coordinates.
- The initial zoom is still the `mapConfig` one; there are no manual user zoom controls during playback (`scrollWheelZoom` off).

### Visual Elements (as built)

| Element | Status |
| :--- | :--- |
| **Marker** (moving) | ✅ Pulsing CSS-animated icon (`pulsingIcon` in `map/icons.ts`). |
| **Completed polylines** | ✅ One `Polyline` per finished segment (per leg), colored by travel weight, 0.7 opacity. |
| **Active polyline** | ✅ Current segment drawn progressively up to the interpolated point. |
| **Travel info card** | ❌ Descoped. |
| **Progress bar** | ❌ Descoped (loop restarts automatically instead). |

### Controls (as built)

Only the on/off toggle (`AnimateTimelineBtn`) exists in `TravelsPageClient`. Play/pause, speed selector, scrubber and reset were descoped — playback is a continuous loop.

### Entry Point (as built)

`AnimateTimelineBtn` sits in the existing view-buttons column of the Travels page. Toggling it flips `isAnimating` on `TravelMap`, which swaps the map's children between static and animated views; layout is untouched.

### Cross Points (implemented ✅)

If a travel has crosses, `buildSegments` splits it into sub-segments `origin → cross1 → ... → destination`, so the animated path follows intermediate points instead of a straight line:

- The backend does **not** guarantee cross order (`Travel.crosses` is stored in check-order from the Crosses page).
- With `crosses.length <= 1` the waypoints are used as stored (nothing to sort).
- With more than one, crosses are sorted by their projection onto the origin→destination axis: `routePosition = distToOrigin / (distToOrigin + distToDestination)`, computed with the shared `calculateDistance` util — same algorithm as `modal/CrossSection.tsx`.
- Zero-length legs are dropped (duplicate points); if every leg is degenerate, a single placeholder leg keeps the marker moving.
- Leg durations are proportional to leg length within the travel's existing `totalMs`.

### Key Implementation Notes (as built)

- **rAF loop lives in refs**: `useTick` keeps the frame handle and segment counters in refs (`rafRef`, `segmentIndexRef`, `segmentFractionRef`, `lastTimeRef`); the tick function is exposed through a ref so the start effect never resubscribes per render. Cleanup cancels the rAF and any pending zoom-sequence timeouts on unmount, toggle-off and segment rebuilds.
- **Single camera owner**: while animating, only `CameraFollow` touches the camera (`ChangeMapView` is unmounted). Follow pans are throttled (≥80ms apart), which is what lets the deferred zoom land without being interrupted mid-flight.
- **Deferred zoom via prop diffing**: `pendingZoom` starts as `undefined` (= no-op sentinel covering the mount); `CameraFollow` applies any defined value that differs from the last applied one. Do not add a "skip first render" guard — the first emission after mount is a genuine request (regression we hit).
- **`MapContainer` props are initial-only**: react-leaflet ignores `center`/`zoom` prop changes after mount. Syncing the view is `ChangeMapView`'s job in static mode and `CameraFollow`'s in animated mode.
- **Segments are generic legs**: tick, polylines and camera treat the list flatly; a travel with crosses contributes several consecutive entries sharing the same `travel` and `color`. No consumer may assume 1 segment = 1 travel.
- **No SSR / ordering / empty state**: `TravelMap` is dynamically imported with `ssr: false`; playback order is oldest→newest via `toReversed()` (backend ships newest-first); empty travels render the "no locations" placeholder instead of the map.

## ✅ Verification (done)

- [x] `npm run lint` passes clean.
- [x] `docker compose up --build -d` boots cleanly (no backend/service changes).
- [x] Marker moves origin→destination per travel sequentially; polylines accumulate behind it.
- [x] Camera follows smoothly; toggling animation on/off causes no coordinate jumps.
- [x] Date-range change mid-animation: pan to new route start → zoom → resume, landing on an area with segments.
- [x] Travels with multiple crosses show intermediate waypoints ordered along the route.

## 📝 Notes & Risks

- **Leaflet `panTo` vs `flyTo`**: settled on throttled animated `panTo` (0.3s ease, ≥80ms between calls) in `CameraFollow`. `flyTo` was rejected for zoom sync because the continuous follow pans interrupt it mid-flight; zoom is applied with plain `setZoom` after the settle delay instead.
- **Performance with many travels**: legs add more polylines; completed ones are static Leaflet layers appended once and only trimmed on restart — no full redraws per frame.
- **Map strategy**: single shared `MapContainer` with swapped children (not the second-map variant originally proposed) — this also keeps the camera choreography (follow + zoom sync + `ChangeMapView`) within one map instance.
- **Future work**: play/pause, speed selector, progress scrubber, travel info card remain open enhancements.
