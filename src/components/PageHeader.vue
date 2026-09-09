<template>
  <div class="d-flex flex-wrap align-start justify-space-between ga-4 mb-6">
    <div>
      <p v-if="eyebrow" class="pitch-eyebrow mb-2">
        {{ eyebrow }}
      </p>
      <h1 class="text-h4 font-weight-bold" style="letter-spacing: -0.03em">{{ title }}</h1>
      <p v-if="subtitle" class="text-body-1 text-medium-emphasis mt-2 mb-0" style="max-width: 62ch">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="d-flex ga-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
  defineProps({
    eyebrow: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  })
</script>
