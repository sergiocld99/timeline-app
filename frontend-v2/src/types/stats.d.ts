export type StatByMode = {
  modeOfTransport: string
  totalMinutes: number
  totalKm: number
  count: number
}

export type StatByModeChartData = StatByMode & {
  averageSpeed: number
  fill: string
}

export type StatsView = "bar" | "circular"

export type TopKeysResult = {
  topKeys: string[]
  otherKeys: string[]
  shouldShowOthers: boolean
}