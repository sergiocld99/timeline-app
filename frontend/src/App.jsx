import { useEffect, useState } from 'react'
import { backendBaseUrl } from './constants'
import LocationForm from './components/LocationForm'
import LocationTable from './components/LocationTable'
import axios from 'axios'
import './App.css'

function App() {
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
    <div className='App'>
      <LocationForm onLocationAdded={fetchLocations} />
      <LocationTable locations={locations} />
    </div>
  )
}

export default App
