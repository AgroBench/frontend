import api from '@/services/api'
import { asList } from './errors'

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
