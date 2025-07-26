import { useEffect, useState } from "react"
import axios from "axios"

import { Travel } from "../../types/travel"
import { backendBaseUrl } from "../constants"

const useTravels = () => {
  const [travels, setTravels] = useState<Travel[]>([])
  const [error, setError] = useState(null)

  const fetchTravels = () => {
    axios.get<Travel[]>(`${backendBaseUrl}/travels`)
      .then(response => setTravels(response.data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchTravels()
  }, [])

  return { travels, error, refetch: fetchTravels }
}

export default useTravels;