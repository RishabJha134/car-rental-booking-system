import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-indigo-500/20 p-8 shadow-2xl shadow-cyan-950/30">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-200/80">Car Rental Agency System</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
          Rent smarter. Manage fleets faster. Book with confidence.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
          Browse available cars, create customer bookings, and manage agency inventory from a single clean interface.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/cars" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
            Browse Cars
          </Link>
          <Link to="/register-customer" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
            Create Customer Account
          </Link>
        </div>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200 shadow-xl shadow-black/20">
        <h2 className="text-lg font-semibold text-white">What you can do</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <li>• Customers can register, log in, browse cars, and book dates instantly.</li>
          <li>• Agencies can add, edit, and monitor fleet and booking activity.</li>
          <li>• JWT auth keeps sessions simple and secure.</li>
        </ul>
      </aside>
    </div>
  )
}
