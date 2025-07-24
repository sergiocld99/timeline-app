import { useEffect, useState } from 'react'
import { backendBaseUrl } from '../constants';
import axios from 'axios';

import Header from "../components/Header"
import LocationForm from "../components/LocationForm"
import LocationTable from "../components/LocationTable"

const LocationsPage = () => {
  const [locations, setLocations] = useState([])

  const fetchLocations = () => {
    axios.get(`${backendBaseUrl}/locations`)
      .then(response => setLocations(response.data))
      .catch(error => console.error("There was an error fetching the locations!", error))
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return (
    <>
      <Header />
      <main className='page-container'>
        <LocationForm onLocationAdded={fetchLocations} />
        <LocationTable locations={locations} />
      </main>
    </>
  )
}

export default LocationsPage