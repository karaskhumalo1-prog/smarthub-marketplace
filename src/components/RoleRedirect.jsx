import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// After sign-in, the system checks the authenticated user's role and
// automatically routes them: vendor -> /vendor/dashboard, admin -> /admin,
// customer -> stays on the storefront ("/").
export default function RoleRedirect() {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-navy/60 text-sm">Signing you in...</p>
      </div>
    )
  }

  if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}
