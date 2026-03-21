import type { Travel, TravelFindResult } from "@/types/travel";;

import { useCallback, useEffect, useState } from "react"

import { useUser } from "@/contexts/UserContext";
import TravelService from "@/services/TravelService"
import { getDaysSince } from "@/utils/date";

const WORK_ZIPCODES = ['C1430', 'C1264', 'C1437']

type AwarenessResult = {
  lastTravel: Travel | null,
  isBeforeThreshold: boolean,
  daysSince?: number
}

export const usePresentialCheck = () => {
  const { currentUser, loading: userLoading } = useUser();
  const [result, setResult] = useState<TravelFindResult>({ count: 0, travels: [] })
  const [loading, setLoading] = useState(true)

  const fetchAnyTravelsToWork = useCallback(() => {
    TravelService.findAnyTravelsToCPs(WORK_ZIPCODES, undefined, undefined, currentUser?.userId)
      .then(result => setResult(result))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [currentUser]);

  const shouldShowAwareness = (): AwarenessResult => {
    const { count, travels } = result
    const lastTravel = count > 0 ? travels[0] : null

    if (lastTravel === null) {
      return {
        lastTravel: null,
        isBeforeThreshold: false
      }
    }

    const lastDate = new Date(lastTravel.endTime)
    const daysSince = getDaysSince(new Date(), lastDate)

    return {
      lastTravel,
      isBeforeThreshold: daysSince >= 60,
      daysSince
    }
  }

  useEffect(() => {
    if (!userLoading) {
      fetchAnyTravelsToWork()
    }
  }, [fetchAnyTravelsToWork, userLoading])

  return {
    loading,
    awarenessData: shouldShowAwareness()
  }
}