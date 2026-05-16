"use client";

import type { Travel } from "@/types/travel";

import { useTranslations, useFormatter } from "next-intl";
import { AlertTriangleIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { usePresentialCheck } from "@/hooks/usePresentialCheck"
import { renderNiceDate } from "@/utils/date"

const PresentialWorkAlert = () => {
  const t = useTranslations("PresentialAlert");
  const format = useFormatter();
  const { awarenessData, loading } = usePresentialCheck()
  const { isBeforeThreshold, lastTravel, daysSince } = awarenessData

  const formatDate = (dateStr: string) => renderNiceDate(dateStr, format);

  const renderLastTravelInfo = (travel: Travel, days: number) => {
    return (
      <p>
        {t.rich("lastTravel", {
          days: Math.floor(days),
          destination: travel.destination.name,
          date: formatDate(travel.endTime),
          span: (chunks) => <span>{chunks}</span>,
          strong: (chunks) => <strong>{chunks}</strong>
        })}
      </p>
    )
  }

  const renderDefaultMessage = () => {
    return t("noTravel")
  }

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