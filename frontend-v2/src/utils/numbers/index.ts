export const roundDecimals = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals)

  return Math.round(num * factor) / factor
}