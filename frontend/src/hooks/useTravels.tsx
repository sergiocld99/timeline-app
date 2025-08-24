import { useEffect, useState } from "react"

import type { Travel } from "../../types/travel"
import TravelService from "../services/TravelService"

const useTravels = () => {
  const [travels, setTravels] = useState<Travel[]>([])
  const [error, setError] = useState<unknown>(null)

  const fetchTravels = (dateFrom?: string, dateTo?: string) => {
    TravelService.getAll(dateFrom, dateTo)
      .then(data => setTravels(data))
      .catch(error => setError(error))
  }

  const updateTravel = async (id: string, updates: Partial<Travel>) => {
    try {
      const updatedTravel = await TravelService.update(id, updates);
      // Don't update local state here - we'll refetch to get proper weights
      return updatedTravel;
    } catch (error) {
      setError(error);
      throw error;
    }
  }

  useEffect(() => {
    fetchTravels()
  }, [])

  return { travels, error, refetch: fetchTravels, updateTravel }
}

export default useTravels;