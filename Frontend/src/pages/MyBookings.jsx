import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/bookings')
        setBookings(res.data.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Customer</p>
        <h2 className="text-3xl font-bold text-white">My bookings</h2>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">No bookings yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{booking.brand} {booking.model}</h3>
                  <p className="mt-1 text-sm text-slate-400">{booking.license_plate}</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{booking.status}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-300">
                <p>Agency: {booking.agency_name}</p>
                <p>From: {booking.start_date}</p>
                <p>To: {booking.end_date}</p>
                <p>Total: ₹{booking.total_price}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}