import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function EditCar() {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/cars/${id}`)
        setCar({ ...res.data.data, availability_status: res.data.data.availability_status || 'available' })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load car')
      }
    }
    load()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    setLoading(true)
    try {
      const payload = {
        brand: car.brand,
        model: car.model,
        year: car.year,
        licensePlate: car.license_plate,
        seatingCapacity: car.seating_capacity || car.seatingCapacity || 4,
        pricePerDay: car.price_per_day,
        availabilityStatus: car.availability_status,
        features: car.features,
        imageUrl: car.image_url,
      }
      const res = await api.put(`/cars/${id}`, payload)
      setMsg(res.data.message || 'Updated successfully')
      navigate('/agency/bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (error && !car) return <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>

  if (!car) return <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Loading car...</div>

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
      <h2 className="text-2xl font-bold text-white">Edit car</h2>
      <p className="mt-2 text-sm text-slate-300">Update the details and availability for this vehicle.</p>
      {msg && <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div>}
      {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.brand || ''} onChange={e => setCar({...car, brand: e.target.value})} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.model || ''} onChange={e => setCar({...car, model: e.target.value})} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.year || ''} onChange={e => setCar({...car, year: e.target.value})} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.license_plate || ''} onChange={e => setCar({...car, license_plate: e.target.value})} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.price_per_day || ''} onChange={e => setCar({...car, price_per_day: e.target.value})} />
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.seating_capacity || car.seatingCapacity || ''} onChange={e => setCar({...car, seating_capacity: e.target.value})} />
        <select className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.availability_status || 'available'} onChange={e => setCar({...car, availability_status: e.target.value})}>
          <option value="available">available</option>
          <option value="booked">booked</option>
          <option value="maintenance">maintenance</option>
        </select>
        <input className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400 md:col-span-2" value={car.image_url || ''} onChange={e => setCar({...car, image_url: e.target.value})} placeholder="Image URL" />
        <textarea className="min-h-28 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400 md:col-span-2" value={car.features || ''} onChange={e => setCar({...car, features: e.target.value})} placeholder="Features" />
        <button disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2">{loading ? 'Saving...' : 'Save changes'}</button>
      </form>
    </div>
  )
}
