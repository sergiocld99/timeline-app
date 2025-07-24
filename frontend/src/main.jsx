import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import './index.css'

import LocationsPage from './pages/LocationsPage.jsx'
import TravelsPage from './pages/TravelsPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={"/locations"} />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/travels" element={<TravelsPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)
