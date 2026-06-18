export const roundDecimals = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals)

  return Math.round(num * factor) / factor
}

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}