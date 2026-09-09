<template>
  <div>
    <PageHeader
      eyebrow="Operação"
      title="Cooperativas e bancos"
      subtitle="Não há lista automática. Use o nome e o código guardados no cadastro desta máquina, ou o que a instituição passou na hora de se registrar."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-card v-if="lastInstitution" class="pa-6 mb-6 pitch-card" variant="flat">
      <p class="pitch-eyebrow mb-2">Último cadastro neste computador</p>
      <div class="text-h6">{{ lastInstitution.name }}</div>
      <div class="text-body-2 text-medium-emphasis mb-4">{{ lastInstitution.email }}</div>
      <v-btn color="primary" class="mr-2" :loading="acting === 'approve'" @click="useLastAndAct('approve')">
        Liberar esta instituição
      </v-btn>
      <v-btn variant="tonal" color="error" :loading="acting === 'reject'" @click="useLastAndAct('reject')">
        Recusar
      </v-btn>
    </v-card>

    <v-card class="pa-6 pa-md-8 mb-6 pitch-card" variant="flat">
      <h2 class="text-h6 mb-2">Liberar por código</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Cole o código que a instituição recebeu no cadastro (não é o e-mail).
      </p>
      <v-text-field v-model="institutionId" label="Código da instituição" class="mb-4" />
      <div class="d-flex ga-2">
        <v-btn color="primary" :loading="acting === 'approve'" @click="act('approve')">Liberar</v-btn>
        <v-btn color="error" variant="tonal" :loading="acting === 'reject'" @click="act('reject')">Recusar</v-btn>
      </div>
    </v-card>

    <v-card class="pa-6 pa-md-8 pitch-card" variant="flat">
      <h2 class="text-subtitle-1 font-weight-bold mb-2">Confirmar pagamento avulso</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Só use se a operação tiver o código do pagamento. O caminho usual da demo é a própria instituição confirmar o acesso na tela dela.
      </p>
      <v-text-field v-model="paymentId" label="Código do pagamento" class="mb-4" />
      <v-btn variant="tonal" :loading="confirming" @click="onConfirm">Confirmar pagamento</v-btn>
    </v-card>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import { confirmPayment } from '@/models/admin'
  import { apiError } from '@/models/errors'
  import { approveInstitution, rejectInstitution } from '@/models/institution'
  import { readLastInstitution } from '@/models/session'

  const error = ref('')
  const info = ref('')
  const institutionId = ref('')
  const paymentId = ref('')
  const acting = ref('')
  const confirming = ref(false)
  const lastInstitution = ref(null)

  onMounted(() => {
    lastInstitution.value = readLastInstitution()
    if (lastInstitution.value?.id) institutionId.value = lastInstitution.value.id
  })

  async function act (kind) {
    error.value = ''
    info.value = ''
    acting.value = kind
    try {
      if (kind === 'approve') await approveInstitution(institutionId.value.trim())
      else await rejectInstitution(institutionId.value.trim())
      info.value = kind === 'approve' ? 'Instituição liberada. Ela já pode contratar o acesso.' : 'Cadastro recusado.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      acting.value = ''
    }
  }

  function useLastAndAct (kind) {
    if (lastInstitution.value?.id) institutionId.value = lastInstitution.value.id
    return act(kind)
  }

  async function onConfirm () {
    error.value = ''
    info.value = ''
    confirming.value = true
    try {
      await confirmPayment(paymentId.value.trim())
      info.value = 'Pagamento confirmado.'
    } catch (err) {
      error.value = apiError(err)
    } finally {
      confirming.value = false
    }
  }
</script>
