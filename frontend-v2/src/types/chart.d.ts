export type ChartSource = Record<string, Record<string, number>>

export type ChartData<T extends string> = Array<{
  red: number,
  orange: number,
  yellow: number,
  green: number,
  blue: number,
  others: number
} & Record<T, string>>

export type HourPart = {
  hour: string;
  totalMinutes: number;
}

export type HourAndMinutes = {
  hour: number;
  minutes: number;
}