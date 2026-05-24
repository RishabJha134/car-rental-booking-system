import React, { useState, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import AuthContext from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, user } = res.data.data
      login(token, user)
      setSuccess('Login successful. Redirecting now...')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <h2 className="text-2xl font-bold text-white">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-300">Use your email and password to continue.</p>
      {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {success && <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-400">
        New here? <Link to="/register-customer" className="text-cyan-300 hover:text-cyan-200">Create a customer account</Link>
      </p>
    </div>
  )
}
