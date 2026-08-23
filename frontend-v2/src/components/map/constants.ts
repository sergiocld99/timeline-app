import type { WeightColors } from "@/types/commons";

export const WEIGHT_COLOR_MAP: Record<WeightColors, string> = {
  "🟣": "#8b5cf6",
  "🔴": "#ef4444",
  "🟠": "#f97316",
  "🟡": "#eab308",
  "🟢": "#22c55e",
}

export const COLOR_RED = "#FF0000"
export const COLOR_LIGHT_BLUE = "#3b82f6"

export const MS_PER_TRAVEL_MINUTE = 100
export const MAX_FRAME_MS = 1000 / 30
export const ZOOM_SETTLE_DELAY_MS = 400
export const PAN_SETTLE_DELAY_MS = 350
export const DEFAULT_LAT = -34.6037031
export const DEFAULT_LNG = -58.3816211
export const DEFAULT_ZOOM = 9