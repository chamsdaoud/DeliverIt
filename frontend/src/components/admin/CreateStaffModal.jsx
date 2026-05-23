import { useState } from 'react'
import { staffRegister } from '../../services/api'
import { ShieldIcon, BuildingIcon, TruckIcon, CheckIcon, XIcon } from '../Icons'

const ROLES = [
  { key: 'admin',  label: 'Admin',  icon: <ShieldIcon size={18}/> },
  { key: 'agency', label: 'Agent',  icon: <BuildingIcon size={18}/> },
  { key: 'driver', label: 'Driver', icon: <TruckIcon size={18}/> },
]

export default function CreateStaffModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState({ name:'', staffId:'', phone:'', email:'', password:'', role:'agency' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const u = k => v => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.staffId || !form.phone || !form.email || !form.password) {
      setError('Please fill in all fields.'); return
    }
    setLoading(true); setError('')
    try {
      await staffRegister(form)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:480}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Create Staff Account</h2>
        <p className="modal-sub">Add a new agent or driver to the system</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Role</label>
            <div style={{display:'flex',gap:10}}>
              {ROLES.map(r => (
                <button
                  type="button" key={r.key}
                  className={`role-btn ${form.role === r.key ? 'role-active' : ''}`}
                  onClick={() => u('role')(r.key)}
                  style={{flex:1}}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <div className="field-wrap"><input className="field-input" placeholder="John Doe" value={form.name} onChange={e => u('name')(e.target.value)}/></div>
            </div>
            <div className="field-group">
              <label className="field-label">Staff ID</label>
              <div className="field-wrap"><input className="field-input" placeholder="AG-001 / DR-001 / AD-001" value={form.staffId} onChange={e => u('staffId')(e.target.value)}/></div>
            </div>
            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <div className="field-wrap"><input className="field-input" placeholder="+213 555 000 000" value={form.phone} onChange={e => u('phone')(e.target.value)}/></div>
            </div>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className="field-wrap"><input className="field-input" type="email" placeholder="staff@deliverit.dz" value={form.email} onChange={e => u('email')(e.target.value)}/></div>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap"><input className="field-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => u('password')(e.target.value)}/></div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <CheckIcon size={15}/> {loading ? 'Creating...' : 'Create Account'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
