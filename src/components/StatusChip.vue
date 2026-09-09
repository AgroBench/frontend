<template>
  <v-chip :color="statusColor(status)" size="small" variant="tonal">
    {{ label || fallback }}
  </v-chip>
</template>

<script setup>
  import { computed } from 'vue'
  import { statusColor } from '@/models/labels'

  const props = defineProps({
    status: { type: String, default: '' },
    label: { type: String, default: '' },
  })

  const fallback = computed(() => props.status || '—')
</script>
