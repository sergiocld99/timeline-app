export const ROUTE_SEPARATOR = ' ↔ '

export const calculateHome = (topRoutes) => {
  if (topRoutes.length > 0) {
    const competitor1 = topRoutes[0].route.split(ROUTE_SEPARATOR)[0]
    const competitor2 = topRoutes[0].route.split(ROUTE_SEPARATOR)[1]

    const appearances1 = topRoutes.filter(r => r.route.includes(competitor1))
    const appearances2 = topRoutes.filter(r => r.route.includes(competitor2))
    return appearances1.length > appearances2.length ? competitor1 : competitor2
  }

  return null
}