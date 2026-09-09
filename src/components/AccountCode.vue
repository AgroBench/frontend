<template>
  <div>
    <div class="text-caption text-medium-emphasis mb-1">{{ label }}</div>
    <div class="d-flex align-center ga-2 flex-wrap">
      <span class="account-code">{{ shortAccount(code) }}</span>
      <v-btn
        v-if="code"
        size="x-small"
        variant="text"
        icon="mdi-content-copy"
        :aria-label="'Copiar código da conta'"
        @click="copy"
      />
    </div>
    <v-snackbar v-model="copied" timeout="1800" color="primary">Código copiado</v-snackbar>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { shortAccount } from '@/models/proof'

  const props = defineProps({
    code: { type: String, default: '' },
    label: { type: String, default: 'Código da conta' },
  })

  const copied = ref(false)

  async function copy () {
    try {
      await navigator.clipboard.writeText(props.code)
      copied.value = true
    } catch {
      copied.value = false
    }
  }
</script>
