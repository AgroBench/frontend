<template>
  <div>
    <PageHeader
      eyebrow="Conta"
      title="Onde o dinheiro da contribuição fica"
      subtitle="Sua conta no AgroBench guarda o saldo e as recompensas. Você não precisa de aplicativo de banco extra — a reserva é criada automaticamente."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="info" variant="tonal">{{ info }}</v-alert>

    <v-row>
      <v-col cols="12" md="7">
        <v-card class="pa-6 pa-md-8 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Saldo disponível</div>
          <div class="text-h3 font-weight-bold pitch-metric my-2">{{ formatValue(wallet?.balance_usdc) }}</div>
          <p class="text-body-2 text-medium-emphasis mb-6">
            Valor em garantia / dólar digital. É a recompensa por enviar a safra, mais a fatia do fundo coletivo quando a operação distribui o mês.
          </p>
          <div class="text-body-2 mb-4">Já recebido em recompensas: <strong>{{ formatValue(wallet?.reward_usdc) }}</strong></div>
          <AccountCode :code="wallet?.pubkey" />
          <div class="mt-4">
            <ProofLink :href="accountProofUrl(wallet?.pubkey)" label="Ver comprovante público da conta" />
          </div>
          <v-btn class="mt-6" variant="tonal" :loading="loading" @click="reload">Atualizar saldo</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="pa-6 pa-md-8 h-100 pitch-card" variant="flat">
          <h2 class="text-h6 mb-2">Cópia de segurança</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">
            Se quiser guardar um backup da conta, pedimos um código de verificação no celular. Na demonstração, o código é preenchido para você.
          </p>
          <v-btn class="mb-4" block variant="tonal" :loading="otpLoading" @click="requestOtp">
            Pedir código de verificação
          </v-btn>
          <v-text-field v-model="code" label="Código de verificação" maxlength="6" class="mb-3" />
          <v-btn block color="primary" :loading="exporting" @click="onExport">Gerar cópia</v-btn>
          <v-alert v-if="exported" class="mt-4" type="success" variant="tonal">
            Cópia gerada. Um arquivo foi baixado neste computador — guarde em local seguro.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h6 mt-10 mb-4">Recebimentos do fundo coletivo</h2>
    <EmptyState
      v-if="!payouts.length"
      icon="mdi-hand-coin-outline"
      title="Nenhum recebimento ainda"
      description="Quando a operação distribuir o fundo do mês, a sua fatia aparece aqui."
    />
    <v-row v-else>
      <v-col v-for="p in payouts" :key="p.id" cols="12" md="4">
        <v-card class="pa-5 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Recebido</div>
          <div class="text-h5 font-weight-bold pitch-metric">{{ formatValue(p.amount_usdc) }}</div>
          <ProofLink class="mt-3 d-inline-flex" :href="txProofUrl(p.tx)" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import AccountCode from '@/components/AccountCode.vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import ProofLink from '@/components/ProofLink.vue'
  import { fetchMockOtp } from '@/models/auth'
  import { apiError } from '@/models/errors'
  import { formatValue } from '@/models/labels'
  import { accountProofUrl, txProofUrl } from '@/models/proof'
  import { session } from '@/models/session'
  import { exportWallet, getWallet, listPayouts, persistWalletBlob, requestWalletExportOtp } from '@/models/wallet'

  const loading = ref(false)
  const otpLoading = ref(false)
  const exporting = ref(false)
  const error = ref('')
  const info = ref('')
  const wallet = ref(null)
  const payouts = ref([])
  const code = ref('')
  const exported = ref(false)

  async function reload () {
    loading.value = true
    error.value = ''
    try {
      wallet.value = await getWallet()
      payouts.value = await listPayouts()
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  }

  async function requestOtp () {
    error.value = ''
    info.value = ''
    otpLoading.value = true
    try {
      const result = await requestWalletExportOtp()
      if (result.otpRequired) {
        try {
          const otp = await fetchMockOtp(session.userId)
          code.value = otp.code
          info.value = 'Código de verificação preenchido para a demonstração.'
        } catch {
          info.value = 'Código enviado ao celular. Digite os 6 números para gerar a cópia.'
        }
      } else {
        downloadBackup(result.data)
      }
    } catch (err) {
      error.value = apiError(err)
    } finally {
      otpLoading.value = false
    }
  }

  function downloadBackup (data) {
    persistWalletBlob(data)
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'copia-conta-agrobench.json'
    a.click()
    URL.revokeObjectURL(url)
    exported.value = true
  }

  async function onExport () {
    error.value = ''
    exporting.value = true
    try {
      const data = await exportWallet(code.value.trim())
      downloadBackup(data)
    } catch (err) {
      error.value = apiError(err)
    } finally {
      exporting.value = false
    }
  }

  onMounted(reload)
</script>
