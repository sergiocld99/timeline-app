import { TopKeysResult } from "@/types/stats"

export const sortByAscendingValue = (entries: Record<string, number>) => {
  return Object.entries(entries).sort((a, b) => a[1] - b[1])
}

export const sortByDescendingValue = (entries: Record<string, number>) => {
  return sortByAscendingValue(entries).reverse()
}

export const extractKeys = (entries: [string, unknown][], quantity: number, fillEmpty = false): TopKeysResult => {
  const result = entries.map(loc => loc[0]).slice(0, quantity)
  const shouldShowOthers = entries.length > quantity
  const otherKeys = shouldShowOthers ? entries.slice(quantity).map(loc => loc[0]).sort() : []

  if (fillEmpty) {
    for (let i = 0; i < quantity; i++) {
      if (!result[i]) result[i] = '';
    }
  }

  return {
    topKeys: result,
    otherKeys,
    shouldShowOthers
  }
}