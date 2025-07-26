import { useEffect, useState } from "react"
import axios from "axios"

import { backendBaseUrl } from "../constants"

type Location = {
  _id: string
  name: string
  latitude: number
  longitude: number
  zipcode: string
  notes: string
}

type Travel = {
  _id: string
  startTime: string
  endTime: string
  origin: Location
  destination: Location
  modeOfTransport: string
  distance: number
  shortDate: string
  duration: number
  speed: number
}

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