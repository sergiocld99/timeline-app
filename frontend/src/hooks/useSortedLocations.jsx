import { useEffect, useMemo, useState } from "react"
import axios from "axios"

import { backendBaseUrl } from "../constants"
import { sortLocationsByZipcode } from "../utils/sorter"

const useSortedLocations = () => {
  const [locations, setLocations] = useState([])
  const [error, setError] = useState(null)

  const fetchLocations = () => {
    axios.get(`${backendBaseUrl}/locations`)
      .then(response => setLocations(response.data))
      .catch(error => setError(error))
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const sortedLocations = useMemo(() => sortLocationsByZipcode(locations), [locations]);

  return { sortedLocations, error, refetch: fetchLocations }
}

export default useSortedLocations;