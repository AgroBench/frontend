<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener"
    class="proof-link text-decoration-none"
  >
    {{ label }}
    <v-icon size="16" icon="mdi-open-in-new" class="ml-1" />
  </a>
</template>

<script setup>
  defineProps({
    href: { type: String, default: '' },
    label: { type: String, default: 'Ver comprovante' },
  })
</script>

<style scoped>
.proof-link {
  color: #2f6d61;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
</style>
