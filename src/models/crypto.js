import bs58 from 'bs58'
import nacl from 'tweetnacl'
import sealedBox from 'tweetnacl-sealedbox-js'
import { decodeBase64, encodeBase64 } from 'tweetnacl-util'
import { storageKeys } from './storage'

export function hexToBytes (hex) {
  const clean = String(hex || '').trim()
  if (clean.length % 2 !== 0) throw new Error('hex inválido')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export function randomHex (byteLength = 16) {
  const bytes = nacl.randomBytes(byteLength)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function getOrCreateWalletEncKey () {
  let raw = localStorage.getItem(storageKeys.walletEncKey)
  if (!raw) {
    raw = encodeBase64(nacl.randomBytes(32))
    localStorage.setItem(storageKeys.walletEncKey, raw)
  }
  const decoded = decodeBase64(raw)
  if (decoded.length !== 32) {
    const next = nacl.randomBytes(32)
    localStorage.setItem(storageKeys.walletEncKey, encodeBase64(next))
    return next
  }
  return decoded
}

export function generateWalletKeypair () {
  const keyPair = nacl.sign.keyPair()
  const encKey = getOrCreateWalletEncKey()
  const nonce = nacl.randomBytes(24)
  const boxed = nacl.secretbox(keyPair.secretKey, nonce, encKey)
  const packed = new Uint8Array(nonce.length + boxed.length)
  packed.set(nonce, 0)
  packed.set(boxed, nonce.length)

  return {
    pubkey: bs58.encode(keyPair.publicKey),
    encrypted_blob: encodeBase64(packed),
    blob_version: 1,
  }
}

export function decryptWalletBlob (encryptedBlob) {
  const packed = decodeBase64(encryptedBlob)
  const nonce = packed.slice(0, 24)
  const boxed = packed.slice(24)
  const secretKey = nacl.secretbox.open(boxed, nonce, getOrCreateWalletEncKey())
  if (!secretKey) return null
  const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
  return {
    pubkey: bs58.encode(keyPair.publicKey),
    secretKey: keyPair.secretKey,
  }
}

export function sealPayload (plaintextBytes, boxPublicKeyHex) {
  const pub = hexToBytes(boxPublicKeyHex)
  const sealed = sealedBox.seal(plaintextBytes, pub)
  return encodeBase64(sealed)
}

export async function sha256Hex (bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function canonicalize (value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`
  }
  const keys = Object.keys(value).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`
}

export function encodeCanonical (value) {
  return new TextEncoder().encode(canonicalize(value))
}

export function bytesToBase64 (bytes) {
  return encodeBase64(bytes)
}

export function base64ToBytes (b64) {
  return decodeBase64(b64)
}
