import { computed, reactive } from 'vue'
import { readJson, storageKeys, writeJson } from './storage'

function loadInitial () {
  return {
    accessToken: localStorage.getItem(storageKeys.access) || '',
    refreshToken: localStorage.getItem(storageKeys.refresh) || '',
    user: readJson(storageKeys.user),
    userId: localStorage.getItem(storageKeys.userId) || '',
    mfaToken: sessionStorage.getItem(storageKeys.mfaToken) || '',
    mfaUserId: sessionStorage.getItem(storageKeys.mfaUserId) || '',
  }
}

export const session = reactive(loadInitial())

export const isAuthenticated = computed(() => Boolean(session.accessToken))
export const currentRole = computed(() => session.user?.role || '')
export const isProducer = computed(() => session.user?.role === 'producer')
export const isInstitution = computed(() => session.user?.role === 'institution')
export const isAdmin = computed(() => session.user?.role === 'admin')

export function setTokens ({ access_token, refresh_token }) {
  session.accessToken = access_token || ''
  session.refreshToken = refresh_token || ''
  if (access_token) localStorage.setItem(storageKeys.access, access_token)
  else localStorage.removeItem(storageKeys.access)
  if (refresh_token) localStorage.setItem(storageKeys.refresh, refresh_token)
  else localStorage.removeItem(storageKeys.refresh)
}

export function setUser (user) {
  session.user = user
  writeJson(storageKeys.user, user)
  if (user?.id) {
    session.userId = user.id
    localStorage.setItem(storageKeys.userId, user.id)
  }
}

export function setMfaChallenge ({ mfa_token, user_id }) {
  session.mfaToken = mfa_token || ''
  session.mfaUserId = user_id || ''
  if (mfa_token) sessionStorage.setItem(storageKeys.mfaToken, mfa_token)
  else sessionStorage.removeItem(storageKeys.mfaToken)
  if (user_id) {
    session.userId = user_id
    sessionStorage.setItem(storageKeys.mfaUserId, user_id)
    localStorage.setItem(storageKeys.userId, user_id)
  }
}

export function clearMfaChallenge () {
  session.mfaToken = ''
  session.mfaUserId = ''
  sessionStorage.removeItem(storageKeys.mfaToken)
  sessionStorage.removeItem(storageKeys.mfaUserId)
}

export function clearSession () {
  session.accessToken = ''
  session.refreshToken = ''
  session.user = null
  session.userId = ''
  clearMfaChallenge()
  localStorage.removeItem(storageKeys.access)
  localStorage.removeItem(storageKeys.refresh)
  localStorage.removeItem(storageKeys.user)
  localStorage.removeItem(storageKeys.userId)
}

const PREFIX_PAYLOAD = 'agrobench.payload.'

export function persistPayloadDraft (cycleId, draft) {
  sessionStorage.setItem(`${PREFIX_PAYLOAD}${cycleId}`, JSON.stringify(draft))
}

export function readPayloadDraft (cycleId) {
  try {
    const raw = sessionStorage.getItem(`${PREFIX_PAYLOAD}${cycleId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPayloadDraft (cycleId) {
  sessionStorage.removeItem(`${PREFIX_PAYLOAD}${cycleId}`)
}

export function saveLastFarm (snapshot) {
  writeJson(storageKeys.lastFarm, snapshot)
}

export function readLastFarm () {
  return readJson(storageKeys.lastFarm)
}

export function saveLastInstitution (record) {
  writeJson(storageKeys.lastInstitution, record)
}

export function readLastInstitution () {
  return readJson(storageKeys.lastInstitution)
}
