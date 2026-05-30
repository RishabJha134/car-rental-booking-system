import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

function parseJwt(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(decoded)))
  } catch (e) {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cr_token')
    if (stored) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`
      const payload = parseJwt(stored)
      const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : false
      if (payload && !isExpired) {
        setUser({ id: payload.id, name: payload.name || payload.sub || '', role: payload.role, token: stored })
      } else {
        localStorage.removeItem('cr_token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
      }
    }
    setIsAuthReady(true)
  }, [])

  function login(token, userInfo) {
    localStorage.setItem('cr_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // prefer explicit userInfo from server, fallback to token payload
    if (userInfo) {
      setUser({ ...userInfo, token })
    } else {
      const payload = parseJwt(token)
      setUser({ id: payload?.id, name: payload?.name || '', role: payload?.role, token })
    }
  }

  function logout() {
    localStorage.removeItem('cr_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
