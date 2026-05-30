import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function RegisterAgency() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function clearFieldError(field) {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validate() {
    const errors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      errors.name = 'Name is required.'
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }

    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setLoading(true)
    try {
      const res = await api.post('/auth/register-agency', { name, email, password })
      setSuccess(res.data.message || 'Agency registered successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
        if (!err.response) {
          setError('Network error. Check backend URL/server and make sure browser DevTools is not set to Offline.')
        } else {
          setError(err.response?.data?.message || 'Registration failed')
        }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <h2 className="text-2xl font-bold text-white">Create agency account</h2>
      <p className="mt-2 text-sm text-slate-300">Manage your fleet and bookings from the agency panel.</p>
      {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {success && <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Name"
            value={name}
            onChange={e => {
              clearFieldError('name')
              setName(e.target.value)
            }}
          />
          {fieldErrors.name && <p className="mt-2 text-xs text-red-300">{fieldErrors.name}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Email"
            value={email}
            onChange={e => {
              clearFieldError('email')
              setEmail(e.target.value)
            }}
          />
          {fieldErrors.email && <p className="mt-2 text-xs text-red-300">{fieldErrors.email}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => {
              clearFieldError('password')
              setPassword(e.target.value)
            }}
          />
          {fieldErrors.password && <p className="mt-2 text-xs text-red-300">{fieldErrors.password}</p>}
        </div>
        <button disabled={loading} className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Creating account...' : 'Register Agency'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-400">
        Already registered? <Link to="/login" className="text-cyan-300 hover:text-cyan-200">Log in</Link>
      </p>
    </div>
  )
}
