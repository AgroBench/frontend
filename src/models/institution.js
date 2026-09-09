import api from '@/services/api'
import { saveLastInstitution } from './session'

export async function registerInstitution (payload) {
  const { data } = await api.post('/api/v1/institutions/register', payload)
  if (data?.id) {
    saveLastInstitution({
      id: data.id,
      name: data.name || payload.name,
      email: payload.email,
      status: data.status,
    })
  }
  return data
}

export async function getInstitutionMe () {
  const { data } = await api.get('/api/v1/institutions/me')
  return data
}

export async function subscribeInstitution (payload) {
  const { data } = await api.post('/api/v1/institutions/subscribe', payload)
  return data
}

export async function confirmMockPayment ({ provider_ref, subscription_id, amount_usdc }) {
  await api.post('/api/v1/webhooks/payment', {
    ref: provider_ref,
    subscription_id,
    amount_usdc,
    status: 'paid',
  })
}

export async function approveInstitution (id) {
  await api.post(`/api/v1/admin/institutions/${id}/approve`)
}

export async function rejectInstitution (id) {
  await api.post(`/api/v1/admin/institutions/${id}/reject`)
}
