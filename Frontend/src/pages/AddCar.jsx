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
    const trimmedBrand = brand.trim()
    const trimmedModel = model.trim()
    const trimmedLicense = licensePlate.trim()
    const trimmedYear = String(year).trim()
    const parsedYear = Number(trimmedYear)
    const parsedPrice = Number(pricePerDay)
    const parsedSeats = Number(seatingCapacity)
    const currentYear = new Date().getFullYear() + 1

    if (!trimmedBrand) errors.brand = 'Brand is required.'
    if (!trimmedModel) errors.model = 'Model is required.'
    if (!trimmedLicense) errors.licensePlate = 'License plate is required.'

    if (!trimmedYear) {
      errors.year = 'Year is required.'
    } else if (!Number.isFinite(parsedYear) || parsedYear < 1980 || parsedYear > currentYear) {
      errors.year = `Enter a valid year (1980-${currentYear}).`
    }

    if (!pricePerDay) {
      errors.pricePerDay = 'Price per day is required.'
    } else if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      errors.pricePerDay = 'Price per day must be a positive number.'
    }

    if (!seatingCapacity) {
      errors.seatingCapacity = 'Seating capacity is required.'
    } else if (!Number.isFinite(parsedSeats) || parsedSeats <= 0) {
      errors.seatingCapacity = 'Seating capacity must be a positive number.'
    }

    if (imageUrl && !/^https?:\/\//i.test(imageUrl.trim())) {
      errors.imageUrl = 'Image URL must start with http:// or https://.'
    }

    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setError('Please fix the highlighted fields.')
      return
    }

    setFieldErrors({})
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
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Brand"
            value={brand}
            onChange={e => {
              clearFieldError('brand')
              setBrand(e.target.value)
            }}
          />
          {fieldErrors.brand && <p className="mt-2 text-xs text-red-300">{fieldErrors.brand}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Model"
            value={model}
            onChange={e => {
              clearFieldError('model')
              setModel(e.target.value)
            }}
          />
          {fieldErrors.model && <p className="mt-2 text-xs text-red-300">{fieldErrors.model}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Year"
            value={year}
            onChange={e => {
              clearFieldError('year')
              setYear(e.target.value)
            }}
          />
          {fieldErrors.year && <p className="mt-2 text-xs text-red-300">{fieldErrors.year}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="License Plate"
            value={licensePlate}
            onChange={e => {
              clearFieldError('licensePlate')
              setLicensePlate(e.target.value)
            }}
          />
          {fieldErrors.licensePlate && <p className="mt-2 text-xs text-red-300">{fieldErrors.licensePlate}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Price per day"
            value={pricePerDay}
            onChange={e => {
              clearFieldError('pricePerDay')
              setPricePerDay(e.target.value)
            }}
          />
          {fieldErrors.pricePerDay && <p className="mt-2 text-xs text-red-300">{fieldErrors.pricePerDay}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Seating capacity"
            value={seatingCapacity}
            onChange={e => {
              clearFieldError('seatingCapacity')
              setSeatingCapacity(e.target.value)
            }}
          />
          {fieldErrors.seatingCapacity && <p className="mt-2 text-xs text-red-300">{fieldErrors.seatingCapacity}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Image URL"
            value={imageUrl}
            onChange={e => {
              clearFieldError('imageUrl')
              setImageUrl(e.target.value)
            }}
          />
          {fieldErrors.imageUrl && <p className="mt-2 text-xs text-red-300">{fieldErrors.imageUrl}</p>}
        </div>
        <textarea className="min-h-28 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 md:col-span-2" placeholder="Features, separated by commas" value={features} onChange={e => setFeatures(e.target.value)} />
        <button disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2">
          {loading ? 'Saving...' : 'Add car'}
        </button>
      </form>
    </div>
  )
}
