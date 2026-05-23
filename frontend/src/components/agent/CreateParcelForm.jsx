import { useState } from 'react'
import { createParcel } from '../../services/api'
import { UserIcon, PhoneIcon, MapPinIcon, HomeIcon, WeightIcon, CashIcon, CardIcon, CheckIcon } from '../Icons'

// All 69 Algerian wilayas (updated 2026)
const WILAYAS = [
  "Adrar",              // 01
  "Chlef",              // 02
  "Laghouat",           // 03
  "Oum El Bouaghi",     // 04
  "Batna",              // 05
  "Béjaïa",             // 06
  "Biskra",             // 07
  "Béchar",             // 08
  "Blida",              // 09
  "Bouira",             // 10
  "Tamanrasset",        // 11
  "Tébessa",            // 12
  "Tlemcen",            // 13
  "Tiaret",             // 14
  "Tizi Ouzou",         // 15
  "Alger",              // 16
  "Djelfa",             // 17
  "Jijel",              // 18
  "Sétif",              // 19
  "Saïda",              // 20
  "Skikda",             // 21
  "Sidi Bel Abbès",     // 22
  "Annaba",             // 23
  "Guelma",             // 24
  "Constantine",        // 25
  "Médéa",              // 26
  "Mostaganem",         // 27
  "M'Sila",             // 28
  "Mascara",            // 29
  "Ouargla",            // 30
  "Oran",               // 31
  "El Bayadh",          // 32
  "Illizi",             // 33
  "Bordj Bou Arréridj", // 34
  "Boumerdès",          // 35
  "El Tarf",            // 36
  "Tindouf",            // 37
  "Tissemsilt",         // 38
  "El Oued",            // 39
  "Khenchela",          // 40
  "Souk Ahras",         // 41
  "Tipaza",             // 42
  "Mila",               // 43
  "Aïn Defla",          // 44
  "Naâma",              // 45
  "Aïn Témouchent",     // 46
  "Ghardaïa",           // 47
  "Relizane",           // 48
  "Timimoun",           // 49
  "Bordj Badji Mokhtar",// 50
  "Ouled Djellal",      // 51
  "Béni Abbès",         // 52
  "In Salah",           // 53
  "In Guezzam",         // 54
  "Touggourt",          // 55
  "Djanet",             // 56
  "El M'Ghair",         // 57
  "El Meniaa",          // 58
  // New wilayas added November 2025
  "Aflou",              // 59
  "Barika",             // 60
  "Ksar Chellala",      // 61
  "Messaad",            // 62
  "Aïn Oussera",        // 63
  "Boussaâda",          // 64
  "El Abiodh Sidi Cheikh", // 65
  "El Kantara",         // 66
  "Bir El Ater",        // 67
  "Ksar El Boukhari",   // 68
  "El Aricha",          // 69
]

function Field({ label, icon, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div className="field-group">
      <label className="field-label">{label} {required && <span style={{color:'#dc2626'}}>*</span>}</label>
      <div className="field-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input className="field-input" type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required}/>
      </div>
    </div>
  )
}

function WilayaSelect({ label, value, onChange, required }) {
  return (
    <div className="field-group">
      <label className="field-label">{label} {required && <span style={{color:'#dc2626'}}>*</span>}</label>
      <div className="field-wrap">
        <span className="field-icon"><MapPinIcon size={15}/></span>
        <select
          className="field-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          style={{cursor:'pointer'}}
        >
          <option value="">Select wilaya...</option>
          {WILAYAS.map((w, i) => (
            <option key={i} value={w}>{String(i + 1).padStart(2,'0')} - {w}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function CreateParcelForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    sender_name:        '',
    sender_phone:       '',
    origin_wilaya:      '',
    receiver_name:      '',
    receiver_phone:     '',
    destination_wilaya: '',
    delivery_address:   '',
    description:        '',
    weight:             '',
    payment_method:     'cash',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const u = k => v => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        sender_name:      form.sender_name,
        sender_phone:     form.sender_phone,
        pickup_location:  form.origin_wilaya,
        receiver_name:    form.receiver_name,
        receiver_phone:   form.receiver_phone,
        destination:      form.destination_wilaya,
        delivery_address: form.delivery_address,
        description:      form.description,
        weight:           form.weight,
        payment_method:   form.payment_method,
      }
      const res = await createParcel(payload)
      alert(`Parcel registered successfully!\nTracking code: ${res.data.tracking_code}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parcel.')
    } finally { setLoading(false) }
  }

  const sameWilaya = form.origin_wilaya && form.destination_wilaya && form.origin_wilaya === form.destination_wilaya

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div>
            <h3 className="form-section-title">Sender Information</h3>
            <Field label="Sender Full Name"   placeholder="Full name"         value={form.sender_name}   onChange={u('sender_name')}   required icon={<UserIcon size={15}/>}/>
            <Field label="Sender Phone"        placeholder="+213 555 000 000" value={form.sender_phone}  onChange={u('sender_phone')}  required icon={<PhoneIcon size={15}/>}/>
            <WilayaSelect label="Origin Wilaya" value={form.origin_wilaya} onChange={u('origin_wilaya')} required/>

            <h3 className="form-section-title" style={{marginTop:24}}>Receiver Information</h3>
            <Field label="Receiver Full Name"  placeholder="Full name"         value={form.receiver_name}   onChange={u('receiver_name')}   required icon={<UserIcon size={15}/>}/>
            <Field label="Receiver Phone"       placeholder="+213 555 000 000" value={form.receiver_phone}  onChange={u('receiver_phone')}  required icon={<PhoneIcon size={15}/>}/>
            <WilayaSelect label="Destination Wilaya" value={form.destination_wilaya} onChange={u('destination_wilaya')} required/>
            <Field label="Delivery Address"    placeholder="Street, city"      value={form.delivery_address} onChange={u('delivery_address')} required icon={<HomeIcon size={15}/>}/>
          </div>

          <div>
            <h3 className="form-section-title">Parcel Details</h3>
            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea className="field-textarea" placeholder="What's inside the parcel?" value={form.description} onChange={e => u('description')(e.target.value)} rows={4}/>
            </div>
            <Field label="Weight (kg)" type="number" placeholder="0.0" value={form.weight} onChange={u('weight')} icon={<WeightIcon size={15}/>}/>

            <div className="field-group">
              <label className="field-label">Payment Method <span style={{color:'#dc2626'}}>*</span></label>
              <div className="payment-options">
                <label className={`payment-option ${form.payment_method === 'cash' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="cash" checked={form.payment_method === 'cash'} onChange={() => u('payment_method')('cash')}/>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><CashIcon size={15}/> Cash on Delivery</span>
                </label>
                <label className={`payment-option ${form.payment_method === 'online' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="online" checked={form.payment_method === 'online'} onChange={() => u('payment_method')('online')}/>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><CardIcon size={15}/> Online Payment</span>
                </label>
              </div>
            </div>

            {form.origin_wilaya && form.destination_wilaya && (
              <div className={`delivery-type-badge ${sameWilaya ? 'intra' : 'inter'}`}>
                {sameWilaya
                  ? 'Same wilaya — Direct delivery'
                  : `Inter-wilaya: ${form.origin_wilaya} → ${form.destination_wilaya}`}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <span style={{display:'flex',alignItems:'center',gap:8}}>
              <CheckIcon size={15}/> {loading ? 'Registering...' : 'Register Parcel'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}