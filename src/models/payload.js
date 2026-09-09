import { bytesToBase64, encodeCanonical, randomHex, sha256Hex } from './crypto'

export function buildEnvelope ({ cycleId, level, data }) {
  return {
    version: 1,
    cycle_id: cycleId,
    level,
    nonce: randomHex(16),
    data,
  }
}

export function buildBasicData ({ culture_code, area_ha, total_cost_brl }) {
  return {
    culture_code: String(culture_code || '').toLowerCase(),
    area_ha: Number(area_ha),
    total_cost_brl: Number(total_cost_brl),
  }
}

export function buildIntermediateData (form) {
  return {
    ...buildBasicData(form),
    cost_by_input: {
      fertilizer_brl: Number(form.fertilizer_brl),
      pesticide_brl: Number(form.pesticide_brl),
      seed_brl: Number(form.seed_brl),
      fuel_brl: Number(form.fuel_brl),
      labor_brl: Number(form.labor_brl),
    },
    yield_sacks_ha: Number(form.yield_sacks_ha),
    planting_date: form.planting_date,
    harvest_date: form.harvest_date,
    suppliers: {
      fertilizer: form.supplier_fertilizer,
      pesticide: form.supplier_pesticide,
      seed: form.supplier_seed,
      fuel: form.supplier_fuel,
    },
  }
}

export function buildAdvancedData (form) {
  const rotation = String(form.rotation_history || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  const data = {
    ...buildIntermediateData(form),
    soil_type: form.soil_type,
    rotation_history: rotation,
    irrigation: {
      used: Boolean(form.irrigation_used),
      system: form.irrigation_system,
    },
    pest_events: form.pest_name
      ? [{ name: form.pest_name, management: form.pest_management }]
      : [],
    climate_losses: form.climate_event
      ? [{ event: form.climate_event, area_pct: Number(form.climate_area_pct) }]
      : [],
    mechanization: {
      type: form.mechanization_type,
      machinery: String(form.machinery || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    },
  }

  if (!form.irrigation_used) {
    data.irrigation = { used: false, system: form.irrigation_system || 'other' }
  }

  return data
}

export function buildDataForLevel (level, form) {
  if (level === 'advanced') return buildAdvancedData(form)
  if (level === 'intermediate') return buildIntermediateData(form)
  return buildBasicData(form)
}

export async function prepareCommit (cycleId, level, form) {
  const envelope = buildEnvelope({
    cycleId,
    level,
    data: buildDataForLevel(level, form),
  })
  const bytes = encodeCanonical(envelope)
  const hash = await sha256Hex(bytes)
  return {
    envelope,
    hash,
    plaintext_b64: bytesToBase64(bytes),
  }
}
