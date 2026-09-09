<template>
  <div>
    <PageHeader
      eyebrow="Instituição"
      :title="me?.name || 'Acompanhamento da safra'"
      subtitle="Indicadores agregados das propriedades da região — custo, produtividade e risco, sem dado individual de agricultor."
    />

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-6 pa-md-8 h-100 pitch-card" variant="flat">
          <div class="d-flex align-center ga-3 mb-4">
            <StatusChip v-if="me" :status="me.status" :label="INSTITUTION_STATUS_LABEL[me.status]" />
          </div>
          <p class="text-body-1 mb-0">{{ statusStory }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-6 pa-md-8 h-100 pitch-card" variant="flat">
          <div class="text-caption text-medium-emphasis">Safras com média disponível</div>
          <div class="text-h3 font-weight-bold pitch-metric my-2">{{ aggregatedCount }}</div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Escolha uma safra no relatório para ver custo e produtividade da região.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <NextStepCard
      class="mb-8"
      :title="nextStep.title"
      :body="nextStep.body"
      :action="nextStep.action"
      :to="nextStep.to"
    />

    <h2 class="text-h6 mb-4">Safras em acompanhamento</h2>
    <EmptyState
      v-if="!cycles.length"
      title="Nenhuma safra listada"
      description="Quando a operação abrir janelas de envio, elas aparecem aqui."
    />
    <v-row v-else>
      <v-col v-for="c in cycles.slice(0, 6)" :key="c.id" cols="12" md="4">
        <v-card class="pa-5 h-100 pitch-card" variant="flat">
          <StatusChip :status="c.status" :label="CYCLE_STATUS_LABEL[c.status]" />
          <div class="text-subtitle-1 font-weight-bold mt-3">{{ cycleTitle(c, cultures, regions) }}</div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ formatDateShort(c.opens_at) }} — {{ formatDateShort(c.closes_at) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import EmptyState from '@/components/EmptyState.vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import NextStepCard from '@/components/NextStepCard.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import { getInstitutionMe } from '@/models/institution'
  import { CYCLE_STATUS_LABEL, formatDateShort, INSTITUTION_STATUS_LABEL } from '@/models/labels'

  const error = ref('')
  const me = ref(null)
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])

  const aggregatedCount = computed(() => cycles.value.filter((c) => c.status === 'aggregated').length)

  const statusStory = computed(() => {
    if (me.value?.status === 'pending') {
      return 'Seu cadastro aguarda liberação da operação AgroBench. Assim que for aprovado, você contrata o acesso aos indicadores.'
    }
    if (me.value?.status === 'rejected') {
      return 'Este cadastro não foi liberado. Fale com a operação AgroBench.'
    }
    if (me.value?.status === 'approved') {
      return 'Instituição liberada. Contrate o acesso regional ou nacional para consultar o relatório da safra.'
    }
    return 'Carregando o status da instituição…'
  })

  const nextStep = computed(() => {
    if (me.value?.status !== 'approved') {
      return {
        title: 'Aguarde a liberação',
        body: 'A operação AgroBench confirma cooperativas e bancos antes de abrir os indicadores. Você não precisa fazer nada agora.',
        action: 'Atualizar esta tela',
        to: '/inst',
      }
    }
    return {
      title: 'Liberar o relatório da safra',
      body: 'Escolha o recorte regional ou o Brasil inteiro. Na demonstração, a confirmação do acesso é imediata.',
      action: 'Contratar acesso',
      to: '/inst/assinatura',
    }
  })

  onMounted(async () => {
    try {
      me.value = await getInstitutionMe()
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      cycles.value = await listCycles()
    } catch (err) {
      error.value = apiError(err)
    }
  })
</script>
