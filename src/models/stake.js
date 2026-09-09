import api from '@/services/api'
import { FarmerError, isUnknownFieldError } from './errors'
import { signWalletTransaction } from './solana'
import { ensureWallet, readWalletBlob } from './wallet'

const LOCK_TX = '/api/v1/chain/stake/lock-tx'
const LOCK_SUBMIT = '/api/v1/chain/stake/lock-submit'
const STAKE_AMOUNT_MICRO = 10_000_000

function releaseTxPath (contributionId) {
  return `/api/v1/contributions/${contributionId}/release-stake/tx`
}

function releaseSubmitPath (contributionId) {
  return `/api/v1/contributions/${contributionId}/release-stake/submit`
}

function extractTx (data) {
  return String(data?.tx || data?.transaction || data?.message || '').trim()
}

function extractSignature (data) {
  return String(data?.signature || data?.lock_tx || data?.release_tx || '').trim()
}

export function stakeFarmerError (err) {
  if (err instanceof FarmerError) return err
  const status = err.response?.status
  const detail = String(err.response?.data?.detail || err.response?.data?.message || err.message || '')
  if (status === 404) {
    return new FarmerError('Não deu para travar os 10 dólares digitais. O travamento ainda não está disponível.')
  }
  if (/saldo insuficiente|insufficient funds|insufficient/i.test(detail)) {
    return new FarmerError('Não deu para travar os 10 dólares digitais — a conta ainda não tem esse valor.')
  }
  return new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
}

async function loadLocalBlob (pubkey) {
  // Seed produtor@agrobench.local grava encrypted_blob dummy ("demo"), não um secretbox nacl.
  // Sem blob real no localStorage deste aparelho, decryptWalletBlob falha e o lock não assina.
  // Conta criada neste browser (ensureWallet) tem secretKey de 64 bytes e assina normalmente.
  const blob = readWalletBlob(pubkey)
  if (!blob) {
    throw new FarmerError('Não deu para travar os 10 dólares digitais. Esta conta não está disponível neste aparelho.')
  }
  return blob
}

async function postIgnoringUnknownFields (path, bodies) {
  let lastErr
  for (const body of bodies) {
    try {
      return await api.post(path, body)
    } catch (err) {
      lastErr = err
      if (!isUnknownFieldError(err)) throw err
    }
  }
  throw lastErr
}

export async function requestStakeLockTx (body = { amount: STAKE_AMOUNT_MICRO }) {
  try {
    const { data } = await postIgnoringUnknownFields(LOCK_TX, [
      body,
      { amount: STAKE_AMOUNT_MICRO },
      {},
    ])
    const tx = extractTx(data)
    if (!tx) throw new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
    return { tx, data }
  } catch (err) {
    if (err instanceof FarmerError) throw err
    if (err.response?.status === 409) {
      return { skipped: true, signature: extractSignature(err.response?.data) }
    }
    throw stakeFarmerError(err)
  }
}

export async function submitStakeLockTx (signedTx) {
  try {
    const { data } = await postIgnoringUnknownFields(LOCK_SUBMIT, [
      { tx: signedTx },
      { signed_tx: signedTx },
    ])
    const signature = extractSignature(data)
    if (!signature) throw new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
    return signature
  } catch (err) {
    if (err instanceof FarmerError) throw err
    if (err.response?.status === 409) {
      const signature = extractSignature(err.response?.data)
      if (signature) return signature
    }
    throw stakeFarmerError(err)
  }
}

export async function lockStake () {
  const { wallet } = await ensureWallet()
  const blob = await loadLocalBlob(wallet.pubkey)
  const requested = await requestStakeLockTx({ amount: STAKE_AMOUNT_MICRO })
  if (requested.skipped) return requested.signature || ''
  const signed = await signWalletTransaction(blob, requested.tx, wallet.pubkey)
  return submitStakeLockTx(signed)
}

export async function requestStakeReleaseTx (contributionId) {
  try {
    const { data } = await api.post(releaseTxPath(contributionId), {})
    const tx = extractTx(data)
    if (!tx) throw new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
    return { tx, data }
  } catch (err) {
    if (err instanceof FarmerError) throw err
    if (err.response?.status === 409) {
      return { skipped: true, signature: extractSignature(err.response?.data) }
    }
    throw stakeFarmerError(err)
  }
}

export async function submitStakeReleaseTx (contributionId, signedTx) {
  try {
    const { data } = await postIgnoringUnknownFields(releaseSubmitPath(contributionId), [
      { tx: signedTx },
      { signed_tx: signedTx },
    ])
    const signature = extractSignature(data)
    if (!signature) throw new FarmerError('Não deu para travar os 10 dólares digitais. Tente de novo em instantes.')
    return signature
  } catch (err) {
    if (err instanceof FarmerError) throw err
    if (err.response?.status === 409) {
      const signature = extractSignature(err.response?.data)
      if (signature) return signature
    }
    throw stakeFarmerError(err)
  }
}

export async function releaseStake (contributionId) {
  const { wallet } = await ensureWallet()
  const blob = await loadLocalBlob(wallet.pubkey)
  const requested = await requestStakeReleaseTx(contributionId)
  if (requested.skipped) return requested.signature || ''
  const signed = await signWalletTransaction(blob, requested.tx, wallet.pubkey)
  return submitStakeReleaseTx(contributionId, signed)
}
