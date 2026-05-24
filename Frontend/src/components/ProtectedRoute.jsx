import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.role && user.role !== role) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">You are not authorized to view this page.</div>
  }

  return children
}
