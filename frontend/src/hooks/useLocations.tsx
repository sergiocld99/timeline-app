import { useEffect, useState } from "react"

import type { Location } from "../../types/travel"
import LocationService from "../services/LocationService"

const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [error, setError] = useState<unknown>(null)

  const fetchLocations = () => {
    LocationService.getAll()
      .then(data => setLocations(data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return { locations, error, refetch: fetchLocations }
}

export default useLocations;