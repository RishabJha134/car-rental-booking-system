import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthReady } = useContext(AuthContext)
  const location = useLocation()

  if (!isAuthReady) {
    return <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Checking your session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.role && user.role !== role) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">You are not authorized to view this page.</div>
  }

  return children
}
