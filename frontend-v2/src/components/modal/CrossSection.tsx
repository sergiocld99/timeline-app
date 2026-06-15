import type { Cross, EnrichedCross } from "@/types/cross"
import type { Travel } from "@/types/travel"

import { extractTime } from "@/utils"
import { calculateDistance } from "@/utils/numbers"

type Props = {
  travel: Travel
  title: string
}

const CrossSection = ({ travel, title }: Props) => {
  const { crosses, origin, destination, distance, duration, startTime } = travel
  const startTimestamp = new Date(startTime)

  if (crosses.length === 0) {
    return null
  }

  const enrichCross = (c: Cross): EnrichedCross => {
    const distStart = calculateDistance(c.latitude, c.longitude, origin.latitude, origin.longitude)
    const distEnd = calculateDistance(c.latitude, c.longitude, destination.latitude, destination.longitude)
    const ratio = distStart / (distStart + distEnd)
    const adjustedDistance = ratio * distance
    const adjustedTimestamp = new Date(startTimestamp)

    adjustedTimestamp.setMinutes(adjustedTimestamp.getMinutes() + ratio * duration)

    return {
      ...c,
      adjustedDistance,
      adjustedTimestamp
    }
  }

  const renderCross = (c: EnrichedCross) => (
    <span key={c._id} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
      Km {c.adjustedDistance.toFixed(0)} - {c.name} - {extractTime(c.adjustedTimestamp.toISOString())}
    </span>
  )

  const enrichedCrosses = crosses.map(c => enrichCross(c)).sort((a, b) => a.adjustedDistance - b.adjustedDistance)

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
      <h4 className="font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
      <div className="flex flex-wrap gap-1 mt-1">
        {enrichedCrosses.map(c => renderCross(c))}
      </div>
    </div>
  )
}

export default CrossSection