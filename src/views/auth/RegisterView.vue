<template>
  <div>
    <p class="pitch-eyebrow mb-3">Agricultor</p>
    <h1 class="text-h4 font-weight-bold mb-2">Criar sua conta</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      E-mail, telefone e CPF. Em seguida você confirma um código de verificação enviado ao celular.
    </p>

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-form @submit.prevent="onSubmit">
      <v-text-field v-model="form.email" label="E-mail" type="email" class="mb-2" />
      <v-text-field
        v-model="form.phone"
        label="Celular"
        placeholder="(54) 99999-0001"
        hint="Com DDD. Pode colar no formato +55…"
        persistent-hint
        class="mb-2"
      />
      <v-text-field v-model="form.cpf" label="CPF" placeholder="000.000.000-00" class="mb-2" />
      <v-text-field
        v-model="form.password"
        label="Senha"
        :type="showPass ? 'text' : 'password'"
        hint="Pelo menos 8 caracteres"
        persistent-hint
        :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
        class="mb-4"
        @click:append-inner="showPass = !showPass"
      />
      <v-btn block color="primary" type="submit" size="large" :loading="loading">Criar conta</v-btn>
    </v-form>

    <p class="text-body-2 mt-6 mb-0">
      Representa um banco ou cooperativa?
      <router-link to="/cadastro/instituicao">Cadastre a instituição</router-link>
    </p>
    <p class="text-body-2 mt-2">
      Já tem conta? <router-link to="/login">Entrar</router-link>
    </p>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import { registerProducer } from '@/models/auth'
  import { apiError } from '@/models/errors'

  const router = useRouter()
  const loading = ref(false)
  const error = ref('')
  const showPass = ref(false)
  const form = reactive({
    email: '',
    phone: '+5554999990001',
    cpf: '',
    password: '',
  })

  function toE164 (phone) {
    const digits = String(phone || '').replace(/\D/g, '')
    if (String(phone).startsWith('+')) return String(phone).replace(/\s/g, '')
    if (digits.length === 11) return `+55${digits}`
    if (digits.length === 13 && digits.startsWith('55')) return `+${digits}`
    return phone
  }

  async function onSubmit () {
    error.value = ''
    loading.value = true
    try {
      await registerProducer({
        ...form,
        email: form.email.trim(),
        phone: toE164(form.phone),
      })
      await router.push('/mfa')
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }
</script>
