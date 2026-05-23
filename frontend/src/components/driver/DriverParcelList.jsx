import { useState } from 'react'
import { updateStatus } from '../../services/api'
import { MapPinIcon, HomeIcon, CashIcon, CardIcon, CheckIcon, XIcon, TruckIcon, PackageIcon } from '../Icons'

const STATUS_COLORS = {
  pending_acceptance: { bg: '#fff7ed', color: '#c2410c', label: 'Pending Acceptance' },
  assigned:           { bg: '#eff6ff', color: '#1d4ed8', label: 'Assigned' },
  accepted:           { bg: '#f0fdf4', color: '#15803d', label: 'Accepted' },
  out_for_delivery:   { bg: '#fdf4ff', color: '#7e22ce', label: 'Out for Delivery' },
  delivered:          { bg: '#f0fdf4', color: '#166534', label: 'Delivered' },
  failed:             { bg: '#fef2f2', color: '#dc2626', label: 'Failed' },
  refused:            { bg: '#fef2f2', color: '#dc2626', label: 'Refused' },
}

// ── Report Issue Modal ────────────────────────────────────────
function ReportIssueModal({ parcel, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const issues = [
    'Address not found',
    'Receiver not available',
    'Receiver refused delivery',
    'Damaged parcel',
    'Wrong address',
    'Other',
  ]

  const handleSubmit = async () => {
    if (!reason) { setError('Please select or enter a reason.'); return }
    setLoading(true)
    try {
      await updateStatus(parcel.id, 'failed', reason)
      onSuccess()
    } catch {
      setError('Failed to report issue.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:440}} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><XIcon size={18}/></button>
        <h2 className="modal-title">Report Delivery Issue</h2>
        <p className="modal-sub">Parcel: <strong>{parcel.tracking_code}</strong></p>

        {error && <div className="form-error">{error}</div>}

        <div className="field-group">
          <label className="field-label">Reason for Failed Delivery</label>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
            {issues.map(issue => (
              <label key={issue} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',border:`1.5px solid ${reason===issue?'#1a2e6e':'#e2e8f0'}`,borderRadius:10,cursor:'pointer',background:reason===issue?'#eff3ff':'#f8fafc',fontFamily:'inherit',fontSize:'.88rem',fontWeight:reason===issue?700:500,color:reason===issue?'#1a2e6e':'#475569',transition:'all .2s'}}>
                <input type="radio" name="reason" value={issue} checked={reason===issue} onChange={() => setReason(issue)} style={{accentColor:'#1a2e6e'}}/>
                {issue}
              </label>
            ))}
          </div>
          <label className="field-label">Additional Notes (optional)</label>
          <textarea
            className="field-textarea"
            placeholder="Add any additional details..."
            rows={2}
            value={reason === issues.slice(-1)[0] ? '' : ''}
            onChange={e => reason === 'Other' && setReason(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            style={{background:'#dc2626'}}
            onClick={handleSubmit}
            disabled={loading}
          >
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <XIcon size={15}/> {loading ? 'Reporting...' : 'Mark as Failed'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Parcel Card ───────────────────────────────────────────────
function ParcelCard({ parcel, onRefresh }) {
  const [loading, setLoading]       = useState(null)
  const [showIssue, setShowIssue]   = useState(false)
  const s = STATUS_COLORS[parcel.status] || { bg:'#f1f5f9', color:'#475569', label: parcel.status }

  const handle = async (status) => {
    setLoading(status)
    try { await updateStatus(parcel.id, status); onRefresh() }
    catch { alert('Failed to update status') }
    finally { setLoading(null) }
  }

  return (
    <>
      <div className="driver-card">
        <div className="driver-card-header">
          <code className="tracking-code">{parcel.tracking_code}</code>
          <span style={{background:s.bg,color:s.color,padding:'4px 12px',borderRadius:999,fontSize:'.78rem',fontWeight:700}}>
            {s.label}
          </span>
        </div>

        <div className="driver-card-body">
          <div className="driver-info-grid">
            <div className="driver-info-item">
              <span className="driver-info-label">RECEIVER</span>
              <span className="driver-info-value">{parcel.receiver_name}</span>
              <span className="driver-info-sub">{parcel.receiver_phone}</span>
            </div>
            <div className="driver-info-item">
              <span className="driver-info-label">DESTINATION</span>
              <span className="driver-info-value" style={{display:'flex',alignItems:'center',gap:5}}>
                <MapPinIcon size={14}/> {parcel.destination_wilaya || parcel.destination}
              </span>
            </div>
            <div className="driver-info-item">
              <span className="driver-info-label">DELIVERY ADDRESS</span>
              <span className="driver-info-value" style={{display:'flex',alignItems:'center',gap:5}}>
                <HomeIcon size={14}/> {parcel.delivery_address || parcel.pickup_location || '—'}
              </span>
            </div>
            <div className="driver-info-item">
              <span className="driver-info-label">PAYMENT</span>
              <span className="driver-info-value" style={{display:'flex',alignItems:'center',gap:5}}>
                {parcel.payment_method === 'cash'
                  ? <><CashIcon size={14}/> Cash on Delivery</>
                  : <><CardIcon size={14}/> Online</>}
              </span>
            </div>
          </div>
        </div>

        <div className="driver-card-actions">
          {/* Step 1: Accept or Refuse */}
          {parcel.status === 'assigned' && (
            <>
              <button
                className="driver-btn"
                style={{background:'#fef2f2',color:'#dc2626'}}
                onClick={() => handle('refused')}
                disabled={!!loading}
              >
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <XIcon size={15}/> {loading==='refused' ? 'Refusing...' : 'Refuse'}
                </span>
              </button>
              <button
                className="driver-btn"
                style={{background:'#f0fdf4',color:'#166534'}}
                onClick={() => handle('accepted')}
                disabled={!!loading}
              >
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <CheckIcon size={15}/> {loading==='accepted' ? 'Accepting...' : 'Accept'}
                </span>
              </button>
            </>
          )}

          {/* Step 2: Start delivery */}
          {parcel.status === 'accepted' && (
            <button
              className="driver-btn out-for-delivery"
              onClick={() => handle('out_for_delivery')}
              disabled={!!loading}
            >
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <TruckIcon size={15}/> {loading ? 'Updating...' : 'Start Delivery'}
              </span>
            </button>
          )}

          {/* Step 3: Delivered or Issue */}
          {parcel.status === 'out_for_delivery' && (
            <>
              <button
                className="driver-btn delivered"
                onClick={() => handle('delivered')}
                disabled={!!loading}
              >
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <CheckIcon size={15}/> {loading==='delivered' ? 'Updating...' : 'Mark Delivered'}
                </span>
              </button>
              <button
                className="driver-btn failed"
                onClick={() => setShowIssue(true)}
                disabled={!!loading}
              >
                <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <XIcon size={15}/> Report Issue
                </span>
              </button>
            </>
          )}

          {parcel.status === 'delivered' && (
            <div className="driver-done success">
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <CheckIcon size={15}/> Successfully Delivered
              </span>
            </div>
          )}
          {parcel.status === 'failed' && (
            <div className="driver-done danger">
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <XIcon size={15}/> Delivery Failed
              </span>
            </div>
          )}
          {parcel.status === 'refused' && (
            <div className="driver-done danger">
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <XIcon size={15}/> Delivery Refused
              </span>
            </div>
          )}
        </div>
      </div>

      {showIssue && (
        <ReportIssueModal
          parcel={parcel}
          onClose={() => setShowIssue(false)}
          onSuccess={() => { setShowIssue(false); onRefresh() }}
        />
      )}
    </>
  )
}

// ── List ──────────────────────────────────────────────────────
export default function DriverParcelList({ parcels, loading, onRefresh }) {
  if (loading) return <div className="parcels-empty"><div className="spinner"/><p>Loading your parcels...</p></div>
  if (parcels.length === 0) return (
    <div className="parcels-empty">
      <PackageIcon size={48} style={{opacity:.2,marginBottom:16}}/>
      <h3>No parcels found</h3>
      <p>No parcels in this category</p>
    </div>
  )
  return <div className="driver-cards-grid">{parcels.map(p => <ParcelCard key={p.id} parcel={p} onRefresh={onRefresh}/>)}</div>
}
