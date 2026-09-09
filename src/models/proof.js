const EXPLORER = 'https://explorer.solana.com'

function isRealSignature (value) {
  const s = String(value || '').trim()
  if (!s) return false
  if (s.startsWith('mock_')) return false
  return s.length >= 32
}

export function txProofUrl (signature) {
  if (!isRealSignature(signature)) return ''
  return `${EXPLORER}/tx/${encodeURIComponent(signature)}?cluster=devnet`
}

export function contributionLockTx (item) {
  if (!item) return ''
  return item.lock_tx || item.stake_tx || item.stake_signature || item.lock_signature || ''
}

export function accountProofUrl (code) {
  const s = String(code || '').trim()
  if (!s) return ''
  return `${EXPLORER}/address/${encodeURIComponent(s)}?cluster=devnet`
}

export function shortAccount (code) {
  const s = String(code || '').trim()
  if (!s) return '—'
  if (s.length <= 12) return s
  return `${s.slice(0, 6)}…${s.slice(-4)}`
}
