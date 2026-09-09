import api from '@/services/api'
import { asList } from './errors'

export async function listPoolPeriods () {
  const { data } = await api.get('/api/v1/pool/periods')
  return asList(data)
}

export async function getPoolPeriod (month) {
  const { data } = await api.get(`/api/v1/pool/periods/${month}`)
  return data
}

export async function distributePool (month) {
  await api.post('/api/v1/admin/pool/distribute', null, {
    params: month ? { month } : {},
  })
}

export async function runDistributeJob (month) {
  await api.post('/api/v1/admin/jobs/run/distribute_pool', null, {
    params: month ? { month } : {},
  })
}
