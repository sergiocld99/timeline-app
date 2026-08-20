# SDD: Animated Travel Timeline

## 🎯 Objective

Add an animated visualization to the Travels page that replays the user's travels chronologically on the map, inspired by [google-timeline-visualizer](https://github.com/mahlernim/google-timeline-visualizer). A marker moves along straight-line segments (origin → destination for each travel), with polylines appearing behind it, creating a "watch your travels come to life" experience. Desktop-only, no export/download — purely in-browser playback using Leaflet.

The existing data is sufficient: each `Travel` already carries populated `origin` and `destination` (`Location` with `latitude`/`longitude`), `startTime` for ordering, `modeOfTransport`, `distance`, and `duration`. No backend changes needed.

## 🏗️ Proposed Architecture

A new `AnimatedTimeline` Client Component renders a full-width Leaflet map below the existing map+charts row in `TravelsPageClient`. It receives the current `filteredTravels` array (already sorted newest-to-oldest by the backend) and animates through them sequentially.

### Component Changes

| Component | Description of Changes |
| :--- | :--- |
| `AnimatedTimeline.tsx` | New Client Component. Full Leaflet map with play/pause, progress bar, travel info overlay, and the animation loop. |
| `AnimatedTimelineControls.tsx` | New Client Component. Play/pause button, speed selector, progress scrubber. |
| `TravelsPageClient.tsx` | Add a toggle button and conditionally render `AnimatedTimeline` below the stats row. |
| `types/animated-timeline.d.ts` | New type definitions for animation state and segment data. |
| `backend` | None. |
| `statistics-service` | None. |

## 🛠️ Implementation Details

### Data Flow

```
filteredTravels (Travel[])
  → buildSegments(): AnimationSegment[]
    → [{ from: [lat,lng], to: [lat,lng], travel, index }]
  → AnimationEngine (requestAnimationFrame loop)
    → current position, active polylines, camera center
  → Leaflet render: Polyline[], Marker, camera panTo
```

### AnimationSegment type

```ts
type AnimationSegment = {
  index: number
  from: [number, number]  // [lat, lng]
  to: [number, number]    // [lat, lng]
  travel: Travel
  distanceKm: number      // haversine(from, to), used for proportional timing
}
```

### Animation Timing

Each segment's playback duration is proportional to `travel.distance` (km). Shorter trips animate faster, longer trips take more time. A base speed factor (configurable via the speed selector) scales all durations. The total animation time = sum of all segment durations.

Within a segment, the marker interpolates linearly from `from` to `to` using `requestAnimationFrame`. The position at time `t` within segment `i`:

```
fraction = elapsed_in_segment / segment_duration
position = from + (to - from) * fraction
```

### Camera Behavior

Following the simplest approach from google-timeline-visualizer: the camera pans to follow the marker with `map.panTo()` on each frame. No zoom adjustment — use the initial `mapConfig` zoom level (already computed by the stats service) and keep it fixed. This avoids zoom jank with only 2 points per segment.

### Visual Elements

| Element | Description |
| :--- | :--- |
| **Marker** (moving) | A pulsing dot at the current interpolated position. Uses a custom CSS-animated icon (pulsing circle, similar to the existing colored marker icons in `map/icons.ts`). |
| **Completed polylines** | One `Polyline` per finished segment, drawn with the theme color (`#ff0055` or existing blue) at 60% opacity. |
| **Active polyline** | The current segment's line drawn progressively (using `Positions` array built up to the current interpolated point). |
| **Travel info card** | Floating overlay (top-right or bottom-left) showing: travel number, origin name → destination name, mode of transport icon, distance, date. Updates on each segment transition. |
| **Progress bar** | Bottom of the map, thin bar showing overall progress through all segments. Draggable to seek. |

### Controls

| Control | Behavior |
| :--- | --- |
| **Play/Pause** | Toggle animation. Starts paused. |
| **Speed** | 0.5x, 1x, 2x, 4x — multiplies the base speed factor. |
| **Progress scrubber** | Range input from 0 to total segments. Clicking/dragging seeks to that segment's start position. |
| **Reset** | Jumps back to the beginning. |

### Entry Point in TravelsPageClient

Add an "Animate" button (next to the existing chart view buttons). When clicked, it toggles the `AnimatedTimeline` component below the existing `hidden lg:flex` row (before `TravelTable`). The animated map gets a fixed height (e.g. `h-96` or `h-[500px]`). While animating, the existing static `TravelMap` remains visible above.

### Cross Points (Optional Enhancement)

The `Travel.crosses` array contains intermediate waypoints (`{ latitude, longitude }`). If a travel has crosses, the segment can be split into sub-segments: `origin → cross1 → cross2 → ... → destination`. This makes the animated path follow intermediate points instead of a pure straight line. This is a natural extension since the data is already populated — the `buildSegments()` function checks `travel.crosses.length > 0` and inserts sub-waypoints when present.

### Key Implementation Notes

- **No `useEffect` for animation loop**: Use `useRef` for the `requestAnimationFrame` handle and a `useCallback` for the tick function. Clean up on unmount and on play/pause.
- **No SSR**: Component is dynamically imported (same pattern as `TravelMap`).
- **Travels are already sorted** newest-to-oldest from the backend (`travelService.js` sorts by `startTime: -1`). No re-sorting needed.
- **Empty state**: If no travels, show a message instead of the map.
- **Pause on unmount**: Cancel `requestAnimationFrame` in the cleanup function.

## ✅ Verification Plan

- [ ] `npm run lint` passes clean.
- [ ] Manual: load Travels page, click Animate, marker moves origin→destination for each travel sequentially.
- [ ] Manual: polylines accumulate behind the marker as travels complete.
- [ ] Manual: play/pause toggle works; progress bar reflects current position.
- [ ] Manual: speed selector changes animation speed.
- [ ] Manual: scrubber seeks to correct segment and position.
- [ ] Manual: camera follows the marker smoothly across all segments.
- [ ] Manual: travels with crosses show intermediate waypoints in the animated path.
- [ ] Manual: empty travels state shows message instead of broken map.
- [ ] `docker compose up --build -d` boots cleanly (no new backend/service changes).

## 📝 Notes & Risks

- **Leaflet `panTo` vs `flyTo`**: `panTo` is instant (no easing). For smoother camera movement, use `flyTo` with a short duration (e.g. 300ms) debounced so overlapping calls don't stack. Alternatively, use `panTo` since the marker moves continuously and the camera keeps up frame-by-frame — this is what google-timeline-visualizer does (no easing, just dead-zone tracking).
- **Performance with many travels**: If the date range covers hundreds of travels, the polyline count grows. Leaflet handles hundreds of polylines well, but the `requestAnimationFrame` loop should avoid re-rendering the full polyline set every frame — only append the current active segment's growing line. Completed segments are static `Polyline` components that don't update.
- **SSR**: Must be `next/dynamic` with `ssr: false` like the existing `TravelMap`.
- **Map duplication**: This creates a second Leaflet map instance below the existing one. This is intentional — the static map stays as-is for reference, the animated map is a separate immersive view. Alternative: replace the static map entirely during animation (toggle), but that's more disruptive to the page layout.
