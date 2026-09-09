export const ROLE_LABEL = {
  producer: 'Agricultor',
  institution: 'Instituição',
  admin: 'Operação',
}

export const LEVEL_LABEL = {
  basic: 'Essencial',
  intermediate: 'Completo',
  advanced: 'Detalhado',
}

export const LEVEL_HINT = {
  basic: 'Cultura, área e custo total da safra. Recompensa de 5 na sua conta.',
  intermediate: 'Custos por insumo, produtividade e datas. Recompensa de 10 na sua conta.',
  advanced: 'Solo, irrigação, pragas e clima. Recompensa de 17,50 na sua conta.',
}

export const LEVEL_HELP = {
  basic: 'O mínimo para entrar na comparação da região.',
  intermediate: 'Quanto mais detalhe, mais precisa fica a média — e maior a recompensa.',
  advanced: 'O que bancos e cooperativas mais precisam para avaliar risco da safra.',
}

export const CONTRIBUTION_STATUS_LABEL = {
  committed: 'Aguardando confirmação',
  revealed: 'Recebido',
  validating: 'Em análise',
  accepted: 'Confirmado',
  rejected: 'Não aceito',
}

export const PROPERTY_STATUS_LABEL = {
  pending: 'Aguardando',
  approved: 'Confirmada',
  rejected: 'Não confirmada',
}

export const CYCLE_STATUS_LABEL = {
  open: 'Recebendo envios',
  closed: 'Encerrada',
  aggregated: 'Média disponível',
}

export const INSTITUTION_STATUS_LABEL = {
  pending: 'Aguardando liberação',
  approved: 'Liberada',
  rejected: 'Não liberada',
}

export const POOL_STATUS_LABEL = {
  open: 'Em formação',
  distributed: 'Já distribuído',
  carried: 'Guardado para o próximo mês',
}

export const PLAN_LABEL = {
  regional: 'Regional — até 5 regiões',
  national: 'Nacional — todo o Brasil',
}

export const IRRIGATION_SYSTEMS = [
  { value: 'center_pivot', title: 'Pivô central' },
  { value: 'drip', title: 'Gotejamento' },
  { value: 'sprinkler', title: 'Aspersão' },
  { value: 'furrow', title: 'Sulco' },
  { value: 'other', title: 'Outro' },
]

export const CLIMATE_EVENTS = [
  { value: 'drought', title: 'Seca' },
  { value: 'hail', title: 'Granizo' },
  { value: 'frost', title: 'Geada' },
  { value: 'flood', title: 'Enchente' },
  { value: 'heat_wave', title: 'Onda de calor' },
  { value: 'other', title: 'Outro' },
]

export const MECHANIZATION_TYPES = [
  { value: 'own', title: 'Própria' },
  { value: 'outsourced', title: 'Terceirizada' },
  { value: 'mixed', title: 'Mista' },
]

export const METRIC_LABEL = {
  area_ha: 'Área plantada (ha)',
  total_cost_ha: 'Custo total (R$/ha)',
  fertilizer_cost_ha: 'Adubo (R$/ha)',
  pesticide_cost_ha: 'Defensivo (R$/ha)',
  seed_cost_ha: 'Semente (R$/ha)',
  fuel_cost_ha: 'Combustível (R$/ha)',
  labor_cost_ha: 'Mão de obra (R$/ha)',
  yield_sacks_ha: 'Produtividade (sc/ha)',
  cycle_days: 'Dias da safra',
  irrigation: 'Uso de irrigação',
  climate_loss_pct: 'Perda por clima (%)',
  pest_events: 'Ocorrências de praga',
  mechanization_own: 'Mecanização própria',
}

export function metricLabel (key) {
  if (METRIC_LABEL[key]) return METRIC_LABEL[key]
  const parts = String(key).split(':')
  if (parts.length === 2) {
    const level = LEVEL_LABEL[parts[0]] || parts[0]
    const metric = METRIC_LABEL[parts[1]] || parts[1]
    return `${level} · ${metric}`
  }
  return key
}

export function formatValue (amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatReward (amount) {
  const formatted = formatValue(amount)
  if (formatted === '—') return '—'
  return `${formatted} na conta`
}

export function formatUsdc (value) {
  return formatReward(value)
}

export function formatBrl (value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate (iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatDateShort (iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR')
}

export function statusColor (status) {
  switch (status) {
    case 'accepted':
    case 'approved':
    case 'active':
    case 'distributed':
    case 'open':
      return 'success'
    case 'rejected':
    case 'disabled':
    case 'expired':
    case 'cancelled':
      return 'error'
    case 'pending':
    case 'committed':
    case 'revealed':
    case 'validating':
    case 'closed':
    case 'carried':
      return 'warning'
    case 'aggregated':
      return 'primary'
    default:
      return 'default'
  }
}

export function parseLockProgress (detail) {
  const match = String(detail || '').match(/(\d+)\s*\/\s*(\d+)/)
  if (!match) return null
  return { current: Number(match[1]), required: Number(match[2]) }
}
