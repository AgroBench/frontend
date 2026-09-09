<template>
  <div>
    <p class="pitch-eyebrow mb-3">Instituição</p>
    <h1 class="text-h4 font-weight-bold mb-2">Cadastro de cooperativa ou banco</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Depois do cadastro, a operação AgroBench libera o acesso. Você entra com o mesmo e-mail e senha.
    </p>

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="created" class="mb-4" type="success" variant="tonal">
      Cadastro enviado para {{ created.name }}. Assim que for liberado, entre com o e-mail cadastrado.
    </v-alert>

    <v-form v-if="!created" @submit.prevent="onSubmit">
      <v-text-field v-model="form.name" label="Nome da instituição" class="mb-2" />
      <v-text-field v-model="form.email" label="E-mail de trabalho" type="email" class="mb-2" />
      <v-text-field v-model="form.cnpj" label="CNPJ" placeholder="12.345.678/0001-95" class="mb-2" />
      <v-text-field v-model="form.password" label="Senha" type="password" hint="Pelo menos 8 caracteres" persistent-hint class="mb-4" />
      <v-btn block color="primary" type="submit" size="large" :loading="loading">Enviar cadastro</v-btn>
    </v-form>

    <v-btn v-else block color="primary" class="mt-2" to="/login">Ir para o login</v-btn>

    <p class="text-body-2 mt-6">
      É agricultor? <router-link to="/cadastro">Crie uma conta pessoal</router-link>
    </p>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import { apiError } from '@/models/errors'
  import { registerInstitution } from '@/models/institution'

  const loading = ref(false)
  const error = ref('')
  const created = ref(null)
  const form = reactive({
    name: '',
    email: '',
    cnpj: '',
    password: '',
  })

  async function onSubmit () {
    error.value = ''
    loading.value = true
    try {
      created.value = await registerInstitution({ ...form, email: form.email.trim() })
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }
</script>
