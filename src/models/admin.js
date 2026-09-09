import api from '@/services/api'

export async function seedDemo () {
  const { data } = await api.post('/api/v1/admin/seed/demo')
  return data
}

export async function confirmPayment (paymentId) {
  await api.post(`/api/v1/admin/payments/${paymentId}/confirm`)
}

export async function getHealth () {
  const { data } = await api.get('/healthz')
  return data
}

export async function getReady () {
  const { data } = await api.get('/readyz')
  return data
}
