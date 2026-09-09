<template>
  <div>
    <p class="pitch-eyebrow mb-3">Conta</p>
    <h1 class="text-h4 font-weight-bold mb-2">Redefinir senha</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Informe o CPF e o celular cadastrados. Se os dados conferirem, enviamos um código de verificação.
    </p>

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-form @submit.prevent="onStart">
      <v-text-field v-model="form.cpf" label="CPF" class="mb-2" />
      <v-text-field v-model="form.phone" label="Celular" placeholder="+5554999990001" class="mb-4" />
      <v-btn block color="primary" type="submit" :loading="loading">Enviar código</v-btn>
    </v-form>

    <v-divider class="my-8" />

    <h2 class="text-h6 mb-4">Confirmar nova senha</h2>
    <v-form @submit.prevent="onConfirm">
      <v-text-field v-model="form.code" label="Código de verificação" maxlength="6" class="mb-2" />
      <v-text-field v-model="form.new_password" label="Nova senha" type="password" class="mb-4" />
      <v-btn block variant="tonal" type="submit" :loading="confirming">Salvar senha nova</v-btn>
    </v-form>

    <v-btn class="mt-3" block variant="text" :loading="otpLoading" @click="fetchOtp">
      Usar o código da demonstração
    </v-btn>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import { fetchMockOtp, recoveryConfirm, recoveryStart } from '@/models/auth'
  import { apiError } from '@/models/errors'
  import { session } from '@/models/session'

  const router = useRouter()
  const loading = ref(false)
  const confirming = ref(false)
  const otpLoading = ref(false)
  const error = ref('')
  const info = ref('')
  const form = reactive({
    cpf: '',
    phone: '',
    code: '',
    new_password: '',
  })

  async function onStart () {
    error.value = ''
    info.value = ''
    loading.value = true
    try {
      await recoveryStart({ cpf: form.cpf, phone: form.phone })
      info.value = 'Se os dados conferirem, o código já foi enviado ao celular.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOtp () {
    error.value = ''
    otpLoading.value = true
    try {
      const data = await fetchMockOtp(session.userId)
      form.code = data.code
      info.value = 'Código da demonstração preenchido.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      otpLoading.value = false
    }
  }

  async function onConfirm () {
    error.value = ''
    info.value = ''
    confirming.value = true
    try {
      await recoveryConfirm({
        cpf: form.cpf,
        phone: form.phone,
        code: form.code,
        new_password: form.new_password,
      })
      info.value = 'Senha atualizada. Entre de novo com a senha nova.'
      setTimeout(() => router.push('/login'), 1200)
    } catch (err) {
      error.value = apiError(err)
    } finally {
      confirming.value = false
    }
  }
</script>
