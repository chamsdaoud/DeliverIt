import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TrackingResultPage from './pages/TrackingResultPage'
import AuthPage from './pages/AuthPage'
import AgentDashboard from './pages/agent/AgentDashboard'
import DriverDashboard from './pages/driver/DriverDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import { trackParcel } from './services/api'

function App() {
  const [showAuth, setShowAuth]             = useState(false)
  const [trackingResult, setTrackingResult] = useState(null)
  const [searched, setSearched]             = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  const role  = localStorage.getItem('staff_role')
  const token = localStorage.getItem('staff_token')

  if (token && role) {
    if (role === 'admin')                      return <AdminDashboard />
    if (role === 'agency' || role === 'agent') return <AgentDashboard />
    if (role === 'driver')                     return <DriverDashboard />
  }

  const handleTrack = async (code) => {
    setLoading(true); setError('')
    try {
      const res = await trackParcel(code)
      setTrackingResult(res.data)
      setSearched(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (err.response?.status === 404) {
        setTrackingResult(null)
        setSearched(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError('Could not connect to server. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const handleBack = () => {
    setSearched(false)
    setTrackingResult(null)
    setError('')
  }

  if (showAuth) return <AuthPage onBack={() => setShowAuth(false)}/>

  return (
    <>
      <Navbar onStaffClick={() => setShowAuth(true)}/>
      {searched
        ? <TrackingResultPage parcel={trackingResult} onBack={handleBack}/>
        : <HomePage onTrack={handleTrack} loading={loading} error={error}/>
      }
      <Footer/>
    </>
  )
}

export default App
