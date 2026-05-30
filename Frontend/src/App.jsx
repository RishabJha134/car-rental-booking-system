import React, { useContext } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterCustomer from './pages/RegisterCustomer'
import RegisterAgency from './pages/RegisterAgency'
import AvailableCars from './pages/AvailableCars'
import MyBookings from './pages/MyBookings'
import AddCar from './pages/AddCar'
import EditCar from './pages/EditCar'
import AgencyBookings from './pages/AgencyBookings'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthContext from './context/AuthContext'
import { ToastProvider } from './components/ToastContext'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </AuthProvider>
  )
}

function Layout() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Link to="/" className="text-lg font-bold tracking-wide text-white">FleetFlow</Link>
            <Link to="/cars" className="text-sm text-slate-300 transition hover:text-white">Available Cars</Link>
            {user?.role === 'customer' && (
              <Link to="/my-bookings" className="text-sm text-slate-300 transition hover:text-white">My Bookings</Link>
            )}
            {user?.role === 'agency' && (
              <Link to="/agency/bookings" className="text-sm text-slate-300 transition hover:text-white">Agency Panel</Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {user.name || 'User'} • {user.role}
                </span>
                <button onClick={logout} className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-300 transition hover:text-white">Login</Link>
                <Link to="/register-customer" className="text-sm text-slate-300 transition hover:text-white">Customer Sign Up</Link>
                <Link to="/register-agency" className="text-sm text-slate-300 transition hover:text-white">Agency Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-customer" element={<RegisterCustomer />} />
          <Route path="/register-agency" element={<RegisterAgency />} />
          <Route path="/cars" element={<AvailableCars />} />
          <Route path="/my-bookings" element={<ProtectedRoute role="customer"><MyBookings /></ProtectedRoute>} />

          <Route path="/agency/add-car" element={<ProtectedRoute role="agency"><AddCar /></ProtectedRoute>} />
          <Route path="/agency/edit/:id" element={<ProtectedRoute role="agency"><EditCar /></ProtectedRoute>} />
          <Route path="/agency/bookings" element={<ProtectedRoute role="agency"><AgencyBookings /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
