import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors - only logout on explicit auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout if it's a 401 AND the token was sent (meaning token is invalid/expired)
    // Don't logout on network errors or other issues
    if (error.response?.status === 401 && useAuthStore.getState().token) {
      // Check if this is actually an auth failure, not just a permission issue
      const isAuthEndpoint = error.config?.url?.includes('/auth/')
      if (!isAuthEndpoint) {
        // For non-auth endpoints, just reject - user might need to re-authenticate
        console.warn('Auth token may be expired')
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (username: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  register: (data: { email: string; username: string; password: string; full_name: string; role: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getHourlyStats: () => api.get('/dashboard/hourly-stats'),
  getDailyReport: (date?: string) => api.get('/dashboard/daily-report', { params: { date } }),
}

// Zones
export const zonesApi = {
  getAll: () => api.get('/zones'),
  create: (data: { name: string; description?: string; vehicle_type: string; color: string }) =>
    api.post('/zones', data),
  update: (id: number, data: object) => api.put(`/zones/${id}`, data),
  delete: (id: number) => api.delete(`/zones/${id}`),
  getOccupancy: () => api.get('/zones/occupancy'),
}

// Spaces
export const spacesApi = {
  getAll: (zoneId?: number) => api.get('/spaces', { params: { zone_id: zoneId } }),
  create: (data: object) => api.post('/spaces', data),
  createBulk: (zoneId: number, count: number) => 
    api.post(`/spaces/bulk?zone_id=${zoneId}&count=${count}`),
  update: (id: number, data: object) => api.put(`/spaces/${id}`, data),
  delete: (id: number) => api.delete(`/spaces/${id}`),
}

// Vehicles
export const vehiclesApi = {
  getAll: (plate?: string) => api.get('/vehicles', { params: { plate } }),
  getById: (id: number) => api.get(`/vehicles/${id}`),
  registerEntry: (data: { plate: string; vehicle_type: string; space_id?: number }) =>
    api.post('/vehicles/entry', data),
  registerWashOnlyEntry: (data: { plate: string; vehicle_type: string }) =>
    api.post('/vehicles/entry/wash-only', data),
  registerExit: (entryId: number) => api.post(`/vehicles/exit/${entryId}`),
  getActiveEntries: () => api.get('/vehicles/active/all'),
  update: (id: number, data: object) => api.put(`/vehicles/${id}`, data),
}

// Payments
export const paymentsApi = {
  process: (data: { entry_id: number; method: string; card_last_four?: string }) =>
    api.post('/payments', data),
  getReceipt: (id: number) => api.get(`/payments/receipt/${id}`),
  getToday: () => api.get('/payments/today'),
  getStats: () => api.get('/payments/stats'),
}

// Wash Services
export const washApi = {
  getAll: (status?: string) => api.get('/wash', { params: { status } }),
  create: (data: { entry_id: number; wash_type: string }) => api.post('/wash', data),
  start: (id: number) => api.put(`/wash/${id}/start`),
  complete: (id: number) => api.put(`/wash/${id}/complete`),
  getPending: () => api.get('/wash/pending'),
  getInProgress: () => api.get('/wash/in-progress'),
}

// IoT Devices
export const iotApi = {
  getAll: (type?: string) => api.get('/iot', { params: { device_type: type } }),
  register: (data: { device_id: string; device_type: string; name: string; location: string }) =>
    api.post('/iot', data),
  ping: (deviceId: string, status: string) => api.put(`/iot/${deviceId}/ping?status=${status}`),
  delete: (id: number) => api.delete(`/iot/${id}`),
  getStatus: () => api.get('/iot/status'),
}

// Tariffs
export const tariffsApi = {
  getAll: (vehicleType?: string, serviceType?: string) => 
    api.get('/tariffs', { params: { vehicle_type: vehicleType, service_type: serviceType } }),
  create: (data: { name: string; vehicle_type: string; service_type: string; price: number; time_unit_minutes: number }) =>
    api.post('/tariffs', data),
  update: (id: number, data: object) => api.put(`/tariffs/${id}`, data),
  delete: (id: number) => api.delete(`/tariffs/${id}`),
  seedDefaults: () => api.post('/tariffs/seed-defaults'),
  calculateFee: (vehicleType: string, minutes: number) => 
    api.get('/tariffs/calculate', { params: { vehicle_type: vehicleType, minutes } }),
}

export default api
