import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function AddCar() {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [seatingCapacity, setSeatingCapacity] = useState('')
  const [features, setFeatures] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/cars', {
        brand,
        model,
        year,
        licensePlate,
        seatingCapacity,
        pricePerDay,
        features,
        imageUrl,
      })
      setMsg(res.data.message || 'Car added successfully')
      navigate('/agency/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <h2 className="text-2xl font-bold text-white">Add car</h2>
      <p className="mt-2 text-sm text-slate-300">Publish a new vehicle to your agency fleet.</p>
      {msg && <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div>}
      {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Brand" value={brand} onChange={e => setBrand(e.target.value)} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Model" value={model} onChange={e => setModel(e.target.value)} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="License Plate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Price per day" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Seating capacity" value={seatingCapacity} onChange={e => setSeatingCapacity(e.target.value)} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        <textarea className="min-h-28 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 md:col-span-2" placeholder="Features, separated by commas" value={features} onChange={e => setFeatures(e.target.value)} />
        <button disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2">
          {loading ? 'Saving...' : 'Add car'}
        </button>
      </form>
    </div>
  )
}
