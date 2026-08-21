import type { KnownCenter } from "@/types/center"
import type { Visit } from "@/types/visit"

import { useEffect, useState } from "react"

import KnownCenterService from "@/services/KnownCenterService"
import { useUser } from "@/contexts/UserContext"

type Props = {
  latitude?: number
  longitude?: number
  radiusKm?: number
  visits?: Visit[]
}

const useNearbyCenters = ({ latitude, longitude, radiusKm, visits }: Props) => {
  const [nearbyCenters, setNearbyCenters] = useState<KnownCenter[]>([])
  const [error, setError] = useState<Error | null>(null)
  const { currentUser } = useUser();

  useEffect(() => {
    if (!latitude || !longitude) {
      setNearbyCenters([])
      return
    }

    KnownCenterService.getTopNKnownCenters(latitude, longitude, 5, radiusKm, currentUser?.userId)
      .then(data => {
        setNearbyCenters(data.map(kc => ({
          ...kc,
          isActive: visits?.some(v => v.location._id === kc._id)
        })))
      })
      .catch(err => setError(err))
  }, [latitude, longitude, radiusKm, visits, currentUser])

  return { nearbyCenters, error }
}

export default useNearbyCenters
