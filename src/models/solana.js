import { Buffer } from 'buffer'
import { decodeBase64, encodeBase64 } from 'tweetnacl-util'
import { decryptWalletBlob } from './crypto'
import { FarmerError } from './errors'

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

function toUint8 (bytes) {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
}

function bytesToBase64 (bytes) {
  return encodeBase64(toUint8(bytes))
}

function txBytesFromBase64 (txBase64) {
  const raw = String(txBase64 || '').trim()
  if (!raw) {
    throw new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
  }
  return decodeBase64(raw)
}

export function loadWalletSecret (encryptedBlob, expectedPubkey) {
  const opened = decryptWalletBlob(encryptedBlob)
  if (!opened?.secretKey) {
    throw new FarmerError('Não deu para travar os 10 dólares digitais. Esta conta não está disponível neste aparelho.')
  }
  if (expectedPubkey && opened.pubkey !== expectedPubkey) {
    throw new FarmerError('Não deu para travar os 10 dólares digitais. Esta conta não está disponível neste aparelho.')
  }
  return opened
}

export async function keypairFromSecretKey (secretKey) {
  const { Keypair } = await import('@solana/web3.js')
  if (!(secretKey instanceof Uint8Array) || secretKey.length !== 64) {
    throw new FarmerError('Não deu para travar os 10 dólares digitais. Esta conta não está disponível neste aparelho.')
  }
  return Keypair.fromSecretKey(secretKey)
}

export async function signChainTransaction (txBase64, secretKey) {
  const { Keypair, Transaction, VersionedTransaction } = await import('@solana/web3.js')
  // tweetnacl secretKey = 64 bytes (seed||pubkey). Backend espera tx legacy, fee payer = treasury.
  if (!(secretKey instanceof Uint8Array) || secretKey.length !== 64) {
    throw new FarmerError('Não deu para travar os 10 dólares digitais. Esta conta não está disponível neste aparelho.')
  }
  const keypair = Keypair.fromSecretKey(secretKey)
  const raw = txBytesFromBase64(txBase64)
  const versioned = (raw[0] & 0x80) !== 0

  try {
    if (versioned) {
      const tx = VersionedTransaction.deserialize(raw)
      tx.sign([keypair])
      return bytesToBase64(tx.serialize())
    }
    const tx = Transaction.from(raw)
    tx.partialSign(keypair)
    return bytesToBase64(tx.serialize())
  } catch {
    try {
      if (versioned) {
        const tx = Transaction.from(raw)
        tx.partialSign(keypair)
        return bytesToBase64(tx.serialize())
      }
      const tx = VersionedTransaction.deserialize(raw)
      tx.sign([keypair])
      return bytesToBase64(tx.serialize())
    } catch {
      throw new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
    }
  }
}

export async function signWalletTransaction (encryptedBlob, txBase64, expectedPubkey) {
  const opened = loadWalletSecret(encryptedBlob, expectedPubkey)
  return signChainTransaction(txBase64, opened.secretKey)
}
