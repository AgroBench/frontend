import api from '@/services/api'

export async function getProducerBenchmark (cycleId) {
  const { data } = await api.get('/api/v1/benchmark/me', { params: { cycle: cycleId } })
  return data
}

export async function getInstitutionReport (cycleId) {
  const { data } = await api.get('/api/v1/benchmark/report', { params: { cycle: cycleId } })
  return data
}
