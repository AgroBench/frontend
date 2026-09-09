<template>
  <div>
    <PageHeader
      eyebrow="Bastidores"
      title="Operação AgroBench"
      subtitle="Abrir a janela da safra, liberar cooperativas e distribuir o fundo coletivo. Esta área é da operação — o agricultor não vê estes controles."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Serviço</div>
          <div class="text-h5 font-weight-bold mt-1">{{ serviceLabel }}</div>
          <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
            {{ ready?.database === 'up' ? 'Base de dados respondendo.' : 'Confira se o ambiente da demo está no ar.' }}
          </p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <h2 class="text-h6 mb-2">Preparar a demonstração</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Carrega o agricultor de Passo Fundo, dezenas de safras no RS (soja, milho, trigo), a Cotrijal liberada e o fundo coletivo.
          </p>
          <v-btn color="primary" :loading="seeding" @click="onSeed">Preparar dados da demo</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="link in links" :key="link.to" cols="12" md="4">
        <v-card class="pa-6 pitch-card" variant="flat" :to="link.to">
          <div class="text-subtitle-1 font-weight-bold mb-1">{{ link.title }}</div>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ link.body }}</p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import { getHealth, getReady, seedDemo } from '@/models/admin'
  import { apiError } from '@/models/errors'

  const error = ref('')
  const info = ref('')
  const seeding = ref(false)
  const health = ref(null)
  const ready = ref(null)

  const serviceLabel = computed(() => {
    if (health.value?.status === 'ok') return 'No ar'
    if (health.value) return 'Instável'
    return '—'
  })

  const links = [
    { title: 'Janelas de safra', body: 'Abrir uma janela contendo agora para o agricultor enviar ao vivo.', to: '/admin/ciclos' },
    { title: 'Cooperativas e bancos', body: 'Liberar o cadastro que chegou pelo formulário da instituição.', to: '/admin/instituicoes' },
    { title: 'Fundo coletivo', body: 'Distribuir o mês para as contas de quem contribuiu.', to: '/admin/pool' },
  ]

  onMounted(async () => {
    try {
      health.value = await getHealth()
      ready.value = await getReady()
    } catch (err) {
      error.value = apiError(err)
    }
  })

  async function onSeed () {
    error.value = ''
    info.value = ''
    seeding.value = true
    try {
      await seedDemo()
      info.value = 'Dados da demonstração prontos. O agricultor e a cooperativa já podem entrar.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      seeding.value = false
    }
  }
</script>
