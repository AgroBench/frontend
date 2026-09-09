<template>
  <div>
    <PageHeader
      eyebrow="Histórico"
      title="Meus envios"
      subtitle="Cada linha é um envio de safra — não o dado cru da fazenda. O vizinho nunca vê os seus números."
    >
      <template #actions>
        <v-btn color="primary" to="/app/contribuir">Novo envio</v-btn>
      </template>
    </PageHeader>

    <ErrorAlert :message="error" @clear="error = ''" />

    <EmptyState
      v-if="!items.length && !loading"
      icon="mdi-history"
      title="Nenhum envio ainda"
      description="Quando a janela da safra abrir, envie área, cultura e custo. O status aparece aqui: em análise, confirmado ou não aceito."
      action="Enviar dados da safra"
      to="/app/contribuir"
    />

    <v-row v-else>
      <v-col v-for="item in items" :key="item.id" cols="12" md="6">
        <v-card class="pa-6 h-100 pitch-card" variant="flat">
          <div class="d-flex align-center justify-space-between ga-3 mb-3">
            <StatusChip :status="item.status" :label="CONTRIBUTION_STATUS_LABEL[item.status]" />
            <span class="text-caption text-medium-emphasis">{{ LEVEL_LABEL[item.level] }}</span>
          </div>
          <h2 class="text-subtitle-1 font-weight-bold mb-1">{{ cycleTitleFor(item.cycle_id) }}</h2>
          <p v-if="item.attempt > 1" class="text-body-2 text-medium-emphasis mb-2">
            Segunda tentativa nesta safra
          </p>
          <p v-if="item.reject_reason" class="text-body-2 text-error mb-2">
            Os números não passaram na conferência da região. Você pode enviar de novo nesta mesma safra.
          </p>
          <div class="d-flex flex-column ga-2">
            <ProofLink
              :href="txProofUrl(contributionLockTx(item))"
              label="Ver comprovante da garantia"
            />
            <ProofLink :href="txProofUrl(item.commit_tx)" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import ProofLink from '@/components/ProofLink.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { listContributions } from '@/models/contribution'
  import { listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import { CONTRIBUTION_STATUS_LABEL, LEVEL_LABEL } from '@/models/labels'
  import { contributionLockTx, txProofUrl } from '@/models/proof'

  const loading = ref(true)
  const error = ref('')
  const items = ref([])
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])

  function cycleTitleFor (cycleId) {
    const cycle = cycles.value.find((c) => c.id === cycleId)
    return cycleTitle(cycle, cultures.value, regions.value)
  }

  onMounted(async () => {
    try {
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      cycles.value = await listCycles()
      items.value = await listContributions()
    } catch (err) {
      error.value = apiError(err)
    } finally {
      loading.value = false
    }
  })
</script>
