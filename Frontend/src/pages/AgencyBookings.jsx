import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function AgencyBookings() {
  const [bookings, setBookings] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [bookingsRes, carsRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/cars/my-cars'),
        ])
        setBookings(bookingsRes.data.data)
        setCars(carsRes.data.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load agency data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Agency</p>
          <h2 className="text-3xl font-bold text-white">Bookings and fleet</h2>
        </div>
        <Link to="/agency/add-car" className="w-fit rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
          Add new car
        </Link>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">My cars</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <div key={car.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">{car.brand} {car.model}</h4>
                  <p className="text-sm text-slate-400">{car.year} • {car.license_plate}</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{car.availability_status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">₹{car.price_per_day} / day</p>
              <Link to={`/agency/edit/${car.id}`} className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-2 text-sm text-cyan-300 transition hover:bg-white/5">
                Edit car
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">Bookings</h3>
        {loading ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">Loading bookings...</div>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-white">{booking.brand} {booking.model}</p>
                    <p className="text-sm text-slate-400">Customer: {booking.customer_name} ({booking.customer_email})</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{booking.status}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p>From: {booking.start_date}</p>
                  <p>To: {booking.end_date}</p>
                  <p>Total: ₹{booking.total_price}</p>
                  <p>Created: {new Date(booking.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
