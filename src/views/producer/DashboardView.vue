<template>
  <div>
    <PageHeader
      eyebrow="Agricultor"
      :title="greeting"
      subtitle="Como está a sua safra em relação à média da região — e o que falta para o próximo passo."
    />

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-alert v-if="preparingAccount" class="mb-6" type="info" variant="tonal">
      Estamos preparando sua conta no AgroBench. O dinheiro da contribuição fica guardado aqui — você não precisa criar nada à parte.
    </v-alert>
    <v-alert v-else-if="walletCreated" class="mb-6" type="success" variant="tonal">
      Sua conta no AgroBench está pronta. As recompensas caem nela depois que o envio da safra é confirmado.
    </v-alert>

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Na sua conta</div>
          <div class="text-h4 font-weight-bold pitch-metric mt-1">{{ formatValue(wallet?.balance_usdc) }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">saldo em dólar digital</div>
          <div class="text-caption mt-3">Já recebido em recompensas: {{ formatValue(wallet?.reward_usdc) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Fazenda</div>
          <div class="d-flex align-center ga-2 mt-2">
            <StatusChip
              v-if="property"
              :status="property.car_status"
              :label="PROPERTY_STATUS_LABEL[property.car_status]"
            />
            <span v-else class="text-body-1">Ainda não cadastrada</span>
          </div>
          <div class="text-body-2 text-medium-emphasis mt-3">
            {{ property ? regionName(regions, property.micro_region_id) : 'Cadastre o CAR para entrar na comparação da região.' }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Safra aberta agora</div>
          <div class="text-h5 font-weight-bold mt-1">{{ openCycleTitle }}</div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            {{ openCycles.length ? 'Pode enviar os dados desta janela.' : 'Aguarde a operação abrir uma nova janela de envio.' }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="comparison" class="pa-6 pa-md-8 mb-6 pitch-card" variant="flat">
      <p class="pitch-eyebrow mb-3">Você × a região</p>
      <h2 class="text-h6 mb-4">Custo da safra por hectare</h2>
      <v-row>
        <v-col cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Você enviou</div>
          <div class="text-h5 font-weight-bold pitch-metric">{{ formatBrl(comparison.mine) }}</div>
          <div class="text-caption">por hectare</div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Média da região</div>
          <div class="text-h5 font-weight-bold pitch-metric">{{ formatBrl(comparison.region) }}</div>
          <div class="text-caption">por hectare</div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="text-caption text-medium-emphasis">Diferença</div>
          <div class="text-h5 font-weight-bold pitch-metric" :class="comparison.delta > 0 ? 'text-error' : 'text-primary'">
            {{ comparison.deltaLabel }}
          </div>
          <div class="text-caption">{{ comparison.delta > 0 ? 'acima da média' : comparison.delta < 0 ? 'abaixo da média' : 'na média' }}</div>
        </v-col>
      </v-row>
    </v-card>

    <NextStepCard
      class="mb-8"
      :title="nextStep.title"
      :body="nextStep.body"
      :action="nextStep.action"
      :to="nextStep.to"
    />

    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h6 mb-0">Últimos envios</h2>
      <v-btn variant="text" to="/app/contribuicoes">Ver todos</v-btn>
    </div>

    <EmptyState
      v-if="!contributions.length && !loading"
      icon="mdi-clipboard-text-outline"
      title="Nenhum envio ainda"
      description="Quando a janela da safra estiver aberta, envie área, cultura e custo. É o primeiro passo para ver a média da região."
      action="Enviar dados da safra"
      to="/app/contribuir"
    />

    <v-row v-else>
      <v-col v-for="item in contributions.slice(0, 3)" :key="item.id" cols="12" md="4">
        <v-card class="pa-5 h-100 pitch-card" variant="flat">
          <StatusChip :status="item.status" :label="CONTRIBUTION_STATUS_LABEL[item.status]" />
          <div class="text-subtitle-1 font-weight-bold mt-3">{{ LEVEL_LABEL[item.level] }}</div>
          <div class="text-body-2 text-medium-emphasis mt-1">{{ cycleTitleFor(item.cycle_id) }}</div>
          <div class="d-flex flex-column ga-2 mt-3">
            <ProofLink
              :href="txProofUrl(contributionLockTx(item))"
              label="Ver comprovante da garantia"
            />
            <ProofLink :href="txProofUrl(item.commit_tx)" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import NextStepCard from '@/components/NextStepCard.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import ProofLink from '@/components/ProofLink.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { getProducerBenchmark } from '@/models/benchmark'
  import { cycleTitle, listCultures, listMicroRegions, regionName } from '@/models/catalog'
  import { listContributions } from '@/models/contribution'
  import { isCycleAccepting, listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import {
    CONTRIBUTION_STATUS_LABEL,
    formatBrl,
    formatValue,
    LEVEL_LABEL,
    PROPERTY_STATUS_LABEL,
  } from '@/models/labels'
  import { getProperty } from '@/models/property'
  import { contributionLockTx, txProofUrl } from '@/models/proof'
  import { readLastFarm, session } from '@/models/session'
  import { ensureWallet } from '@/models/wallet'

  const loading = ref(true)
  const preparingAccount = ref(false)
  const error = ref('')
  const wallet = ref(null)
  const walletCreated = ref(false)
  const property = ref(null)
  const openCycles = ref([])
  const cycles = ref([])
  const contributions = ref([])
  const cultures = ref([])
  const regions = ref([])
  const regionalCost = ref(null)

  const greeting = computed(() => {
    const email = session.user?.email || ''
    const local = email.split('@')[0]
    if (local && local !== 'produtor') return `Olá, ${local}`
    return 'Sua safra'
  })

  const openCycleTitle = computed(() => {
    const cycle = openCycles.value[0]
    if (!cycle) return 'Nenhuma agora'
    return cycleTitle(cycle, cultures.value, regions.value)
  })

  const comparison = computed(() => {
    const farm = readLastFarm()
    if (!farm?.area_ha || !farm?.total_cost_brl || regionalCost.value == null) return null
    const mine = Number(farm.total_cost_brl) / Number(farm.area_ha)
    const region = Number(regionalCost.value)
    if (!Number.isFinite(mine) || !Number.isFinite(region) || !region) return null
    const delta = mine - region
    const pct = (delta / region) * 100
    const sign = pct > 0 ? '+' : ''
    return {
      mine,
      region,
      delta,
      deltaLabel: `${sign}${pct.toFixed(0)}%`,
    }
  })

  const nextStep = computed(() => {
    if (!property.value) {
      return {
        title: 'Cadastre sua fazenda',
        body: 'Informe o CAR para confirmarmos que a propriedade existe. Sem isso, o envio da safra não entra na média da região.',
        action: 'Cadastrar fazenda',
        to: '/app/propriedade',
      }
    }
    if (property.value.car_status !== 'approved') {
      return {
        title: 'A fazenda ainda não foi confirmada',
        body: 'Revise o cadastro ambiental rural. Só propriedades confirmadas entram na comparação.',
        action: 'Ver cadastro da fazenda',
        to: '/app/propriedade',
      }
    }
    if (openCycles.value.length) {
      return {
        title: 'Envie os dados desta safra',
        body: 'Área, cultura e custo. Em dois passos simples: primeiro o envio, depois a confirmação dos números.',
        action: 'Enviar dados da safra',
        to: '/app/contribuir',
      }
    }
    const accepted = contributions.value.filter((c) => c.status === 'accepted').length
    if (accepted > 0) {
      return {
        title: 'Veja como você está na região',
        body: 'A comparação gratuita abre depois de três safras confirmadas seguidas. Enquanto isso, a recompensa já pode ter caído na sua conta.',
        action: 'Comparar com a região',
        to: '/app/benchmark',
      }
    }
    return {
      title: 'Aguarde a próxima janela',
      body: 'Não há safra recebendo envios agora. Quando a operação abrir a janela, você envia os números da fazenda daqui.',
      action: 'Ver meus envios',
      to: '/app/contribuicoes',
    }
  })

  function cycleTitleFor (cycleId) {
    const cycle = cycles.value.find((c) => c.id === cycleId)
    return cycleTitle(cycle, cultures.value, regions.value)
  }

  onMounted(async () => {
    preparingAccount.value = true
    try {
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      const ensured = await ensureWallet()
      wallet.value = ensured.wallet
      walletCreated.value = ensured.created
      preparingAccount.value = false
      property.value = await getProperty()
      cycles.value = await listCycles()
      openCycles.value = cycles.value.filter((c) => isCycleAccepting(c))
      contributions.value = await listContributions()
      const regionID = property.value?.micro_region_id
      const aggregated = cycles.value.find((c) => c.status === 'aggregated' && (!regionID || c.micro_region_id === regionID))
        || cycles.value.find((c) => c.status === 'aggregated')
      if (aggregated) {
        try {
          const data = await getProducerBenchmark(aggregated.id)
          const cost = (data.metrics || []).find((m) => m.metric === 'total_cost_ha')
          if (cost?.mean != null) regionalCost.value = cost.mean
        } catch {
          regionalCost.value = null
        }
      }
    } catch (err) {
      error.value = apiError(err)
    } finally {
      preparingAccount.value = false
      loading.value = false
    }
  })
</script>
