<template>
  <v-row>
    <v-col v-for="item in items" :key="item.metric" cols="12" sm="6" md="4">
      <v-card class="h-100 pa-5 pitch-card" variant="flat">
        <div class="text-caption text-medium-emphasis mb-2">{{ metricLabel(item.metric) }}</div>
        <div class="text-h4 font-weight-bold pitch-metric">{{ fmt(item.median) }}</div>
        <div class="text-caption text-medium-emphasis mt-2">mediana da região</div>
        <div class="text-body-2 mt-3">
          Média {{ fmt(item.mean) }}
          <span class="text-medium-emphasis"> · metade das fazendas entre {{ fmt(item.p25) }} e {{ fmt(item.p75) }}</span>
        </div>
        <div v-if="item.n != null" class="text-caption text-medium-emphasis mt-2">
          Com base em {{ item.n }} {{ item.n === 1 ? 'propriedade' : 'propriedades' }}
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
  import { metricLabel } from '@/models/labels'

  defineProps({
    items: { type: Array, default: () => [] },
  })

  function fmt (n) {
    if (n == null || Number.isNaN(Number(n))) return '—'
    return Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  }
</script>
