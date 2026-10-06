import { Link, useNavigate } from 'react-router-dom'
import { Store, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt='SmartHub Logo' className='h-9 w-9 object-contain rounded-xl'/>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold text-navy">SmartHub</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-navy/50">
              Marketplace
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {!user && (
            <>
              <Link to="/register" className="btn-outline hidden sm:inline-flex">
                List Your Business
              </Link>
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
            </>
          )}

          {user && role === 'vendor' && (
            <Link to="/vendor/dashboard" className="btn-navy">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}

          {user && role === 'admin' && (
            <Link to="/admin" className="btn-navy">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}

          {user && (
            <button onClick={handleSignOut} className="btn-outline">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
