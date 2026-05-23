import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AssignParcelModal({ parcel, onClose, onSuccess }) {
  const [drivers, setDrivers]   = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    // Fetch delivery men from API
    api.get('/users/drivers')
      .then(res => setDrivers(res.data))
      .catch(() => setDrivers([]))
  }, [])

  const handleAssign = async () => {
    if (!selected) { setError('Please select a delivery man.'); return }
    setLoading(true)
    setError('')
    try {
      await api.patch(`/parcels/${parcel.id}/assign`, { delivery_man_id: selected })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <h2 className="modal-title">Assign Delivery Man</h2>
        <p className="modal-sub">Parcel: <strong>{parcel.tracking_code}</strong> → {parcel.destination}</p>

        {error && <div className="form-error">{error}</div>}

        {drivers.length === 0 ? (
          <div className="modal-empty">
            <p>No delivery men registered yet.</p>
            <small>Ask admin to register drivers first.</small>
          </div>
        ) : (
          <div className="driver-list">
            {drivers.map(d => (
              <label key={d.id} className={`driver-option ${selected == d.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="driver"
                  value={d.id}
                  checked={selected == d.id}
                  onChange={() => setSelected(d.id)}
                />
                <div>
                  <div className="driver-name">{d.name}</div>
                  <div className="driver-id">{d.staff_id}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleAssign} disabled={loading || drivers.length === 0}>
            {loading ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
