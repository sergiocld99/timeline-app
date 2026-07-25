export type ChartSource = Record<string, Record<string, number>>

export type ChartData<T extends string> = Array<{
  red: number,
  orange: number,
  yellow: number,
  green: number,
  blue: number,
  others: number,
  empty: boolean
} & Record<T, string>>

export type HourPart = {
  hour: string;
  totalMinutes: number;
}

export type HourAndMinutes = {
  hour: number;
  minutes: number;
}

export type ColorKey = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'others'

export type CalendarCellBase = {
  colorKey: ColorKey | null
  totalMinutes: number
}

export type CalendarCell = CalendarCellBase & {
  day: string
  hour: string
}

export type MonthlyCalendarCell = CalendarCellBase & {
  dayRange: string
  hour: string
}

export type CalendarMode = 'weekly' | 'monthly'