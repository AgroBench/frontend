import api from '@/services/api'
import { decryptWalletBlob, generateWalletKeypair } from './crypto'
import { FarmerError, isNotFound } from './errors'
import { storageKeys } from './storage'

// Carteira Phantom da seed (produtor@agrobench.local). O USDC da demo vai pra cá.
// Não substituir por keypair local — senão o lock olha outra conta e o explorer não bate.
const DEMO_PRODUCER_PUBKEY = 'FXsin7UZTGrix1cEe1QpMDFz3a8cDHzVK7h2oisjpzf3'

function blobStorageKey (pubkey) {
  return pubkey ? `${storageKeys.walletBlob}.${pubkey}` : storageKeys.walletBlob
}

export function persistWalletBlob ({ pubkey, encrypted_blob }) {
  if (!encrypted_blob) return
  if (!decryptWalletBlob(encrypted_blob)) return
  localStorage.setItem(storageKeys.walletBlob, encrypted_blob)
  if (pubkey) localStorage.setItem(blobStorageKey(pubkey), encrypted_blob)
}

export function readWalletBlob (pubkey) {
  const candidates = []
  if (pubkey) {
    const scoped = localStorage.getItem(blobStorageKey(pubkey))
    if (scoped) candidates.push(scoped)
  }
  const unscoped = localStorage.getItem(storageKeys.walletBlob)
  if (unscoped && !candidates.includes(unscoped)) candidates.push(unscoped)

  for (const blob of candidates) {
    const opened = decryptWalletBlob(blob)
    if (opened?.secretKey && (!pubkey || opened.pubkey === pubkey)) return blob
  }
  return ''
}

export function canSignWallet (pubkey) {
  return Boolean(readWalletBlob(pubkey))
}

export async function getWallet () {
  const { data } = await api.get('/api/v1/wallet')
  return data
}

export async function createWallet (body) {
  const { data } = await api.post('/api/v1/wallet', body)
  return data
}

async function provisionLocalWallet () {
  const generated = generateWalletKeypair()
  persistWalletBlob(generated)
  try {
    const wallet = await createWallet({
      pubkey: generated.pubkey,
      encrypted_blob: generated.encrypted_blob,
      blob_version: 1,
    })
    persistWalletBlob({ pubkey: wallet.pubkey || generated.pubkey, encrypted_blob: generated.encrypted_blob })
    return wallet
  } catch (err) {
    if (err.response?.status === 409) {
      throw new FarmerError('Não deu para travar os 10 dólares digitais. Esta conta não está disponível neste aparelho.')
    }
    throw err
  }
}

export async function ensureWallet () {
  try {
    const wallet = await getWallet()
    if (canSignWallet(wallet.pubkey)) {
      return { wallet, created: false }
    }
    if (wallet.pubkey === DEMO_PRODUCER_PUBKEY) {
      return { wallet, created: false }
    }
    // Seed (blob dummy "demo") ou outro aparelho: gera keypair neste browser e reivindica o placeholder.
    const claimed = await provisionLocalWallet()
    return { wallet: claimed, created: true }
  } catch (err) {
    if (!isNotFound(err)) throw err
    const wallet = await provisionLocalWallet()
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
