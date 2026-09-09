import api from '@/services/api'
import { asList } from './errors'

export async function listMicroRegions () {
  const { data } = await api.get('/api/v1/micro-regions')
  return asList(data)
}

export async function listCultures () {
  const { data } = await api.get('/api/v1/cultures')
  return asList(data)
}

export async function loadCatalogs () {
  const [microRegions, cultures] = await Promise.all([
    listMicroRegions(),
    listCultures(),
  ])
  return { microRegions, cultures }
}

export function cultureName (cultures, id) {
  return cultures.find((c) => c.id === id)?.name || 'Cultura'
}

export function cultureCode (cultures, id) {
  return cultures.find((c) => c.id === id)?.code || ''
}

export function regionName (regions, id) {
  const r = regions.find((x) => x.id === id)
  return r ? `${r.name} — ${r.uf}` : 'Região'
}

export function cycleTitle (cycle, cultures, regions) {
  if (!cycle) return 'Safra'
  return `${cultureName(cultures, cycle.culture_id)} ${cycle.label} · ${regionName(regions, cycle.micro_region_id)}`
}
