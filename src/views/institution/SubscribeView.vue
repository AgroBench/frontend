<template>
  <div>
    <PageHeader
      eyebrow="Acesso"
      title="Indicadores da safra"
      subtitle="Quem paga o dado é a instituição, não o agricultor. Escolha o recorte e confirme o acesso — na demonstração isso é imediato."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-card
          class="pa-6 h-100 pitch-card"
          variant="flat"
          :style="plan === 'regional' ? 'outline: 2px solid #2f6d61' : ''"
          @click="plan = 'regional'"
        >
          <p class="pitch-eyebrow mb-2">Regional</p>
          <div class="text-h4 font-weight-bold pitch-metric">500</div>
          <div class="text-body-2 text-medium-emphasis mb-4">em dólar digital / mês · até 5 microrregiões</div>
          <p class="text-body-2 mb-0">Para cooperativa ou banco que opera em uma praça — começando por Passo Fundo.</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card
          class="pa-6 h-100 pitch-card"
          variant="flat"
          :style="plan === 'national' ? 'outline: 2px solid #2f6d61' : ''"
          @click="plan = 'national'"
        >
          <p class="pitch-eyebrow mb-2">Nacional</p>
          <div class="text-h4 font-weight-bold pitch-metric">2.000</div>
          <div class="text-body-2 text-medium-emphasis mb-4">em dólar digital / mês · todo o Brasil</div>
          <p class="text-body-2 mb-0">Para quem precisa do mesmo indicador em várias praças, no mesmo recorte de safra.</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="pa-6 pa-md-8 mt-6 pitch-card" variant="flat">
      <v-select
        v-if="plan === 'regional'"
        v-model="regions"
        :items="regionItems"
        item-title="title"
        item-value="value"
        multiple
        chips
        label="Regiões do acesso"
        class="mb-4"
      />
      <v-btn color="primary" size="large" :loading="loading" @click="subscribe">
        Contratar acesso
      </v-btn>
    </v-card>

    <v-card v-if="checkout" class="pa-6 pa-md-8 mt-6 pitch-card" variant="flat">
      <h2 class="text-h6 mb-2">Confirmar o acesso</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Na demonstração, a confirmação é feita aqui mesmo — sem ir a um site de pagamento.
      </p>
      <v-btn color="primary" size="large" :loading="confirming" @click="confirm">
        Confirmar acesso
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import { listMicroRegions } from '@/models/catalog'
  import { apiError } from '@/models/errors'
  import { confirmMockPayment, subscribeInstitution } from '@/models/institution'

  const router = useRouter()
  const error = ref('')
  const info = ref('')
  const loading = ref(false)
  const confirming = ref(false)
  const plan = ref('regional')
  const regions = ref([])
  const catalog = ref([])
  const checkout = ref(null)

  const regionItems = computed(() => catalog.value.map((r) => ({
    title: `${r.name} — ${r.uf}`,
    value: r.id,
  })))

  onMounted(async () => {
    catalog.value = await listMicroRegions()
    const passoFundo = catalog.value.find((r) => r.ibge_code === '43010')
    if (passoFundo) regions.value = [passoFundo.id]
  })

  async function subscribe () {
    error.value = ''
    info.value = ''
    loading.value = true
    try {
      const body = { plan: plan.value }
      if (plan.value === 'regional') body.regions = regions.value
      checkout.value = await subscribeInstitution(body)
      info.value = 'Pedido criado. Confirme o acesso para abrir o relatório da safra.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }

  async function confirm () {
    error.value = ''
    confirming.value = true
    try {
      await confirmMockPayment({
        provider_ref: checkout.value.provider_ref,
        subscription_id: checkout.value.subscription_id,
        amount_usdc: plan.value === 'national' ? 2000 : 500,
      })
      info.value = 'Acesso liberado. Você já pode abrir o relatório da safra.'
      setTimeout(() => router.push('/inst/relatorio'), 800)
    } catch (err) {
      error.value = apiError(err)
    } finally {
      confirming.value = false
    }
  }
</script>
