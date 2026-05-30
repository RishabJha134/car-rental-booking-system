import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function EditCar() {
  const { id } = useParams()
  const [car, setCar] = useState(null)
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
    const trimmedBrand = String(car?.brand || '').trim()
    const trimmedModel = String(car?.model || '').trim()
    const trimmedLicense = String(car?.license_plate || '').trim()
    const trimmedYear = String(car?.year || '').trim()
    const parsedYear = Number(trimmedYear)
    const parsedPrice = Number(car?.price_per_day)
    const parsedSeats = Number(car?.seating_capacity || car?.seatingCapacity)
    const currentYear = new Date().getFullYear() + 1

    if (!trimmedBrand) errors.brand = 'Brand is required.'
    if (!trimmedModel) errors.model = 'Model is required.'
    if (!trimmedLicense) errors.licensePlate = 'License plate is required.'

    if (!trimmedYear) {
      errors.year = 'Year is required.'
    } else if (!Number.isFinite(parsedYear) || parsedYear < 1980 || parsedYear > currentYear) {
      errors.year = `Enter a valid year (1980-${currentYear}).`
    }

    if (!car?.price_per_day) {
      errors.pricePerDay = 'Price per day is required.'
    } else if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      errors.pricePerDay = 'Price per day must be a positive number.'
    }

    if (!car?.seating_capacity && !car?.seatingCapacity) {
      errors.seatingCapacity = 'Seating capacity is required.'
    } else if (!Number.isFinite(parsedSeats) || parsedSeats <= 0) {
      errors.seatingCapacity = 'Seating capacity must be a positive number.'
    }

    if (car?.image_url && !/^https?:\/\//i.test(String(car.image_url).trim())) {
      errors.imageUrl = 'Image URL must start with http:// or https://.'
    }

    return errors
  }

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
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setError('Please fix the highlighted fields.')
      return
    }

    setFieldErrors({})
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
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.brand || ''}
            onChange={e => {
              clearFieldError('brand')
              setCar({ ...car, brand: e.target.value })
            }}
          />
          {fieldErrors.brand && <p className="mt-2 text-xs text-red-300">{fieldErrors.brand}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.model || ''}
            onChange={e => {
              clearFieldError('model')
              setCar({ ...car, model: e.target.value })
            }}
          />
          {fieldErrors.model && <p className="mt-2 text-xs text-red-300">{fieldErrors.model}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.year || ''}
            onChange={e => {
              clearFieldError('year')
              setCar({ ...car, year: e.target.value })
            }}
          />
          {fieldErrors.year && <p className="mt-2 text-xs text-red-300">{fieldErrors.year}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.license_plate || ''}
            onChange={e => {
              clearFieldError('licensePlate')
              setCar({ ...car, license_plate: e.target.value })
            }}
          />
          {fieldErrors.licensePlate && <p className="mt-2 text-xs text-red-300">{fieldErrors.licensePlate}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.price_per_day || ''}
            onChange={e => {
              clearFieldError('pricePerDay')
              setCar({ ...car, price_per_day: e.target.value })
            }}
          />
          {fieldErrors.pricePerDay && <p className="mt-2 text-xs text-red-300">{fieldErrors.pricePerDay}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.seating_capacity || car.seatingCapacity || ''}
            onChange={e => {
              clearFieldError('seatingCapacity')
              setCar({ ...car, seating_capacity: e.target.value })
            }}
          />
          {fieldErrors.seatingCapacity && <p className="mt-2 text-xs text-red-300">{fieldErrors.seatingCapacity}</p>}
        </div>
        <select className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400" value={car.availability_status || 'available'} onChange={e => setCar({...car, availability_status: e.target.value})}>
          <option value="available">available</option>
          <option value="booked">booked</option>
          <option value="maintenance">maintenance</option>
        </select>
        <div className="md:col-span-2">
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
            value={car.image_url || ''}
            onChange={e => {
              clearFieldError('imageUrl')
              setCar({ ...car, image_url: e.target.value })
            }}
            placeholder="Image URL"
          />
          {fieldErrors.imageUrl && <p className="mt-2 text-xs text-red-300">{fieldErrors.imageUrl}</p>}
        </div>
        <textarea className="min-h-28 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400 md:col-span-2" value={car.features || ''} onChange={e => setCar({...car, features: e.target.value})} placeholder="Features" />
        <button disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2">{loading ? 'Saving...' : 'Save changes'}</button>
      </form>
    </div>
  )
}
