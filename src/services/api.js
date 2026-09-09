import axios from 'axios'
import { clearSession, session, setTokens } from '@/models/session'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [(data) => {
    if (data == null || data === '') return null
    if (typeof data !== 'string') return data
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }],
})

const AUTH_SKIP = /\/auth\/(login|register|refresh|logout|mfa|recovery)/

api.interceptors.request.use((config) => {
  const token = session.accessToken || localStorage.getItem('agrobench.access_token')
  if (token && !AUTH_SKIP.test(config.url || '')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let rotating = null

async function rotateRefreshToken () {
  const refresh_token = session.refreshToken
  if (!refresh_token) throw new Error('sem refresh token')

  const { data } = await axios.post(
    `${baseURL}/api/v1/auth/refresh`,
    { refresh_token, device: 'web' },
    { headers: { 'Content-Type': 'application/json' } },
  )
  setTokens(data)
  return data
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''

    if (
      status === 401
      && original
      && !original._retry
      && session.refreshToken
      && !AUTH_SKIP.test(url)
    ) {
      original._retry = true
      try {
        if (!rotating) {
          rotating = rotateRefreshToken().finally(() => {
            rotating = null
          })
        }
        await rotating
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${session.accessToken}`
        return api(original)
      } catch {
        clearSession()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login')
        }
      }
    }

    return Promise.reject(error)
  },
)

export { baseURL }
export default api
