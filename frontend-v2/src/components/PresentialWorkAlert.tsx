import type { Travel } from "@/types/travel"

import { AlertTriangleIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { usePresentialCheck } from "@/hooks/usePresentialCheck"
import { renderNiceDate } from "@/utils"

const renderLastTravelInfo = (t: Travel, daysSince: number) => {
  return (
    <p>The last travel to work was <span></span>
      <strong>{Math.floor(daysSince)} days ago. </strong>
      You visited {t.destination.name} on <span></span>
      <strong>{renderNiceDate(t.endTime)}</strong>
    </p>
  )
}

const renderDefaultMessage = () => {
  return 'You did not travelled to work in the last 90 days'
}

const PresentialWorkAlert = () => {
  const { awarenessData, loading } = usePresentialCheck()
  const { isBeforeThreshold, lastTravel, daysSince } = awarenessData

  return !loading && isBeforeThreshold && (
    <Card className="w-full bg-yellow dark:bg-yellow-800 border-yellow-200 dark:border-yellow-700 py-0">
      <CardContent className="flex flex-row items-center justify-center gap-10 py-4">
        <AlertTriangleIcon color="yellow" size={40} />
        <div className="text-center text-yellow-500 dark:text-yellow-400">
          {(lastTravel && daysSince) ?
            renderLastTravelInfo(lastTravel, daysSince) :
            renderDefaultMessage()
          }
        </div>
      </CardContent>
    </Card>
  )
}

export default PresentialWorkAlert