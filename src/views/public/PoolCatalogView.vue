<template>
  <v-container class="py-10 py-md-12">
    <PageHeader
      title="Fundo coletivo"
      subtitle="A receita das instituições entra neste fundo. Depois de custos de operação, o restante volta para quem enviou a safra."
    />
    <ErrorAlert :message="error" @clear="error = ''" />

    <EmptyState
      v-if="!periods.length && !loading"
      icon="mdi-hand-coin-outline"
      title="O fundo ainda não tem um mês fechado"
      description="Quando a operação distribuir um mês, o resumo público aparece aqui."
    />

    <v-row v-else>
      <v-col v-for="p in periods" :key="p.id" cols="12" md="6">
        <v-card class="pa-6 pitch-card" variant="flat">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-h6">{{ p.month }}</div>
            <StatusChip :status="p.status" :label="POOL_STATUS_LABEL[p.status]" />
          </div>
          <div class="text-body-2">Entradas: {{ formatValue(p.gross) }}</div>
          <div class="text-subtitle-1 font-weight-bold mt-3">
            Líquido aos agricultores: {{ formatValue(p.net) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { apiError } from '@/models/errors'
  import { formatValue, POOL_STATUS_LABEL } from '@/models/labels'
  import { listPoolPeriods } from '@/models/pool'

  const error = ref('')
  const loading = ref(true)
  const periods = ref([])

  onMounted(async () => {
    try {
      periods.value = await listPoolPeriods()
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  })
</script>
