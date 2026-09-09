<template>
  <div>
    <p class="pitch-eyebrow mb-3">Verificação</p>
    <h1 class="text-h4 font-weight-bold mb-2">Confirme que é você</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Enviamos um código de 6 números para o seu celular. Digite-o para entrar.
    </p>

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="hint" class="mb-4" type="info" variant="tonal">{{ hint }}</v-alert>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="code"
        label="Código de verificação"
        maxlength="6"
        inputmode="numeric"
        autocomplete="one-time-code"
        class="mb-4"
      />
      <v-btn block color="primary" type="submit" size="large" :loading="loading">Confirmar</v-btn>
    </v-form>

    <v-btn class="mt-4" block variant="text" :loading="otpLoading" @click="fetchOtp">
      Usar o código da demonstração
    </v-btn>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import { fetchMockOtp, homePathForRole, verifyMfa } from '@/models/auth'
  import { apiError } from '@/models/errors'

  const router = useRouter()
  const code = ref('')
  const loading = ref(false)
  const otpLoading = ref(false)
  const error = ref('')
  const hint = ref('')

  async function fetchOtp () {
    error.value = ''
    hint.value = ''
    otpLoading.value = true
    try {
      const data = await fetchMockOtp()
      code.value = data.code
      hint.value = 'Código da demonstração preenchido. Confirme para entrar.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      otpLoading.value = false
    }
  }

  async function onSubmit () {
    error.value = ''
    loading.value = true
    try {
      await verifyMfa(code.value.trim())
      await router.push(homePathForRole())
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchOtp()
  })
</script>
