import { useEffect, useState } from "react"

import type { Travel } from "../../types/travel"
import TravelService from "../services/TravelService"

const useTravels = () => {
  const [travels, setTravels] = useState<Travel[]>([])
  const [error, setError] = useState<unknown>(null)

  const fetchTravels = () => {
    TravelService.getAll()
      .then(data => setTravels(data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchTravels()
  }, [])

  return { travels, error, refetch: fetchTravels }
}

export default useTravels;