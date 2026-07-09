export const ROUTE_SEPARATOR = ' ↔ '

export const calculateHome = (topRoutes) => {
  if (topRoutes.length > 0) {
    const candidates = []

    // Extract competitors from topRoutes[0]
    topRoutes[0].route.split(ROUTE_SEPARATOR).forEach(c => {
      if (!candidates.includes(c)) {
        candidates.push(c)
      }
    })

    // Extract competitors from topRoutes[1] if it exists
    if (topRoutes.length > 1) {
      topRoutes[1].route.split(ROUTE_SEPARATOR).forEach(c => {
        if (!candidates.includes(c)) {
          candidates.push(c)
        }
      })
    }

    let bestCompetitor = null
    let maxAppearances = -1

    for (const competitor of candidates) {
      const appearances = topRoutes.filter(r => r.route.includes(competitor)).length
      if (appearances > maxAppearances) {
        maxAppearances = appearances
        bestCompetitor = competitor
      }
    }

    return bestCompetitor
  }

  return null
}