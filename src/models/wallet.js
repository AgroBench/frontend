import api from '@/services/api'
import { generateWalletKeypair } from './crypto'
import { isNotFound } from './errors'
import { storageKeys } from './storage'

function blobStorageKey (pubkey) {
  return pubkey ? `${storageKeys.walletBlob}.${pubkey}` : storageKeys.walletBlob
}

export function persistWalletBlob ({ pubkey, encrypted_blob }) {
  if (!encrypted_blob) return
  localStorage.setItem(blobStorageKey(pubkey), encrypted_blob)
}

export function readWalletBlob (pubkey) {
  if (pubkey) {
    const scoped = localStorage.getItem(blobStorageKey(pubkey))
    if (scoped) return scoped
  }
  return localStorage.getItem(storageKeys.walletBlob) || ''
}

export async function getWallet () {
  const { data } = await api.get('/api/v1/wallet')
  return data
}

export async function createWallet (body) {
  const { data } = await api.post('/api/v1/wallet', body)
  return data
}

export async function ensureWallet () {
  try {
    return { wallet: await getWallet(), created: false }
  } catch (err) {
    if (!isNotFound(err)) throw err
    const generated = generateWalletKeypair()
    persistWalletBlob(generated)
    const wallet = await createWallet({
      pubkey: generated.pubkey,
      encrypted_blob: generated.encrypted_blob,
      blob_version: 1,
    })
    return { wallet, created: true }
  }
}

export async function requestWalletExportOtp () {
  try {
    const { data } = await api.get('/api/v1/wallet/export')
    return { otpRequired: false, data }
  } catch (err) {
    if (err.response?.status === 403 && err.response?.data?.otp_required) {
      return { otpRequired: true }
    }
    throw err
  }
}

export async function exportWallet (code) {
  const { data } = await api.get('/api/v1/wallet/export', { params: { code } })
  persistWalletBlob(data)
  return data
}

export async function listPayouts () {
  const { data } = await api.get('/api/v1/wallet/payouts')
  return Array.isArray(data) ? data : []
}
