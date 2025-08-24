import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'

import LocationsPage from './pages/LocationsPage'
import TravelsPage from './pages/TravelsPage'
import VisitsPage from './pages/VisitsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to={"/locations"} />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/travels" element={<TravelsPage />} />
        <Route path="/visits" element={<VisitsPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)
