<template>
  <v-alert
    v-if="message"
    class="mb-4"
    type="error"
    variant="tonal"
    closable
    @click:close="$emit('clear')"
  >
    {{ message }}
  </v-alert>
</template>

<script setup>
  defineProps({
    message: { type: String, default: '' },
  })
  defineEmits(['clear'])
</script>
