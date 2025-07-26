import { useEffect, useState } from "react"
import axios from "axios"

import type { Visit } from "../../types/travel"
import { backendBaseUrl } from "../constants"

const useVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([])
  const [error, setError] = useState(null)

  const fetchVisits = () => {
    axios.get<Visit[]>(`${backendBaseUrl}/visits`)
      .then(response => setVisits(response.data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchVisits()
  }, [])

  return { visits, error, refetch: fetchVisits }
}

export default useVisits;