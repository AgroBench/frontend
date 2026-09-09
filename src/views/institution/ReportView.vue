<template>
  <div>
    <PageHeader
      eyebrow="Relatório"
      title="Indicadores da safra"
      subtitle="Custo, produtividade e risco da região — o mesmo agregado que o agricultor vê no básico, completo para quem avalia crédito e seguro."
    />

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-select
      v-model="cycleId"
      :items="cycleItems"
      item-title="title"
      item-value="value"
      label="Safra"
      class="mb-6"
      @update:model-value="load"
    />

    <MetricGrid v-if="metrics.length" :items="metrics" />
    <EmptyState
      v-else-if="cycleId && !loading"
      icon="mdi-file-chart-outline"
      title="Ainda não há indicadores nesta safra"
      description="Escolha uma safra cuja média já tenha sido consolidada, ou aguarde o fechamento da janela."
    />
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import MetricGrid from '@/components/MetricGrid.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import { getInstitutionReport } from '@/models/benchmark'
  import { cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import { CYCLE_STATUS_LABEL } from '@/models/labels'

  const loading = ref(false)
  const error = ref('')
  const cycleId = ref('')
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])
  const metrics = ref([])

  const cycleItems = computed(() => cycles.value.map((c) => ({
    title: `${cycleTitle(c, cultures.value, regions.value)} · ${CYCLE_STATUS_LABEL[c.status] || ''}`,
    value: c.id,
  })))

  async function load () {
    if (!cycleId.value) return
    error.value = ''
    loading.value = true
    try {
      const data = await getInstitutionReport(cycleId.value)
      metrics.value = Array.isArray(data.metrics) ? data.metrics : []
    } catch (err) {
      error.value = apiError(err)
      metrics.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    try {
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      cycles.value = await listCycles()
      cycleId.value = cycles.value.find((c) => c.status === 'aggregated')?.id || cycles.value[0]?.id || ''
      await load()
    } catch (err) {
      error.value = apiError(err)
    }
  })
</script>
