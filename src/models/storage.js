const PREFIX = 'agrobench.'

export const storageKeys = {
  access: `${PREFIX}access_token`,
  refresh: `${PREFIX}refresh_token`,
  user: `${PREFIX}user`,
  userId: `${PREFIX}user_id`,
  mfaToken: `${PREFIX}mfa_token`,
  mfaUserId: `${PREFIX}mfa_user_id`,
  walletEncKey: `${PREFIX}wallet_enc_key`,
  walletBlob: `${PREFIX}wallet_blob`,
  lastFarm: `${PREFIX}last_farm`,
  lastInstitution: `${PREFIX}last_institution`,
}

export function readJson (key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJson (key, value) {
  if (value == null) localStorage.removeItem(key)
  else localStorage.setItem(key, JSON.stringify(value))
}
