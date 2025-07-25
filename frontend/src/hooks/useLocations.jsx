import { useEffect, useState } from "react"
import { backendBaseUrl } from "../constants"
import axios from "axios"

const useLocations = () => {
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

  return { locations, error, refetch: fetchLocations }
}

export default useLocations;