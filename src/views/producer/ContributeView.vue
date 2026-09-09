<template>
  <div>
    <PageHeader
      eyebrow="Safra"
      title="Enviar dados da fazenda"
      subtitle="Dois passos: você informa os números e, em seguida, confirma. Ninguém da região vê o valor individual da sua propriedade."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-stepper v-model="step" alt-labels class="mb-6" :elevation="0">
      <v-stepper-header>
        <v-stepper-item :value="1" title="Qual safra" />
        <v-divider />
        <v-stepper-item :value="2" title="Os números" />
        <v-divider />
        <v-stepper-item :value="3" title="Confirmar" />
      </v-stepper-header>
    </v-stepper>

    <v-card v-show="step === 1" class="pa-6 pa-md-8 pitch-card" variant="flat">
      <v-alert v-if="!property || property.car_status !== 'approved'" class="mb-4" type="warning" variant="tonal">
        Cadastre e confirme a fazenda antes de enviar a safra.
        <router-link to="/app/propriedade">Ir para o cadastro</router-link>
      </v-alert>
      <v-alert v-else-if="!cycles.length" class="mb-4" type="info" variant="tonal">
        Nenhuma safra está recebendo envios agora. A operação AgroBench precisa abrir a janela.
      </v-alert>

      <v-select
        v-model="cycleId"
        :items="cycleItems"
        item-title="title"
        item-value="value"
        label="Safra aberta"
        class="mb-2"
      />
      <v-select
        v-model="level"
        :items="levelItems"
        item-title="title"
        item-value="value"
        label="Quanto detalhe você quer enviar"
        class="mb-2"
      />
      <p class="text-body-2 text-medium-emphasis mb-1">{{ LEVEL_HINT[level] }}</p>
      <p class="text-caption text-medium-emphasis mb-6">{{ LEVEL_HELP[level] }}</p>
      <v-btn color="primary" size="large" :disabled="!cycleId || property?.car_status !== 'approved'" @click="step = 2">
        Continuar
      </v-btn>
    </v-card>

    <v-card v-show="step === 2" class="pa-6 pa-md-8 pitch-card" variant="flat">
      <p class="text-body-2 text-medium-emphasis mb-6">
        Use os números reais da propriedade. Na demonstração, os valores já vêm preenchidos com um exemplo de soja em Passo Fundo.
      </p>
      <v-select
        v-model="form.culture_code"
        :items="cultureItems"
        item-title="title"
        item-value="value"
        label="Cultura"
        class="mb-2"
      />
      <v-text-field v-model.number="form.area_ha" label="Área plantada (hectares)" type="number" class="mb-2" />
      <v-text-field v-model.number="form.total_cost_brl" label="Custo total da safra (R$)" type="number" class="mb-2" />

      <template v-if="level !== 'basic'">
        <v-divider class="my-6" />
        <h3 class="text-subtitle-1 font-weight-bold mb-1">Custos por insumo</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">Quanto você gastou em cada frente — o que ajuda a média da região a ficar mais útil.</p>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.fertilizer_brl" label="Adubo (R$)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.pesticide_brl" label="Defensivo (R$)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.seed_brl" label="Semente (R$)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.fuel_brl" label="Combustível (R$)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.labor_brl" label="Mão de obra (R$)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="form.yield_sacks_ha" label="Produtividade (sacas/ha)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.planting_date" label="Data de plantio" type="date" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.harvest_date" label="Data de colheita" type="date" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.supplier_fertilizer" label="Fornecedor de adubo" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.supplier_pesticide" label="Fornecedor de defensivo" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.supplier_seed" label="Fornecedor de semente" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="form.supplier_fuel" label="Fornecedor de combustível" />
          </v-col>
        </v-row>
      </template>

      <template v-if="level === 'advanced'">
        <v-divider class="my-6" />
        <h3 class="text-subtitle-1 font-weight-bold mb-4">Detalhes da propriedade</h3>
        <v-text-field v-model="form.soil_type" label="Tipo de solo" class="mb-2" />
        <v-text-field v-model="form.rotation_history" label="Rotação recente (ex.: milho, trigo)" class="mb-2" />
        <v-switch v-model="form.irrigation_used" label="Usa irrigação" color="primary" />
        <v-select
          v-model="form.irrigation_system"
          :items="IRRIGATION_SYSTEMS"
          item-title="title"
          item-value="value"
          label="Sistema de irrigação"
          class="mb-2"
        />
        <v-text-field v-model="form.pest_name" label="Praga ou doença (se houve)" class="mb-2" />
        <v-text-field v-model="form.pest_management" label="Como foi o manejo" class="mb-2" />
        <v-select
          v-model="form.climate_event"
          :items="CLIMATE_EVENTS"
          item-title="title"
          item-value="value"
          clearable
          label="Evento climático"
          class="mb-2"
        />
        <v-text-field v-model.number="form.climate_area_pct" label="% da área afetada" type="number" class="mb-2" />
        <v-select
          v-model="form.mechanization_type"
          :items="MECHANIZATION_TYPES"
          item-title="title"
          item-value="value"
          label="Mecanização"
          class="mb-2"
        />
        <v-text-field v-model="form.machinery" label="Máquinas (separadas por vírgula)" class="mb-2" />
      </template>

      <div class="d-flex ga-2 mt-6">
        <v-btn variant="text" @click="step = 1">Voltar</v-btn>
        <v-btn color="primary" size="large" @click="step = 3">Revisar envio</v-btn>
      </div>
    </v-card>

    <v-card v-show="step === 3" class="pa-6 pa-md-8 pitch-card" variant="flat">
      <h3 class="text-h6 mb-2">Confira antes de enviar</h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Primeiro travamos 10 dólares digitais da sua conta. Depois registramos o envio e confirmamos os números. A análise da região acontece em seguida — você acompanha o status na tela.
      </p>

      <v-list class="bg-transparent mb-4">
        <v-list-item title="Safra" :subtitle="selectedCycleTitle" />
        <v-list-item title="Nível de detalhe" :subtitle="LEVEL_LABEL[level]" />
        <v-list-item title="Cultura" :subtitle="cultureLabel" />
        <v-list-item title="Área" :subtitle="`${form.area_ha} ha`" />
        <v-list-item title="Custo total" :subtitle="formatBrl(form.total_cost_brl)" />
      </v-list>

      <div class="d-flex ga-2">
        <v-btn variant="text" :disabled="sending" @click="step = 2">Voltar</v-btn>
        <v-btn color="primary" size="large" :loading="sending" @click="submit">Enviar e confirmar</v-btn>
      </div>

      <div v-if="sending || progress" class="mt-6">
        <v-progress-linear indeterminate color="primary" class="mb-3" />
        <p class="text-body-2 mb-0">{{ progress }}</p>
      </div>

      <v-card v-if="result" class="mt-6 pa-5" variant="tonal">
        <StatusChip :status="result.status" :label="CONTRIBUTION_STATUS_LABEL[result.status]" />
        <p class="text-body-1 mt-3 mb-2">{{ resultMessage }}</p>
        <div class="d-flex flex-column ga-2">
          <ProofLink
            :href="txProofUrl(contributionLockTx(result))"
            label="Ver comprovante da garantia"
          />
          <ProofLink :href="txProofUrl(result.commit_tx)" />
        </div>
        <div class="mt-4">
          <v-btn variant="tonal" to="/app">Ir para minha safra</v-btn>
        </div>
      </v-card>
    </v-card>
  </div>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import ProofLink from '@/components/ProofLink.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { cultureCode, cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { commitAndStoreDraft, revealFromDraft, waitForVerdict } from '@/models/contribution'
  import { isCycleAccepting, listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import {
    CLIMATE_EVENTS,
    CONTRIBUTION_STATUS_LABEL,
    formatBrl,
    IRRIGATION_SYSTEMS,
    LEVEL_HELP,
    LEVEL_HINT,
    LEVEL_LABEL,
    MECHANIZATION_TYPES,
  } from '@/models/labels'
  import { prepareCommit } from '@/models/payload'
  import { getProperty } from '@/models/property'
  import { contributionLockTx, txProofUrl } from '@/models/proof'
  import { saveLastFarm } from '@/models/session'
  import { ensureWallet } from '@/models/wallet'

  const step = ref(1)
  const error = ref('')
  const info = ref('')
  const sending = ref(false)
  const progress = ref('')
  const property = ref(null)
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])
  const cycleId = ref('')
  const level = ref('basic')
  const result = ref(null)

  const form = reactive({
    culture_code: 'soybean',
    area_ha: 50,
    total_cost_brl: 250000,
    fertilizer_brl: 60000,
    pesticide_brl: 41000,
    seed_brl: 25000,
    fuel_brl: 15000,
    labor_brl: 20000,
    yield_sacks_ha: 72,
    planting_date: '2025-10-15',
    harvest_date: '2026-03-01',
    supplier_fertilizer: 'Fornecedor A',
    supplier_pesticide: 'Fornecedor B',
    supplier_seed: 'Fornecedor C',
    supplier_fuel: 'Fornecedor D',
    soil_type: 'latossolo',
    rotation_history: 'corn, wheat',
    irrigation_used: true,
    irrigation_system: 'center_pivot',
    pest_name: 'ferrugem',
    pest_management: 'fungicida x',
    climate_event: 'drought',
    climate_area_pct: 12.5,
    mechanization_type: 'own',
    machinery: 'colheitadeira',
  })

  const levelItems = [
    { title: 'Essencial', value: 'basic' },
    { title: 'Completo', value: 'intermediate' },
    { title: 'Detalhado', value: 'advanced' },
  ]

  const cultureItems = computed(() => cultures.value.map((c) => ({
    title: c.name,
    value: c.code,
  })))

  const cycleItems = computed(() => cycles.value.map((c) => ({
    title: cycleTitle(c, cultures.value, regions.value),
    value: c.id,
  })))

  const selectedCycleTitle = computed(() => {
    const cycle = cycles.value.find((c) => c.id === cycleId.value)
    return cycleTitle(cycle, cultures.value, regions.value)
  })

  const cultureLabel = computed(() => {
    return cultures.value.find((c) => c.code === form.culture_code)?.name || form.culture_code
  })

  const resultMessage = computed(() => {
    if (!result.value) return ''
    if (result.value.status === 'accepted') {
      return 'Envio confirmado. A recompensa deve aparecer na sua conta em instantes.'
    }
    if (result.value.status === 'rejected') {
      return 'Os números não passaram na conferência da região. Você pode tentar de novo nesta mesma safra.'
    }
    return 'Recebemos o envio. A conferência ainda está em andamento — atualize meus envios daqui a pouco.'
  })

  onMounted(async () => {
    try {
      await ensureWallet()
      property.value = await getProperty()
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      const all = await listCycles({ status: 'open' })
      cycles.value = all.filter((c) => isCycleAccepting(c))
      cycleId.value = cycles.value[0]?.id || ''
      const selected = cycles.value[0]
      if (selected) {
        form.culture_code = cultureCode(cultures.value, selected.culture_id) || form.culture_code
      }
    } catch (err) {
      error.value = apiError(err)
    }
  })

  async function submit () {
    error.value = ''
    info.value = ''
    sending.value = true
    result.value = null
    progress.value = 'Preparando o envio da safra…'
    try {
      saveLastFarm({
        area_ha: form.area_ha,
        total_cost_brl: form.total_cost_brl,
        culture_code: form.culture_code,
        cycle_id: cycleId.value,
      })
      const prepared = await prepareCommit(cycleId.value, level.value, form)
      const committed = await commitAndStoreDraft({
        cycleId: cycleId.value,
        propertyId: property.value.id,
        level: level.value,
        prepared,
        onProgress: (message) => { progress.value = message },
      })
      progress.value = 'Confirmando os números…'
      await revealFromDraft(committed.id, prepared.plaintext_b64)
      progress.value = 'Conferindo com a média da região…'
      const verdict = await waitForVerdict(committed.id)
      result.value = { ...verdict, lock_tx: contributionLockTx(verdict) || committed.lock_tx }
      info.value = verdict.status === 'accepted'
        ? 'Safra confirmada. Veja o comprovante abaixo e o saldo na sua conta.'
        : ''
    } catch (err) {
      error.value = apiError(err)
    } finally {
      sending.value = false
      progress.value = ''
    }
  }
</script>
