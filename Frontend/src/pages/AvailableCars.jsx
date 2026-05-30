import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import AuthContext from '../context/AuthContext'
import { useToast } from '../components/ToastContext'

function getTodayDateString() {
  return new Date().toLocaleDateString('en-CA')
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split('T')[0]
}

export default function AvailableCars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingForm, setBookingForm] = useState({})
  const [bookingLoadingId, setBookingLoadingId] = useState(null)
  const { user } = useContext(AuthContext)
  const toast = useToast()
  const navigate = useNavigate()
  const today = useMemo(() => getTodayDateString(), [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/cars')
        setCars(res.data.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load cars')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sortedCars = useMemo(() => cars, [cars])

  async function handleBook(carId) {
    const form = bookingForm[carId] || {}

    if (!user) {
      toast.error('Please log in with a customer account to book.')
      return
    }

    if (user.role !== 'customer') {
      toast.error('Only customer accounts can create bookings.')
      return
    }

    if (!form.startDate) {
      toast.error('Please choose a start date.')
      return
    }

    if (form.startDate < today) {
      toast.error('Start date cannot be earlier than today.')
      return
    }

    let endDate = form.endDate

    if (!endDate) {
      endDate = addDays(form.startDate, 1)
      setBookingForm((current) => ({
        ...current,
        [carId]: { ...form, endDate },
      }))
    }

    if (endDate <= form.startDate) {
      toast.error('End date must be after start date.')
      return
    }

    setBookingLoadingId(carId)

    try {
      const res = await api.post('/bookings', {
        carId,
        startDate: form.startDate,
        endDate,
      })
      toast.success(res.data.message || 'Booking created successfully')
      setBookingForm((current) => ({
        ...current,
        [carId]: { startDate: '', endDate: '' },
      }))
      navigate('/my-bookings')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed')
    } finally {
      setBookingLoadingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Inventory</p>
          <h2 className="text-3xl font-bold text-white">Available cars</h2>
        </div>
        {!user && (
          <Link to="/login" className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">
            Login to book
          </Link>
        )}
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">Loading cars...</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {sortedCars.map((car) => {
            const current = bookingForm[car.id] || { startDate: '', endDate: '' }

            return (
              <article key={car.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-black/20">
                <div className="bg-gradient-to-r from-cyan-500/20 via-slate-900 to-indigo-500/20 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{car.brand} {car.model}</h3>
                      <p className="mt-1 text-sm text-slate-300">{car.year} • {car.license_plate}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 px-4 py-2 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Price / day</p>
                      <p className="text-lg font-semibold text-cyan-200">₹{car.price_per_day}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-300">
                    Agency: <span className="font-medium text-white">{car.agency_name}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Status: <span className="font-medium text-emerald-300">{car.availability_status}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-300">Seats: <span className="font-medium text-white">{car.seating_capacity || car.seatingCapacity || '—'}</span></p>
                  {car.features && <p className="mt-3 text-sm text-slate-300">Features: {car.features}</p>}
                </div>

                <div className="space-y-4 p-6">
                  {car.image_url ? (
                    <img src={car.image_url} alt={`${car.brand} ${car.model}`} className="h-48 w-full rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/60 text-sm text-slate-500">
                      No image available
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Start date</span>
                      <input
                        type="date"
                        value={current.startDate}
                        min={today}
                        onChange={(e) => setBookingForm((state) => ({ ...state, [car.id]: { ...current, startDate: e.target.value } }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>End date</span>
                      <input
                        type="date"
                        value={current.endDate}
                        min={current.startDate || today}
                        onChange={(e) => setBookingForm((state) => ({ ...state, [car.id]: { ...current, endDate: e.target.value } }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>

                  <button
                    disabled={!user || user.role !== 'customer' || bookingLoadingId === car.id || !current.startDate}
                    onClick={() => handleBook(car.id)}
                    className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoadingId === car.id ? 'Booking...' : user?.role === 'customer' ? 'Book this car' : 'Login as customer to book'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
