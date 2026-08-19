import type { KnownCenter } from "@/types/center"

import { useEffect, useState } from "react"

import KnownCenterService from "@/services/KnownCenterService"
import { useUser } from "@/contexts/UserContext"

type Props = {
  latitude?: number
  longitude?: number
  radiusKm?: number
}

const useNearbyCenters = ({ latitude, longitude, radiusKm }: Props) => {
  const [nearbyCenters, setNearbyCenters] = useState<KnownCenter[]>([])
  const [error, setError] = useState<Error | null>(null)
  const { currentUser } = useUser();

  useEffect(() => {
    if (!latitude || !longitude) {
      setNearbyCenters([])
      return
    }

    KnownCenterService.getTopNKnownCenters(latitude, longitude, 5, radiusKm, currentUser?.userId)
      .then(data => setNearbyCenters(data))
      .catch(err => setError(err))
  }, [latitude, longitude, radiusKm, currentUser])

  return { nearbyCenters, error }
}

export default useNearbyCenters
