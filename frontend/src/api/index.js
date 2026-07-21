import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 &&
        err.response?.data?.code === 'TOKEN_EXPIRED' &&
        !original._retry) {
      original._retry = true
      try {
        await api.post('/auth/refresh')
        return api(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  refresh:  ()     => api.post('/auth/refresh'),
  me:       ()     => api.get('/auth/me'),
}

export const requestsAPI = {
  browse:     (params)        => api.get('/requests', { params }),
  mine:       ()              => api.get('/requests/mine'),
  get:        (id)            => api.get(`/requests/${id}`),
  create:     (data)          => api.post('/requests', data),
  accept:     (id)            => api.post(`/requests/${id}/accept`),
  uploadBill: (id, data)      => api.post(`/requests/${id}/bill`, data),
  advance:    (id, toStatus)  => api.post(`/requests/${id}/advance`, { toStatus }),
  generateOTP:(id)            => api.post(`/requests/${id}/otp`),
  verifyOTP:  (id, otp)       => api.post(`/requests/${id}/verify-otp`, { otp }),
  complete:   (id)            => api.post(`/requests/${id}/complete`),
  cancel:     (id)            => api.delete(`/requests/${id}`),
}

export default api