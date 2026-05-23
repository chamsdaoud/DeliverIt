import { useState, useEffect } from 'react'
import { getParcels } from '../../services/api'
import AgentSidebar from '../../components/agent/AgentSidebar'
import ParcelList from '../../components/agent/ParcelList'
import CreateParcelForm from '../../components/agent/CreateParcelForm'
import AssignParcelModal from '../../components/agent/AssignParcelModal'
import { UserIcon, LogoutIcon } from '../../components/Icons'
import '../../styles/agent.css'
import '../../styles/delivery-badge.css'
import '../../styles/validation.css'

export default function AgentDashboard() {
  const [view, setView]               = useState('parcels')
  const [parcels, setParcels]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [assignTarget, setAssignTarget] = useState(null)

  const fetchParcels = async () => {
    setLoading(true)
    try { const res = await getParcels(); setParcels(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchParcels() }, [])

  const stats = {
    total:      parcels.length,
    pending:    parcels.filter(p => p.status === 'pending').length,
    registered: parcels.filter(p => p.status === 'registered').length,
    assigned:   parcels.filter(p => p.status === 'assigned').length,
    delivered:  parcels.filter(p => p.status === 'delivered').length,
  }

  return (
    <div className="agent-layout">
      <AgentSidebar active={view} onNavigate={setView}/>
      <main className="agent-main">
        <div className="agent-topbar">
          <div>
            <h1 className="agent-title">{view === 'parcels' ? 'Parcels Overview' : 'Register New Parcel'}</h1>
            <p className="agent-subtitle">{view === 'parcels' ? 'Validate and manage all incoming parcels' : 'Fill in the details to register a new parcel'}</p>
          </div>
          <div className="topbar-right">
            <span className="agent-name" style={{display:'flex',alignItems:'center',gap:6}}>
              <UserIcon size={15}/> {localStorage.getItem('staff_name') || 'Agent'}
            </span>
            <button className="btn-logout" style={{display:'flex',alignItems:'center',gap:6}} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
              <LogoutIcon size={14}/> Logout
            </button>
          </div>
        </div>

        {view === 'parcels' && (
          <div className="stats-row" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
            <div className="stat-box"><div className="stat-box-number">{stats.total}</div><div className="stat-box-label">Total</div></div>
            <div className="stat-box" style={{borderColor:'#f97316'}}><div className="stat-box-number">{stats.pending}</div><div className="stat-box-label">Pending Validation</div></div>
            <div className="stat-box" style={{borderColor:'#3b82f6'}}><div className="stat-box-number">{stats.registered}</div><div className="stat-box-label">Registered</div></div>
            <div className="stat-box assigned"><div className="stat-box-number">{stats.assigned}</div><div className="stat-box-label">Assigned</div></div>
            <div className="stat-box delivered"><div className="stat-box-number">{stats.delivered}</div><div className="stat-box-label">Delivered</div></div>
          </div>
        )}

        {view === 'parcels' && (
          <ParcelList
            parcels={parcels}
            loading={loading}
            onAssign={setAssignTarget}
            onRefresh={fetchParcels}
            onCreateNew={() => setView('create')}
          />
        )}
        {view === 'create' && (
          <CreateParcelForm
            onSuccess={() => { setView('parcels'); fetchParcels() }}
            onCancel={() => setView('parcels')}
          />
        )}
      </main>

      {assignTarget && (
        <AssignParcelModal
          parcel={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => { setAssignTarget(null); fetchParcels() }}
        />
      )}
    </div>
  )
}
