<template>
  <div>
    <PageHeader
      eyebrow="Relatório"
      title="Indicadores da safra"
      subtitle="Custo, produtividade e risco da região — o mesmo agregado que o agricultor vê no básico, completo para quem avalia crédito e seguro."
    />

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-select
      v-if="cycleItems.length"
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
      v-else-if="!cycleItems.length && !loading"
      icon="mdi-file-chart-outline"
      :title="emptyTitle"
      :description="emptyDescription"
      :action="emptyAction"
      :to="emptyTo"
    />
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
  import { institutionConsultableCycles, listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import { getInstitutionMe } from '@/models/institution'
  import { CYCLE_STATUS_LABEL } from '@/models/labels'

  const loading = ref(false)
  const error = ref('')
  const cycleId = ref('')
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])
  const metrics = ref([])
  const hasSubscription = ref(false)

  const cycleItems = computed(() => cycles.value.map((c) => ({
    title: `${cycleTitle(c, cultures.value, regions.value)} · ${CYCLE_STATUS_LABEL[c.status] || ''}`,
    value: c.id,
  })))

  const emptyTitle = computed(() => hasSubscription.value
    ? 'Nenhuma safra no seu recorte'
    : 'O relatório ainda não está liberado')

  const emptyDescription = computed(() => hasSubscription.value
    ? 'Quando a média da safra for consolidada nas regiões do seu acesso, ela aparece aqui.'
    : 'Contrate o acesso regional ou nacional para consultar os indicadores da safra.')

  const emptyAction = computed(() => hasSubscription.value ? '' : 'Contratar acesso')
  const emptyTo = computed(() => hasSubscription.value ? null : '/inst/assinatura')

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
      const [allCycles, me] = await Promise.all([listCycles(), getInstitutionMe()])
      hasSubscription.value = me?.subscription?.status === 'active'
      cycles.value = institutionConsultableCycles(allCycles, me?.subscription)
      cycleId.value = cycles.value[0]?.id || ''
      if (cycleId.value) await load()
    } catch (err) {
      error.value = apiError(err)
    }
  })
</script>
