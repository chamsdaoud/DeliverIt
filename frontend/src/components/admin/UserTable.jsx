import { useState } from 'react'
import api from '../../services/api'
import { PlusIcon, TrashIcon, SearchIcon } from '../Icons'

const ROLE_BADGE = {
  admin:   { bg: '#fdf4ff', color: '#7e22ce', label: 'Admin'  },
  agency:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Agent'  },
  agent:   { bg: '#eff6ff', color: '#1d4ed8', label: 'Agent'  },
  driver:  { bg: '#f0fdf4', color: '#166534', label: 'Driver' },
  client:  { bg: '#fff7ed', color: '#c2410c', label: 'Client' },
}

export default function UserTable({ users, loading, onCreateNew, onRefresh }) {
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('all')
  const [deleting, setDeleting] = useState(null)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/users/${id}`)
      onRefresh()
    } catch {
      alert('Failed to delete user.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="parcels-empty"><div className="spinner"/><p>Loading users...</p></div>

  return (
    <div className="parcels-section">
      <div className="parcels-header">
        <div className="table-filters">
          <div className="field-wrap" style={{width:260,background:'#f8fafc'}}>
            <span className="field-icon"><SearchIcon size={14}/></span>
            <input className="field-input" style={{padding:'8px 0'}} type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="role-select" value={roleFilter} onChange={e => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="agency">Agent</option>
            <option value="driver">Driver</option>
            <option value="client">Client</option>
          </select>
        </div>
        <button className="btn-primary" onClick={onCreateNew}>
          <span style={{display:'flex',alignItems:'center',gap:8}}><PlusIcon size={15}/> Create Staff Account</span>
        </button>
      </div>

      <div className="parcels-table-wrap">
        <table className="parcels-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Staff ID</th>
              <th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign:'center',padding:32,color:'#94a3b8'}}>No users found</td></tr>
            ) : filtered.map(u => {
              const badge = ROLE_BADGE[u.role] || { bg:'#f1f5f9', color:'#475569', label: u.role }
              return (
                <tr key={u.id}>
                  <td><div className="receiver-name">{u.name}</div></td>
                  <td style={{color:'#64748b',fontSize:'.85rem'}}>{u.email}</td>
                  <td><code className="tracking-code">{u.staff_id || '—'}</code></td>
                  <td style={{color:'#64748b',fontSize:'.85rem'}}>{u.phone || '—'}</td>
                  <td>
                    <span style={{background:badge.bg,color:badge.color,padding:'3px 10px',borderRadius:999,fontSize:'.75rem',fontWeight:700}}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <button
                      className="btn-action"
                      style={{background:'#fef2f2',color:'#dc2626',display:'flex',alignItems:'center',gap:5}}
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting === u.id}
                    >
                      <TrashIcon size={13}/> {deleting === u.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
