<template>
  <div>
    <PageHeader
      eyebrow="Comparação"
      title="Como estou em relação à região?"
      subtitle="Depois de três safras confirmadas seguidas, na mesma cultura e região, você vê a média de área e custo por hectare. O seu número individual não aparece para ninguém."
    />

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-alert v-if="locked" class="mb-6" type="info" variant="tonal">
      <div class="font-weight-medium mb-1">A comparação ainda está fechada</div>
      <p class="mb-2">
        {{ locked }}
      </p>
      <v-progress-linear
        v-if="lockProgress"
        :model-value="(lockProgress.current / lockProgress.required) * 100"
        color="primary"
        height="8"
        rounded
        class="mb-2"
      />
      <div v-if="lockProgress" class="text-caption">
        {{ lockProgress.current }} de {{ lockProgress.required }} safras confirmadas
      </div>
      <v-btn class="mt-4" color="primary" to="/app/contribuir">Enviar dados da safra</v-btn>
    </v-alert>

    <v-select
      v-model="cycleId"
      :items="cycleItems"
      item-title="title"
      item-value="value"
      label="Safra"
      class="mb-6"
      @update:model-value="load"
    />

    <v-card v-if="mineVsRegion" class="pa-6 pa-md-8 mb-6 pitch-card" variant="flat">
      <p class="pitch-eyebrow mb-3">O seu último envio × a mediana da região</p>
      <v-row>
        <v-col cols="12" sm="6">
          <div class="text-caption text-medium-emphasis">Você</div>
          <div class="text-h4 font-weight-bold pitch-metric">{{ formatBrl(mineVsRegion.mine) }}/ha</div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-medium-emphasis">Região</div>
          <div class="text-h4 font-weight-bold pitch-metric">{{ formatBrl(mineVsRegion.region) }}/ha</div>
        </v-col>
      </v-row>
      <p class="text-body-1 mt-4 mb-0">{{ mineVsRegion.story }}</p>
    </v-card>

    <MetricGrid v-if="metrics.length" :items="metrics" />
    <EmptyState
      v-else-if="cycleId && !loading && !locked"
      icon="mdi-chart-bell-curve-cumulative"
      title="A média desta safra ainda não saiu"
      description="Quando a janela fecha e a operação consolida os envios, os indicadores aparecem aqui."
    />
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import MetricGrid from '@/components/MetricGrid.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import { getProducerBenchmark } from '@/models/benchmark'
  import { cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { listCycles } from '@/models/cycle'
  import { apiError, apiErrorBody } from '@/models/errors'
  import { CYCLE_STATUS_LABEL, formatBrl, parseLockProgress } from '@/models/labels'
  import { getProperty } from '@/models/property'
  import { readLastFarm } from '@/models/session'

  const loading = ref(false)
  const error = ref('')
  const locked = ref('')
  const lockProgress = ref(null)
  const cycleId = ref('')
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])
  const metrics = ref([])

  const cycleItems = computed(() => cycles.value.map((c) => ({
    title: `${cycleTitle(c, cultures.value, regions.value)} · ${CYCLE_STATUS_LABEL[c.status] || ''}`,
    value: c.id,
  })))

  const mineVsRegion = computed(() => {
    const farm = readLastFarm()
    const cost = metrics.value.find((m) => m.metric === 'total_cost_ha')
    if (!farm?.area_ha || !farm?.total_cost_brl || cost?.median == null) return null
    const mine = Number(farm.total_cost_brl) / Number(farm.area_ha)
    const region = Number(cost.median)
    if (!Number.isFinite(mine) || !Number.isFinite(region) || !region) return null
    const pct = ((mine - region) / region) * 100
    let story = 'Você está na média da região.'
    if (pct > 3) story = `Seu custo está cerca de ${pct.toFixed(0)}% acima da mediana. É o argumento para renegociar o adubo na próxima compra.`
    else if (pct < -3) story = `Seu custo está cerca de ${Math.abs(pct).toFixed(0)}% abaixo da mediana da região.`
    return { mine, region, story }
  })

  async function load () {
    if (!cycleId.value) return
    error.value = ''
    locked.value = ''
    lockProgress.value = null
    metrics.value = []
    loading.value = true
    try {
      const data = await getProducerBenchmark(cycleId.value)
      metrics.value = Array.isArray(data.metrics) ? data.metrics : []
    } catch (err) {
      const body = apiErrorBody(err)
      if (err.response?.status === 403) {
        lockProgress.value = parseLockProgress(body.detail)
        locked.value = 'A comparação com a região libera depois de três safras confirmadas seguidas, na mesma cultura e lugar. Continue enviando — a recompensa da contribuição já pode cair na sua conta antes disso.'
      } else {
        error.value = apiError(err)
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    try {
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      cycles.value = await listCycles()
      const property = await getProperty()
      const regionID = property?.micro_region_id
      const aggregated = cycles.value.find((c) => c.status === 'aggregated' && (!regionID || c.micro_region_id === regionID))
        || cycles.value.find((c) => c.status === 'aggregated')
      cycleId.value = aggregated?.id || cycles.value[0]?.id || ''
      await load()
    } catch (err) {
      error.value = apiError(err)
    }
  })
</script>
