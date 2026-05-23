import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('staff_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const trackParcel   = (code)                    => api.get(`/parcels/track/${code}`)
export const staffLogin    = (id, password)            => api.post('/auth/login', typeof id === 'string' && id.includes('@') ? { email: id, password } : { staffId: id, password })
export const staffRegister = (data)                    => api.post('/auth/register', data)
export const staffLogout   = ()                        => api.post('/auth/logout')
export const getParcels    = ()                        => api.get('/parcels')
export const createParcel  = (data)                    => api.post('/parcels', data)
export const updateStatus  = (id, status, reason)      => api.patch(`/parcels/${id}/status`, { status, failure_reason: reason })
export const assignParcel  = (id, delivery_man_id)     => api.patch(`/parcels/${id}/assign`, { delivery_man_id })

export default api
