import { useEffect, useState } from "react"
import axios from "axios"

import type { Location } from "../../types/travel"
import { backendBaseUrl } from "../constants"

const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [error, setError] = useState(null)

  const fetchLocations = () => {
    axios.get<Location[]>(`${backendBaseUrl}/locations`)
      .then(response => setLocations(response.data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return { locations, error, refetch: fetchLocations }
}

export default useLocations;