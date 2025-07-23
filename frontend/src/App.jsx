import { useState } from 'react'
import LocationForm from './components/LocationForm'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <LocationForm />
    </div>
  )
}

export default App
