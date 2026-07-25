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

export type StatsView = "bar" | "circular" | "line" | "calendar"

export type TopKeysResult = {
  topKeys: string[]
  otherKeys: string[]
  shouldShowOthers: boolean
}

type FilteringByZipcode = {
  type: 'zipcode'
  value: string[]
}

type FilteringByLocation = {
  type: 'location'
  value: string[]
}

type FilteringByTime = {
  type: 'day' | 'hour'
  value: string | undefined | null
}

type FilteringByCross = {
  type: 'cross'
  value: string
}

type FilteringByMode = {
  type: 'mode'
  value: string
}

type FilteringByDayHour = {
  type: 'dayHour'
  value: { day: string, hour: string }
}

type FilteringByDayRange = {
  type: 'dayRange'
  value: string
}

type FilteringByDayRangeHour = {
  type: 'dayRangeHour'
  value: { dayRange: string, hour: string }
}

export type FilteringData = FilteringByZipcode | FilteringByLocation | FilteringByTime | FilteringByCross | FilteringByMode | FilteringByDayHour | FilteringByDayRange | FilteringByDayRangeHour