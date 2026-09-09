<template>
  <div>
    <p class="pitch-eyebrow mb-3">Entrar</p>
    <h1 class="text-h4 font-weight-bold mb-2">Acesse sua conta</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Agricultor confirma um código enviado ao celular. Cooperativa e operação entram só com e-mail e senha.
    </p>

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-btn
      class="mb-6"
      block
      size="large"
      color="primary"
      :loading="demoLoading"
      @click="enterDemo"
    >
      Acessar demonstração
    </v-btn>

    <v-form @submit.prevent="onSubmit">
      <v-text-field v-model="email" label="E-mail" type="email" autocomplete="username" class="mb-2" />
      <v-text-field
        v-model="password"
        label="Senha"
        :type="showPass ? 'text' : 'password'"
        autocomplete="current-password"
        :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
        class="mb-4"
        @click:append-inner="showPass = !showPass"
      />
      <v-btn block color="primary" variant="tonal" type="submit" size="large" :loading="loading">
        Entrar
      </v-btn>
    </v-form>

    <div class="d-flex justify-space-between mt-4 text-body-2">
      <router-link to="/recuperar">Esqueci a senha</router-link>
      <router-link to="/cadastro">Criar conta</router-link>
    </div>

    <v-expansion-panels class="mt-8" variant="accordion">
      <v-expansion-panel title="Outras contas da demo">
        <v-expansion-panel-text>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Use se quiser mostrar a cooperativa ou os bastidores da operação.
          </p>
          <v-btn
            v-for="account in OTHER_DEMO_ACCOUNTS"
            :key="account.key"
            class="mb-2"
            block
            variant="tonal"
            @click="fill(account)"
          >
            {{ account.label }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import { homePathForRole, login } from '@/models/auth'
  import { DEMO_PRODUCER, OTHER_DEMO_ACCOUNTS } from '@/models/demo'
  import { apiError } from '@/models/errors'

  const router = useRouter()
  const route = useRoute()
  const email = ref('')
  const password = ref('')
  const showPass = ref(false)
  const loading = ref(false)
  const demoLoading = ref(false)
  const error = ref('')

  function fill (account) {
    email.value = account.email
    password.value = account.password
  }

  async function goAfterLogin (result) {
    if (result.kind === 'mfa') {
      await router.push('/mfa')
      return
    }
    const redirect = route.query.redirect
    await router.push(typeof redirect === 'string' ? redirect : homePathForRole())
  }

  async function onSubmit () {
    error.value = ''
    loading.value = true
    try {
      const result = await login(email.value.trim(), password.value)
      await goAfterLogin(result)
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }

  async function enterDemo () {
    error.value = ''
    demoLoading.value = true
    fill(DEMO_PRODUCER)
    try {
      const result = await login(DEMO_PRODUCER.email, DEMO_PRODUCER.password)
      await goAfterLogin(result)
    } catch (err) {
      error.value = apiError(err)
    } finally {
      demoLoading.value = false
    }
  }
</script>
