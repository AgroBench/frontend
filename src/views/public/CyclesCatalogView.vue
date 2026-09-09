<template>
  <v-container class="py-10 py-md-12">
    <PageHeader
      title="Safras da região"
      subtitle="Janelas em que os agricultores enviam dados. Aberto = recebendo envios. Média disponível = indicadores já consolidados."
    />
    <ErrorAlert :message="error" @clear="error = ''" />

    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-select v-model="filters.culture" :items="cultureItems" clearable label="Cultura" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="filters.region" :items="regionItems" clearable label="Região" />
      </v-col>
      <v-col cols="12" md="4">
        <v-select v-model="filters.status" :items="statusItems" clearable label="Situação" />
      </v-col>
    </v-row>
    <v-btn class="mb-8" color="primary" :loading="loading" @click="load">Filtrar</v-btn>

    <EmptyState
      v-if="!cycles.length && !loading"
      title="Nenhuma safra neste recorte"
      description="Ajuste o filtro ou aguarde a operação abrir uma nova janela."
    />

    <v-row v-else>
      <v-col v-for="c in cycles" :key="c.id" cols="12" md="6">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <StatusChip :status="c.status" :label="CYCLE_STATUS_LABEL[c.status]" />
          <div class="text-h6 mt-3">{{ cycleTitle(c, cultures, regions) }}</div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            {{ formatDateShort(c.opens_at) }} — {{ formatDateShort(c.closes_at) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import { CYCLE_STATUS_LABEL, formatDateShort } from '@/models/labels'

  const error = ref('')
  const loading = ref(false)
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])
  const filters = reactive({ culture: null, region: null, status: null })

  const cultureItems = computed(() => cultures.value.map((c) => ({ title: c.name, value: c.id })))
  const regionItems = computed(() => regions.value.map((r) => ({ title: `${r.name} — ${r.uf}`, value: r.id })))
  const statusItems = [
    { title: 'Recebendo envios', value: 'open' },
    { title: 'Encerrada', value: 'closed' },
    { title: 'Média disponível', value: 'aggregated' },
  ]

  async function load () {
    error.value = ''
    loading.value = true
    try {
      cycles.value = await listCycles({
        culture: filters.culture || undefined,
        region: filters.region || undefined,
        status: filters.status || undefined,
      })
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    try {
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      await load()
    } catch (err) {
      error.value = apiError(err)
    }
  })
</script>
