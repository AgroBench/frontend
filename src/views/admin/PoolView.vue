<template>
  <div>
    <PageHeader
      eyebrow="Operação"
      title="Fundo coletivo"
      subtitle="A receita das instituições entra aqui. A operação dispara a divisão do mês — a fatia de cada agricultor cai na conta dele."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-card class="pa-6 pa-md-8 mb-8 pitch-card" variant="flat">
      <v-text-field
        v-model="month"
        label="Mês a distribuir"
        placeholder="2026-08"
        hint="Formato ano-mês, por exemplo 2025-08"
        persistent-hint
        class="mb-4"
        style="max-width: 280px"
      />
      <v-btn color="primary" size="large" :loading="distributing" @click="onDistribute">
        Distribuir o fundo deste mês
      </v-btn>
    </v-card>

    <v-row>
      <v-col v-for="p in periods" :key="p.id" cols="12" md="6">
        <v-card class="pa-6 pitch-card" variant="flat">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-h6">{{ p.month }}</div>
            <StatusChip :status="p.status" :label="POOL_STATUS_LABEL[p.status]" />
          </div>
          <div class="text-body-2">Entradas: {{ formatValue(p.gross) }}</div>
          <div class="text-body-2">Infraestrutura: {{ formatValue(p.infra_cost) }}</div>
          <div class="text-body-2">Operação: {{ formatValue(p.maintainer_fee) }}</div>
          <div class="text-subtitle-1 font-weight-bold mt-3">Líquido aos agricultores: {{ formatValue(p.net) }}</div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { apiError } from '@/models/errors'
  import { formatValue, POOL_STATUS_LABEL } from '@/models/labels'
  import { distributePool, listPoolPeriods } from '@/models/pool'

  const error = ref('')
  const info = ref('')
  const distributing = ref(false)
  const periods = ref([])
  const month = ref('')

  async function reload () {
    periods.value = await listPoolPeriods()
  }

  onMounted(async () => {
    try {
      await reload()
    } catch (err) {
      error.value = apiError(err)
    }
  })

  async function onDistribute () {
    error.value = ''
    info.value = ''
    distributing.value = true
    try {
      await distributePool(month.value.trim())
      info.value = 'Distribuição pedida. Atualize em alguns segundos para ver o mês.'
      setTimeout(reload, 1500)
    } catch (err) {
      error.value = apiError(err)
    } finally {
      distributing.value = false
    }
  }
</script>
