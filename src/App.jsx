import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import QRFooter from './components/QRFooter.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VendorDashboard from './pages/VendorDashboard.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleRedirect from './components/RoleRedirect.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Handles the "unified login" role-based redirect after auth */}
          <Route path="/redirecting" element={<RoleRedirect />} />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute role="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <QRFooter />
    </div>
  )
}
