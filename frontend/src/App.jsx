import { useState } from 'react'
import LocationForm from './components/LocationForm'
import LocationTable from './components/LocationTable'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <LocationForm />
      <LocationTable />
    </div>
  )
}

export default App
