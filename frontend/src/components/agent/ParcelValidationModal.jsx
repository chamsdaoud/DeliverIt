import { useState } from 'react'
import { updateStatus } from '../../services/api'
import {
  UserIcon, PhoneIcon, MapPinIcon, HomeIcon,
  PackageIcon, CashIcon, CardIcon, CheckIcon, XIcon, WeightIcon
} from '../Icons'

function InfoRow({ label, value, icon }) {
  return (
    <div className="val-info-row">
      <div className="val-info-label">{label}</div>
      <div className="val-info-value">
        {icon && <span className="val-info-icon">{icon}</span>}
        {value || <span style={{color:'#94a3b8',fontStyle:'italic'}}>Not provided</span>}
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="val-section">
      <div className="val-section-title">
        {icon} {title}
      </div>
      {children}
    </div>
  )
}

export default function ParcelValidationModal({ parcel, onClose, onSuccess }) {
  const [notes, setNotes]       = useState('')
  const [loading, setLoading]   = useState(null) // 'validate' | 'reject'
  const [error, setError]       = useState('')

  const handleValidate = async () => {
    setLoading('validate'); setError('')
    try {
      await updateStatus(parcel.id, 'registered')
      onSuccess('validated')
    } catch {
      setError('Failed to validate parcel.')
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this parcel? It will be marked as failed.')) return
    setLoading('reject'); setError('')
    try {
      await updateStatus(parcel.id, 'failed')
      onSuccess('rejected')
    } catch {
      setError('Failed to reject parcel.')
      setLoading(null)
    }
  }

  const isInterWilaya = parcel.origin_wilaya && parcel.destination_wilaya &&
                        parcel.origin_wilaya !== parcel.destination_wilaya

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="val-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="val-modal-header">
          <div>
            <h2 className="val-modal-title">Parcel Validation</h2>
            <p className="val-modal-sub">Review all information carefully before confirming</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <code className="tracking-code" style={{fontSize:'.9rem'}}>{parcel.tracking_code}</code>
            <button className="modal-close-btn" onClick={onClose}>
              <XIcon size={18}/>
            </button>
          </div>
        </div>

        {/* Delivery type banner */}
        <div className={`val-delivery-banner ${isInterWilaya ? 'inter' : 'intra'}`}>
          <MapPinIcon size={15}/>
          {isInterWilaya
            ? `Inter-wilaya delivery: ${parcel.origin_wilaya || parcel.pickup_location} → ${parcel.destination_wilaya || parcel.destination}`
            : `Same wilaya delivery: ${parcel.origin_wilaya || parcel.pickup_location}`
          }
        </div>

        {error && <div className="form-error" style={{margin:'0 0 16px'}}>{error}</div>}

        {/* Body */}
        <div className="val-modal-body">

          {/* Sender */}
          <Section title="Sender Information" icon={<UserIcon size={15}/>}>
            <InfoRow label="Full Name"     value={parcel.sender_name}  icon={<UserIcon size={13}/>}/>
            <InfoRow label="Phone Number"  value={parcel.sender_phone} icon={<PhoneIcon size={13}/>}/>
            <InfoRow label="Origin Wilaya" value={parcel.origin_wilaya || parcel.pickup_location} icon={<MapPinIcon size={13}/>}/>
          </Section>

          {/* Receiver */}
          <Section title="Receiver Information" icon={<UserIcon size={15}/>}>
            <InfoRow label="Full Name"          value={parcel.receiver_name}  icon={<UserIcon size={13}/>}/>
            <InfoRow label="Phone Number"       value={parcel.receiver_phone} icon={<PhoneIcon size={13}/>}/>
            <InfoRow label="Destination Wilaya" value={parcel.destination_wilaya || parcel.destination} icon={<MapPinIcon size={13}/>}/>
            <InfoRow label="Delivery Address"   value={parcel.delivery_address} icon={<HomeIcon size={13}/>}/>
          </Section>

          {/* Parcel details */}
          <Section title="Parcel Details" icon={<PackageIcon size={15}/>}>
            <InfoRow label="Description"     value={parcel.description}/>
            <InfoRow label="Weight"          value={parcel.weight ? `${parcel.weight} kg` : null} icon={<WeightIcon size={13}/>}/>
            <InfoRow
              label="Payment Method"
              value={parcel.payment_method === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
              icon={parcel.payment_method === 'cash' ? <CashIcon size={13}/> : <CardIcon size={13}/>}
            />
            <InfoRow label="Registered on"   value={new Date(parcel.created_at).toLocaleString('en-GB')}/>
          </Section>

        </div>

        {/* Notes */}
        <div className="val-notes">
          <label className="field-label">Validation Notes (optional)</label>
          <textarea
            className="field-textarea"
            placeholder="Add any notes about this parcel (address verified, phone confirmed, etc.)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="val-actions">
          <button
            className="val-btn-reject"
            onClick={handleReject}
            disabled={!!loading}
          >
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <XIcon size={15}/>
              {loading === 'reject' ? 'Rejecting...' : 'Reject Parcel'}
            </span>
          </button>
          <button
            className="val-btn-validate"
            onClick={handleValidate}
            disabled={!!loading}
          >
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <CheckIcon size={15}/>
              {loading === 'validate' ? 'Validating...' : 'Validate & Confirm'}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}
