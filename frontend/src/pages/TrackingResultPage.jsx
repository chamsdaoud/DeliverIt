import { useEffect, useRef, useState } from 'react'
import Stepper from '../components/Stepper'
import StatusHistory from '../components/StatusHistory'
import { PackageIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon, CashIcon, CardIcon, ArrowLeftIcon, CheckIcon } from '../components/Icons'
import api from '../services/api'
import '../styles/history.css'

const WILAYA_COORDS = {
  "Adrar": [27.87, -0.29], "Chlef": [36.16, 1.33], "Laghouat": [33.8, 2.87],
  "Oum El Bouaghi": [35.87, 7.11], "Batna": [35.55, 6.17], "Béjaïa": [36.75, 5.08],
  "Biskra": [34.85, 5.73], "Béchar": [31.62, -2.22], "Blida": [36.47, 2.83],
  "Bouira": [36.37, 3.9], "Tamanrasset": [22.78, 5.52], "Tébessa": [35.4, 8.12],
  "Tlemcen": [34.88, -1.32], "Tiaret": [35.37, 1.32], "Tizi Ouzou": [36.72, 4.05],
  "Alger": [36.74, 3.06], "Djelfa": [34.67, 3.25], "Jijel": [36.82, 5.77],
  "Sétif": [36.19, 5.41], "Saïda": [34.83, 0.15], "Skikda": [36.87, 6.9],
  "Sidi Bel Abbès": [35.18, -0.63], "Annaba": [36.9, 7.77], "Guelma": [36.46, 7.43],
  "Constantine": [36.37, 6.61], "Médéa": [36.26, 2.75], "Mostaganem": [35.93, 0.09],
  "M'Sila": [35.7, 4.54], "Mascara": [35.4, 0.14], "Ouargla": [31.95, 5.32],
  "Oran": [35.69, -0.63], "El Bayadh": [33.68, 1.02], "Illizi": [26.48, 8.47],
  "Bordj Bou Arréridj": [36.07, 4.76], "Boumerdès": [36.76, 3.48], "El Tarf": [36.77, 8.31],
  "Tindouf": [27.67, -8.14], "Tissemsilt": [35.6, 1.81], "El Oued": [33.36, 6.86],
  "Khenchela": [35.43, 7.14], "Souk Ahras": [36.28, 7.95], "Tipaza": [36.59, 2.45],
  "Mila": [36.45, 6.26], "Aïn Defla": [36.26, 1.97], "Naâma": [33.27, -0.31],
  "Aïn Témouchent": [35.3, -1.14], "Ghardaïa": [32.49, 3.67], "Relizane": [35.74, 0.56],
  "Timimoun": [29.26, 0.24], "Bordj Badji Mokhtar": [21.33, 0.95],
  "Ouled Djellal": [34.42, 5.07], "Béni Abbès": [30.13, -2.17],
  "In Salah": [27.2, 2.47], "In Guezzam": [19.57, 5.77], "Touggourt": [33.1, 6.07],
  "Djanet": [24.55, 9.48], "El M'Ghair": [33.95, 5.93], "El Meniaa": [30.58, 2.88],
  "Aflou": [34.11, 2.1], "Barika": [35.39, 5.36], "Ksar Chellala": [35.18, 2.32],
  "Messaad": [34.15, 3.5], "Aïn Oussera": [35.45, 2.9], "Boussaâda": [35.21, 4.18],
  "El Abiodh Sidi Cheikh": [32.89, 0.53], "El Kantara": [35.22, 5.69],
  "Bir El Ater": [34.74, 7.93], "Ksar El Boukhari": [35.88, 2.75], "El Aricha": [34.22, -1.26],
}

function DeliveryMap({ from, to }) {
  const mapRef     = useRef(null)
  const mapInitRef = useRef(false)
  useEffect(() => {
    if (mapInitRef.current) return
    mapInitRef.current = true
    const fromCoords = WILAYA_COORDS[from] || [36.74, 3.06]
    const toCoords   = WILAYA_COORDS[to]   || [35.69, -0.63]
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = window.L; if (!mapRef.current) return
      const map = L.map(mapRef.current, { zoomControl: true })
        .setView([(fromCoords[0]+toCoords[0])/2,(fromCoords[1]+toCoords[1])/2], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OpenStreetMap contributors' }).addTo(map)
      const greenIcon = L.divIcon({ html:`<div style="width:16px;height:16px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`, className:'', iconAnchor:[8,8] })
      const navyIcon  = L.divIcon({ html:`<div style="width:16px;height:16px;background:#1a2e6e;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`, className:'', iconAnchor:[8,8] })
      L.marker(fromCoords, { icon: greenIcon }).addTo(map).bindPopup(`<strong>Origin:</strong> ${from}`)
      L.marker(toCoords,   { icon: navyIcon  }).addTo(map).bindPopup(`<strong>Destination:</strong> ${to}`)
      L.polyline([fromCoords, toCoords], { color:'#f97316', weight:3, dashArray:'10 8', opacity:.9 }).addTo(map)
      map.fitBounds(L.latLngBounds([fromCoords, toCoords]), { padding:[40,40] })
    }
    document.head.appendChild(script)
  }, [from, to])
  return (
    <div className="route-card">
      <h3>Delivery Route</h3>
      <div ref={mapRef} style={{ height:280, borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:20, marginTop:12, fontSize:'.82rem', color:'#64748b' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:12, background:'#22c55e', borderRadius:'50%', display:'inline-block' }}/> Origin: {from}
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:12, background:'#1a2e6e', borderRadius:'50%', display:'inline-block' }}/> Destination: {to}
        </span>
      </div>
    </div>
  )
}

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display:'flex', gap:6 }}>
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ fontSize:'2rem', cursor: readonly?'default':'pointer', color: star<=(hovered||value)?'#f97316':'#e2e8f0', transition:'color .15s', userSelect:'none' }}>★</span>
      ))}
    </div>
  )
}

function ConfirmReceptionModal({ parcel, onClose, onSuccess }) {
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    setLoading(true); setError('')
    try {
      await api.post(`/parcels/${parcel.id}/confirm-reception`, { rating, comment })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm reception.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ width:460 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <CheckIcon size={28} style={{ color:'#22c55e' }}/>
          </div>
          <h2 className="modal-title">Confirm Reception</h2>
          <p className="modal-sub">Parcel: <strong>{parcel.tracking_code}</strong></p>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="field-group">
          <label className="field-label">Rate your delivery experience</label>
          <StarRating value={rating} onChange={setRating}/>
          <p style={{ fontSize:'.78rem', color:'#94a3b8', marginTop:4 }}>
            {rating===1&&'Very poor'}{rating===2&&'Poor'}{rating===3&&'Average'}{rating===4&&'Good'}{rating===5&&'Excellent!'}
          </p>
        </div>
        <div className="field-group">
          <label className="field-label">Comment (optional)</label>
          <textarea className="field-textarea" placeholder="Share your experience..." rows={3} value={comment} onChange={e => setComment(e.target.value)}/>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading||rating===0}
            style={{ background: rating>0?'#22c55e':undefined }}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              <CheckIcon size={15}/> {loading?'Confirming...':'Confirm Reception'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_STEPS = ['pending','registered','assigned','out_for_delivery','delivered']
const STEP_LABELS  = ['Order Received','Registered','In Transit','On the Way','Delivered']

function transformParcel(p) {
  const currentIndex = STATUS_STEPS.indexOf(p.status)
  const steps = STATUS_STEPS.map((s, i) => ({
    label:  STEP_LABELS[i],
    date:   i <= currentIndex ? new Date(p.updated_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—',
    status: i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending',
  }))
  return {
    id: p.tracking_code, steps,
    from:    p.origin_wilaya      || p.pickup_location || 'Origin',
    to:      p.destination_wilaya || p.destination     || 'Destination',
    pickup:  { name: p.sender_name||'Sender',  address: p.pickup_location||'—' },
    dropoff: { name: p.receiver_name,          address: p.delivery_address||p.destination||'—' },
    customer:{ fullName: p.receiver_name, phone: p.receiver_phone },
    pickupDate:   new Date(p.created_at).toLocaleString('en-US',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),
    estimateDrop: '3–5 Days',
    returnTime:   'In 7 Days',
  }
}

export default function TrackingResultPage({ parcel, onBack }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmed, setConfirmed]     = useState(false)
  const [currentParcel, setCurrentParcel] = useState(parcel)

  if (!currentParcel) return (
    <div className="result-page">
      <button className="back-link" onClick={onBack} style={{display:'flex',alignItems:'center',gap:8}}>
        <ArrowLeftIcon size={16}/> Back to Tracking
      </button>
      <div className="not-found">
        <PackageIcon size={64} style={{opacity:.2,marginBottom:16}}/>
        <h3>Parcel Not Found</h3>
        <p>We could not find a parcel with that tracking number.<br/>Please check and try again.</p>
      </div>
    </div>
  )

  const { id, steps, from, to, pickup, dropoff, customer, pickupDate, estimateDrop, returnTime } = transformParcel(currentParcel)
  const isDelivered = currentParcel.status === 'delivered' || currentParcel.status === 'confirmed'
  const isConfirmed = currentParcel.status === 'confirmed' || confirmed

  const handleConfirmSuccess = async () => {
    setShowConfirm(false)
    setConfirmed(true)
    // Refresh parcel to get updated history
    try {
      const res = await api.get(`/parcels/track/${currentParcel.tracking_code}`)
      setCurrentParcel(res.data)
    } catch {}
  }

  return (
    <div className="result-page">
      <button className="back-link" onClick={onBack} style={{display:'flex',alignItems:'center',gap:8}}>
        <ArrowLeftIcon size={16}/> Back to Tracking
      </button>
      <h2>Order #{id}</h2>

      <Stepper steps={steps}/>

      {isDelivered && !isConfirmed && (
        <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:16, padding:'20px 24px', marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <p style={{fontWeight:700,color:'#166534',marginBottom:4}}>Your parcel has been delivered!</p>
            <p style={{fontSize:'.88rem',color:'#4ade80'}}>Please confirm reception and rate your delivery experience.</p>
          </div>
          <button className="btn-primary" style={{background:'#22c55e',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:8}} onClick={() => setShowConfirm(true)}>
            <CheckIcon size={15}/> Confirm Reception
          </button>
        </div>
      )}

      {isConfirmed && (
        <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:16, padding:'20px 24px', marginBottom:28, display:'flex', alignItems:'center', gap:16 }}>
          <CheckIcon size={24} style={{color:'#22c55e',flexShrink:0}}/>
          <div>
            <p style={{fontWeight:700,color:'#166534',marginBottom:4}}>Reception confirmed</p>
            {currentParcel.rating && (
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{color:s<=currentParcel.rating?'#f97316':'#e2e8f0',fontSize:'1.2rem'}}>★</span>
                ))}
                <span style={{fontSize:'.82rem',color:'#64748b',marginLeft:4}}>Your rating</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <h3 style={{display:'flex',alignItems:'center',gap:8}}><PackageIcon size={16} style={{color:'#1a2e6e'}}/> Order Information</h3>
          <div className="info-row"><div className="info-label">Pickup Date</div><div className="info-value"><CalendarIcon size={14} style={{color:'#94a3b8'}}/> {pickupDate}</div></div>
          <div className="info-row"><div className="info-label">Estimate Drop</div><div className="info-value"><CalendarIcon size={14} style={{color:'#94a3b8'}}/> {estimateDrop}</div></div>
          <div className="info-row"><div className="info-label">Return Available</div><div className="info-value"><ClockIcon size={14} style={{color:'#94a3b8'}}/> {returnTime}</div></div>
          <div className="info-row">
            <div className="info-label">Payment</div>
            <div className="info-value">
              {currentParcel.payment_method==='cash'?<><CashIcon size={14} style={{color:'#94a3b8'}}/> Cash on Delivery</>:<><CardIcon size={14} style={{color:'#94a3b8'}}/> Online Payment</>}
            </div>
          </div>
        </div>
        <div className="info-card">
          <h3 style={{display:'flex',alignItems:'center',gap:8}}><MapPinIcon size={16} style={{color:'#1a2e6e'}}/> Locations</h3>
          <div className="info-row" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
            <div className="info-label">Pickup Location</div>
            <div style={{fontWeight:700,fontSize:'.9rem',color:'#1e293b'}}>{pickup.name}</div>
            <div style={{fontSize:'.84rem',color:'#64748b'}}>{pickup.address}</div>
          </div>
          <hr className="divider-h"/>
          <div className="info-row" style={{flexDirection:'column',alignItems:'flex-start',gap:4}}>
            <div className="info-label">Dropoff Location</div>
            <div style={{fontWeight:700,fontSize:'.9rem',color:'#1e293b'}}>{dropoff.name}</div>
            <div style={{fontSize:'.84rem',color:'#64748b'}}>{dropoff.address}</div>
          </div>
        </div>
        <div className="info-card">
          <h3 style={{display:'flex',alignItems:'center',gap:8}}><UserIcon size={16} style={{color:'#1a2e6e'}}/> Receiver Details</h3>
          <div className="info-row"><div className="info-label">Full Name</div><div style={{fontWeight:700,fontSize:'.9rem',color:'#1e293b'}}>{customer.fullName}</div></div>
          <div className="info-row"><div className="info-label">Phone</div><div className="info-value" style={{color:'#64748b',fontWeight:400}}><PhoneIcon size={14} style={{color:'#94a3b8'}}/> {customer.phone}</div></div>
          <div className="info-row"><div className="info-label">Status</div><div style={{fontWeight:700,fontSize:'.88rem',color:'#1a2e6e',textTransform:'capitalize'}}>{currentParcel.status?.replace(/_/g,' ')}</div></div>
        </div>
      </div>

      {/* Status History Timeline */}
      <StatusHistory history={currentParcel.status_history}/>

      <DeliveryMap from={from} to={to}/>

      {showConfirm && (
        <ConfirmReceptionModal parcel={currentParcel} onClose={() => setShowConfirm(false)} onSuccess={handleConfirmSuccess}/>
      )}
    </div>
  )
}
