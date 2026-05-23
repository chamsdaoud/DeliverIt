import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import api from '../services/api'

export default function HomePage({ onTrack, loading, error }) {
  const [input, setInput] = useState('')
  const [stats, setStats] = useState({
    wilayas: 69,
    delivered: 0,
    successRate: 0,
  })

  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(() => {}) // keep defaults if API fails
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) onTrack(input.trim().toUpperCase())
  }

  return (
    <>
      <section className="hero">
        <h1>Welcome to DeliverIt</h1>
        <p>Algeria's most trusted delivery service, connecting communities across the nation with speed, reliability, and care.</p>
        <div className="stats-grid">
          <StatCard icon="📍" number={`${stats.wilayas}`}          label="Wilayas Covered" />
          <StatCard icon="👥" number={`${stats.delivered}+`}       label="Parcels Delivered" />
          <StatCard icon="📈" number={`${stats.successRate}%`}     label="Delivery Success Rate" />
        </div>
      </section>

      <section className="track-section" id="track">
        <h2>Track Your Parcel</h2>
        <p>Enter your tracking code to see real-time updates</p>
        <form className="track-form" onSubmit={handleSubmit}>
          <input
            className="track-input"
            type="text"
            placeholder="Enter your Tracking Code (e.g., DZ-2026-XYZ)"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="track-btn" disabled={loading}>
            🔍 {loading ? 'Searching...' : 'Track Parcel'}
          </button>
        </form>
        {error && <p style={{ color: '#dc2626', marginTop: 16, fontSize: '.9rem' }}>{error}</p>}
      </section>
    </>
  )
}
