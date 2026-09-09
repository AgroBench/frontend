<template>
  <v-card class="next-step-card pa-6 pa-md-8" variant="flat">
    <p class="text-caption mb-2" style="letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8">
      {{ eyebrow }}
    </p>
    <h2 class="text-h5 text-md-h4 font-weight-bold mb-2">{{ title }}</h2>
    <p class="text-body-1 mb-6" style="max-width: 52ch; opacity: 0.92">{{ body }}</p>
    <v-btn size="large" :to="to" :disabled="disabled">{{ action }}</v-btn>
  </v-card>
</template>

<script setup>
  defineProps({
    eyebrow: { type: String, default: 'Próximo passo' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    action: { type: String, required: true },
    to: { type: [String, Object], default: '' },
    disabled: { type: Boolean, default: false },
  })
</script>
