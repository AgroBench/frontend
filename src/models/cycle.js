import api from '@/services/api'
import { asList } from './errors'

export const BENCHMARK_FREE_AFTER_CYCLES = 3

export async function listCycles (params = {}) {
  const query = {}
  if (params.culture) query.culture = params.culture
  if (params.region) query.region = params.region
  if (params.status) query.status = params.status
  const { data } = await api.get('/api/v1/cycles', { params: query })
  return asList(data)
}

export async function createCycle (payload) {
  const { data } = await api.post('/api/v1/admin/cycles', payload)
  return data
}

export async function closeCycle (id) {
  const { data } = await api.post(`/api/v1/admin/cycles/${id}/close`)
  return data
}

export function isCycleAccepting (cycle, now = new Date()) {
  if (!cycle || cycle.status !== 'open') return false
  const opens = new Date(cycle.opens_at)
  const closes = new Date(cycle.closes_at)
  return opens <= now && now < closes
}

export function cultureRegionKey (cycle) {
  if (!cycle?.culture_id || !cycle?.micro_region_id) return ''
  return `${cycle.culture_id}:${cycle.micro_region_id}`
}

export function consecutiveAcceptedByPair (cycles, contributions) {
  const byId = new Map(cycles.map((c) => [c.id, c]))
  const rowsByPair = new Map()
  for (const item of contributions) {
    if (item.status !== 'accepted' && item.status !== 'rejected') continue
    const cycle = byId.get(item.cycle_id)
    if (!cycle) continue
    const key = cultureRegionKey(cycle)
    const list = rowsByPair.get(key) || []
    list.push({ status: item.status, opensAt: cycle.opens_at })
    rowsByPair.set(key, list)
  }
  const counts = new Map()
  for (const [key, rows] of rowsByPair) {
    rows.sort((a, b) => Date.parse(b.opensAt) - Date.parse(a.opensAt))
    let n = 0
    for (const row of rows) {
      if (row.status !== 'accepted') break
      n += 1
    }
    counts.set(key, n)
  }
  return counts
}

export function producerConsultableCycles (cycles, contributions, required = BENCHMARK_FREE_AFTER_CYCLES) {
  const counts = consecutiveAcceptedByPair(cycles, contributions)
  return cycles.filter((c) => c.status === 'aggregated' && (counts.get(cultureRegionKey(c)) || 0) >= required)
}

export function producerLockProgress (cycles, contributions, required = BENCHMARK_FREE_AFTER_CYCLES) {
  const counts = consecutiveAcceptedByPair(cycles, contributions)
  let current = 0
  for (const n of counts.values()) {
    if (n > current) current = n
  }
  return { current: Math.min(current, required), required }
}

export function pickPreferredCycle (cycles, regionID) {
  if (!cycles.length) return ''
  const match = cycles.find((c) => !regionID || c.micro_region_id === regionID)
  return (match || cycles[0]).id
}

export function institutionConsultableCycles (cycles, subscription) {
  if (!subscription || subscription.status !== 'active') return []
  const aggregated = cycles.filter((c) => c.status === 'aggregated')
  if (subscription.plan === 'national') return aggregated
  const allowed = new Set((subscription.regions || []).map(String))
  if (!allowed.size) return []
  return aggregated.filter((c) => allowed.has(String(c.micro_region_id)))
}
