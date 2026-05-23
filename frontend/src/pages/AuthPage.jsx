import { useState } from 'react'
import { staffLogin, staffRegister } from '../services/api'
import '../styles/auth.css'

// ── tiny inline SVG icons ──────────────────────────────────────
const MailIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
const LockIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const UserIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const PhoneIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16z"/></svg>
const ShieldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const CheckIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const TruckIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
const BuildingIcon=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
const AdminIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const BackIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>

// ── Left panel ─────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-overlay" />
      <div className="auth-left-content">
        <div className="auth-brand">
          <TruckIcon />
          <span>DeliverIt Systems</span>
        </div>
        <h1>
          Streamlining<br />
          <span className="highlight-blue">Logistics &amp; </span>
          <span className="highlight-orange">Delivery</span>
        </h1>
        <p>Access your personalized dashboard to manage shipments, track deliveries, and oversee operations across our network.</p>
      </div>
    </div>
  )
}

// ── Tab switcher ───────────────────────────────────────────────
function TabSwitcher({ active, onChange }) {
  return (
    <div className="tab-switcher">
      <button className={`tab-btn ${active === 'client' ? 'tab-active' : ''}`} onClick={() => onChange('client')}>
        Client Area
      </button>
      <button className={`tab-btn ${active === 'staff' ? 'tab-active' : ''}`} onClick={() => onChange('staff')}>
        Agency Staff
      </button>
    </div>
  )
}

// ── Input field ────────────────────────────────────────────────
function Field({ label, icon, type = 'text', placeholder, value, onChange, hint }) {
  return (
    <div className="field-group">
      {label && <label className="field-label">{label}</label>}
      <div className="field-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input
          className="field-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}

// ── CLIENT LOGIN ───────────────────────────────────────────────
function ClientLogin({ onSwitch }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const res = await staffLogin(email, password)
localStorage.setItem('staff_token', res.data.token)
localStorage.setItem('staff_role', res.data.role)
localStorage.setItem('staff_name', res.data.name)
window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Welcome back</h2>
      <p className="form-sub">Enter your details to access your account</p>
      {error && <div className="form-error">{error}</div>}
      <Field label="Email Address" icon={<MailIcon/>}  type="email"    placeholder="name@example.com" value={email}    onChange={setEmail}/>
      <Field label="Password"      icon={<LockIcon/>}  type="password" placeholder="••••••••"         value={password} onChange={setPassword}/>
      <div className="form-row">
        <label className="remember-label">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/> Remember me
        </label>
        <a href="#" className="forgot-link">Forgot password?</a>
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
      <p className="form-footer">Don't have an account? <a onClick={() => onSwitch('client-register')} className="link-accent">Register</a></p>
    </form>
  )
}

// ── CLIENT REGISTER ────────────────────────────────────────────
function ClientRegister({ onSwitch }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const u = k => v => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.values(form).some(v => !v)) { setError('Please fill in all fields.'); return }
    if (form.password !== form.confirm)    { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
    const res = await staffRegister({ name: form.name, phone: form.phone, email: form.email, password: form.password })
localStorage.setItem('staff_token', res.data.token)
localStorage.setItem('staff_role', res.data.role)
window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create an account</h2>
      <p className="form-sub">Sign up to track and manage your deliveries</p>
      {error && <div className="form-error">{error}</div>}
      <Field label="Full Name"       icon={<UserIcon/>}  placeholder="John Doe"           value={form.name}     onChange={u('name')}/>
      <Field label="Phone Number"    icon={<PhoneIcon/>} placeholder="+213 555 000 000"   value={form.phone}    onChange={u('phone')}/>
      <Field label="Email Address"   icon={<MailIcon/>}  type="email" placeholder="name@example.com" value={form.email} onChange={u('email')}/>
      <Field label="Password"        icon={<LockIcon/>}  type="password" placeholder="••••••••" value={form.password} onChange={u('password')}/>
      <Field label="Confirm Password"icon={<CheckIcon/>} type="password" placeholder="••••••••" value={form.confirm}  onChange={u('confirm')}/>
      <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
      <p className="form-footer">Already have an account? <a onClick={() => onSwitch('client-login')} className="link-accent">Sign in</a></p>
    </form>
  )
}

// ── STAFF LOGIN ────────────────────────────────────────────────
function StaffLogin({ onSwitch }) {
  const [staffId, setStaffId]   = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!staffId || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
     const res = await staffLogin(staffId, password)
localStorage.setItem('staff_token', res.data.token)
localStorage.setItem('staff_role', res.data.role)
localStorage.setItem('staff_name', res.data.name)
window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Welcome back</h2>
      <p className="form-sub">Enter your Staff ID to access the system</p>
      {error && <div className="form-error">{error}</div>}
      <Field
        label="Staff ID"
        icon={<ShieldIcon/>}
        placeholder="AD-0001, DR-1024, AG-405"
        value={staffId}
        onChange={setStaffId}
        hint="Prefix determines role: ad (Admin), dr (Driver), ag (Agency)"
      />
      <Field label="Password" icon={<LockIcon/>} type="password" placeholder="••••••••" value={password} onChange={setPassword}/>
      <div className="form-row">
        <label className="remember-label">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/> Remember me
        </label>
        <a href="#" className="forgot-link">Forgot password?</a>
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
      <p className="form-footer">Don't have an account? <a onClick={() => onSwitch('staff-register')} className="link-accent">Register</a></p>
    </form>
  )
}

// ── STAFF REGISTER ─────────────────────────────────────────────
const ROLES = [
  { key: 'admin',  label: 'Admin',  icon: <AdminIcon/> },
  { key: 'agency', label: 'Agency', icon: <BuildingIcon/> },
  { key: 'driver', label: 'Driver', icon: <TruckIcon/> },
]

function StaffRegister({ onSwitch }) {
  const [role, setRole]     = useState('agency')
  const [form, setForm]     = useState({ name: '', staffId: '', phone: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const u = k => v => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.staffId || !form.phone || !form.email || !form.password || !form.confirm)
      { setError('Please fill in all fields.'); return }
    if (form.password !== form.confirm)
      { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      const res = await staffRegister({
        name: form.name,
        staffId: form.staffId,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role,
      })
      localStorage.setItem('staff_token', res.data.token)
      localStorage.setItem('staff_role', res.data.role)
      localStorage.setItem('staff_name', res.data.name)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create an account</h2>
      <p className="form-sub">Register your staff profile</p>
      {error && <div className="form-error">{error}</div>}

      <div className="field-group">
        <label className="field-label">Select Role</label>
        <div className="role-grid">
          {ROLES.map(r => (
            <button
              type="button"
              key={r.key}
              className={`role-btn ${role === r.key ? 'role-active' : ''}`}
              onClick={() => setRole(r.key)}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Field label="Full Name"       icon={<UserIcon/>}  placeholder="John Doe"                    value={form.name}     onChange={u('name')}/>
      <Field label="Staff ID"        icon={<ShieldIcon/>}placeholder="AD-0001, DR-1024, AG-405"    value={form.staffId}  onChange={u('staffId')} hint="Prefix determines role: ad (Admin), dr (Driver), ag (Agency)"/>
      <Field label="Phone Number"    icon={<PhoneIcon/>} placeholder="+213 555 000 000"             value={form.phone}    onChange={u('phone')}/>
      <Field label="Email Address"   icon={<MailIcon/>}  type="email" placeholder="name@example.com" value={form.email}  onChange={u('email')}/>
      <Field label="Password"        icon={<LockIcon/>}  type="password" placeholder="••••••••"    value={form.password} onChange={u('password')}/>
      <Field label="Confirm Password"icon={<CheckIcon/>} type="password" placeholder="••••••••"    value={form.confirm}  onChange={u('confirm')}/>

      <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
      <p className="form-footer">Already have an account? <a onClick={() => onSwitch('staff-login')} className="link-accent">Sign in</a></p>
    </form>
  )
}

// ── AUTH PAGE (root) ───────────────────────────────────────────
export default function AuthPage({ onBack }) {
  const [tab,  setTab]  = useState('client')           // 'client' | 'staff'
  const [view, setView] = useState('client-login')     // 'client-login' | 'client-register' | 'staff-login' | 'staff-register'

  const handleTabChange = (t) => {
    setTab(t)
    setView(t === 'client' ? 'client-login' : 'staff-login')
  }

  const handleSwitch = (v) => {
    setView(v)
    setTab(v.startsWith('client') ? 'client' : 'staff')
  }

  return (
    <div className="auth-page">
      <LeftPanel />

      <div className="auth-right">
        {onBack && (
          <button className="auth-back" onClick={onBack}>
            <BackIcon />
          </button>
        )}

        <div className="auth-card">
          <TabSwitcher active={tab} onChange={handleTabChange} />

          {view === 'client-login'    && <ClientLogin    onSwitch={handleSwitch} />}
          {view === 'client-register' && <ClientRegister onSwitch={handleSwitch} />}
          {view === 'staff-login'     && <StaffLogin     onSwitch={handleSwitch} />}
          {view === 'staff-register'  && <StaffRegister  onSwitch={handleSwitch} />}
        </div>
      </div>
    </div>
  )
}
