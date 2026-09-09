import api from '@/services/api'
import { base64ToBytes, sealPayload } from './crypto'
import { asList, isUnknownFieldError } from './errors'
import { persistPayloadDraft } from './session'

export async function getEnclavePublicKey () {
  const { data } = await api.get('/api/v1/enclave/public-key')
  return data
}

export async function commitContribution (payload) {
  try {
    const { data } = await api.post('/api/v1/contributions/commit', payload)
    return data
  } catch (err) {
    if (payload.stake_tx && isUnknownFieldError(err)) {
      const { stake_tx: _stakeTx, ...rest } = payload
      const { data } = await api.post('/api/v1/contributions/commit', rest)
      return { ...data, stake_tx: payload.stake_tx }
    }
    throw err
  }
}

export async function revealContribution (id, ciphertext) {
  const { data } = await api.post(`/api/v1/contributions/${id}/reveal`, { ciphertext })
  return data
}

export async function listContributions () {
  const { data } = await api.get('/api/v1/contributions')
  return asList(data)
}

export async function getContribution (id) {
  const { data } = await api.get(`/api/v1/contributions/${id}`)
  return data
}

async function shouldSkipStakeLock (cycleId) {
  try {
    const list = await listContributions()
    return list.some((item) => item.cycle_id === cycleId && item.status === 'rejected')
  } catch {
    return false
  }
}

export async function commitAndStoreDraft ({ cycleId, propertyId, level, prepared, onProgress }) {
  persistPayloadDraft(cycleId, {
    hash: prepared.hash,
    plaintext_b64: prepared.plaintext_b64,
    level,
    envelope: prepared.envelope,
  })

  let stakeTx = ''
  if (!(await shouldSkipStakeLock(cycleId))) {
    onProgress?.('Travando os 10 dólares digitais da sua conta…')
    const { lockStake } = await import('./stake')
    stakeTx = await lockStake()
  }

  onProgress?.('Registrando o envio da safra…')
  const committed = await commitContribution({
    cycle_id: cycleId,
    property_id: propertyId,
    level,
    hash: prepared.hash,
    ...(stakeTx ? { stake_tx: stakeTx } : {}),
  })
  return { ...committed, stake_tx: committed.stake_tx || stakeTx, lock_tx: committed.lock_tx || stakeTx }
}

export async function revealFromBytes (contributionId, plaintextBytes) {
  const enclave = await getEnclavePublicKey()
  const ciphertext = sealPayload(plaintextBytes, enclave.box_public_key)
  return revealContribution(contributionId, ciphertext)
}

export async function revealFromDraft (contributionId, plaintextB64) {
  return revealFromBytes(contributionId, base64ToBytes(plaintextB64))
}

export async function waitForVerdict (id, { interval = 2000, timeout = 90000 } = {}) {
  const start = Date.now()
  let last = await getContribution(id)
  while (Date.now() - start < timeout) {
    if (last.status === 'accepted' || last.status === 'rejected') return last
    await new Promise((resolve) => setTimeout(resolve, interval))
    last = await getContribution(id)
  }
  return last
}
