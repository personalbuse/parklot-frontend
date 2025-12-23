import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ParkingMap from './pages/ParkingMap'
import Vehicles from './pages/Vehicles'
import WashServices from './pages/WashServices'
import IoTDevices from './pages/IoTDevices'
import AdminConfig from './pages/AdminConfig'
import Tariffs from './pages/Tariffs'
import Layout from './components/Layout'

function App() {
  const { token } = useAuthStore()

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/parking" element={<ParkingMap />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/wash" element={<WashServices />} />
        <Route path="/iot" element={<IoTDevices />} />
        <Route path="/tariffs" element={<Tariffs />} />
        <Route path="/admin" element={<AdminConfig />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App

