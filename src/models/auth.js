import api from '@/services/api'
import { clearMfaChallenge, clearSession, session, setMfaChallenge, setTokens, setUser } from './session'

export async function registerProducer (payload) {
  const { data } = await api.post('/api/v1/auth/register', payload)
  setMfaChallenge(data)
  return data
}

export async function login (email, password) {
  const { data } = await api.post('/api/v1/auth/login', { email, password })
  if (data?.mfa_required || (data?.mfa_token && !data?.access_token)) {
    setMfaChallenge(data)
    return { kind: 'mfa', ...data }
  }
  setTokens(data)
  clearMfaChallenge()
  await fetchMe()
  return { kind: 'tokens', ...data }
}

export async function verifyMfa (code) {
  const { data } = await api.post('/api/v1/auth/mfa/verify', {
    mfa_token: session.mfaToken,
    code,
  })
  setTokens(data)
  clearMfaChallenge()
  await fetchMe()
  return data
}

export async function fetchMockOtp (userId = session.mfaUserId || session.userId) {
  if (!userId) throw new Error('Ainda não temos como buscar o código. Entre de novo e peça outro.')
  const { data } = await api.get(`/api/v1/admin/otp/${userId}`)
  return data
}

export async function fetchMe () {
  const { data } = await api.get('/api/v1/me')
  setUser(data)
  return data
}

export async function recoveryStart (payload) {
  await api.post('/api/v1/auth/recovery/start', payload)
}

export async function recoveryConfirm (payload) {
  await api.post('/api/v1/auth/recovery/confirm', payload)
}

export async function logout () {
  const refresh_token = session.refreshToken
  try {
    if (refresh_token) {
      await api.post('/api/v1/auth/logout', { refresh_token })
    }
  } finally {
    clearSession()
  }
}

export function homePathForRole (role = session.user?.role) {
  if (role === 'admin') return '/admin'
  if (role === 'institution') return '/inst'
  return '/app'
}
