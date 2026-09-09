<template>
  <v-sheet class="pa-8 pa-md-10 text-center pitch-card" rounded="xl" variant="flat">
    <v-icon :icon="icon" color="primary" size="48" class="mb-3" />
    <h3 class="text-h6 mb-1">{{ title }}</h3>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>
    <v-btn v-if="action" color="primary" :to="to || undefined" @click="$emit('action')">
      {{ action }}
    </v-btn>
  </v-sheet>
</template>

<script setup>
  defineProps({
    icon: { type: String, default: 'mdi-inbox-outline' },
    title: { type: String, default: 'Nada por aqui' },
    description: { type: String, default: '' },
    action: { type: String, default: '' },
    to: { type: [String, Object], default: null },
  })
  defineEmits(['action'])
</script>
