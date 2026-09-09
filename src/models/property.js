import api from '@/services/api'
import { isNotFound } from './errors'

export async function getProperty () {
  try {
    const { data } = await api.get('/api/v1/property')
    return data
  } catch (err) {
    if (isNotFound(err)) return null
    throw err
  }
}

export async function createProperty ({ car, micro_region_id }) {
  const { data } = await api.post('/api/v1/property', { car, micro_region_id })
  return data
}
