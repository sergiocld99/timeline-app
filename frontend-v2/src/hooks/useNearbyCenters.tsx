import type { KnownCenter } from "@/types/center"

import { useEffect, useState } from "react"

import KnownCenterService from "@/services/KnownCenterService"

type Props = {
  latitude?: number
  longitude?: number
  radiusKm?: number
}

const useNearbyCenters = ({ latitude, longitude, radiusKm }: Props) => {
  const [nearbyCenters, setNearbyCenters] = useState<KnownCenter[]>([])
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!latitude || !longitude) {
      setNearbyCenters([])
      return
    }

    KnownCenterService.getTopNKnownCenters(latitude, longitude, 5, radiusKm)
      .then(data => setNearbyCenters(data))
      .catch(err => setError(err))
  }, [latitude, longitude, radiusKm])

  return { nearbyCenters, error }
}

export default useNearbyCenters
