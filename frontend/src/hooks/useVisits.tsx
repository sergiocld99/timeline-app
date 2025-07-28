import { useEffect, useState } from "react"

import type { Visit } from "../../types/travel"
import VisitService from "../services/VisitService"

const useVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([])
  const [error, setError] = useState<unknown>(null)

  const fetchVisits = () => {
    VisitService.getAll()
      .then(data => setVisits(data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchVisits()
  }, [])

  return { visits, error, refetch: fetchVisits }
}

export default useVisits;