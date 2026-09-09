<template>
  <div>
    <PageHeader
      eyebrow="Fazenda"
      title="Cadastro da propriedade"
      subtitle="O CAR é o Cadastro Ambiental Rural. Usamos só para confirmar que a fazenda existe — o número não aparece para vizinhos nem no relatório."
    />

    <ErrorAlert :message="error" @clear="error = ''" />

    <v-card v-if="property" class="pa-6 pa-md-8 mb-6 pitch-card" variant="flat">
      <div class="d-flex align-center ga-3 mb-3">
        <StatusChip :status="property.car_status" :label="PROPERTY_STATUS_LABEL[property.car_status]" />
      </div>
      <div class="text-h6 mb-1">{{ regionName(regions, property.micro_region_id) }}</div>
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ property.car_status === 'approved'
          ? 'Propriedade confirmada. Você já pode enviar os dados da safra.'
          : 'Ainda não confirmamos este cadastro. Revise o número e a região, ou use o da demonstração.' }}
      </p>
      <p v-if="property.verified_at" class="text-caption text-medium-emphasis mt-3 mb-0">
        Confirmado em {{ formatDate(property.verified_at) }}
      </p>
    </v-card>

    <v-card class="pa-6 pa-md-8 pitch-card" variant="flat">
      <h2 class="text-h6 mb-2">{{ property ? 'Cadastrar outra propriedade' : 'Informar a fazenda' }}</h2>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Na demonstração, o número abaixo já está pronto para Passo Fundo. Em produção, você usaria o CAR real da propriedade.
      </p>
      <v-form @submit.prevent="onSubmit">
        <v-text-field
          v-model="car"
          label="Cadastro ambiental rural (CAR)"
          hint="Documento da fazenda no SICAR. Não é compartilhado com instituições."
          persistent-hint
          class="mb-4"
        />
        <v-select
          v-model="microRegionId"
          :items="regionItems"
          item-title="title"
          item-value="value"
          label="Microrregião"
          class="mb-6"
        />
        <v-btn color="primary" size="large" type="submit" :loading="saving">Confirmar fazenda</v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { listMicroRegions, regionName } from '@/models/catalog'
  import { DEMO_CAR } from '@/models/demo'
  import { apiError } from '@/models/errors'
  import { formatDate, PROPERTY_STATUS_LABEL } from '@/models/labels'
  import { createProperty, getProperty } from '@/models/property'

  const error = ref('')
  const saving = ref(false)
  const property = ref(null)
  const regions = ref([])
  const car = ref(DEMO_CAR)
  const microRegionId = ref('')

  const regionItems = computed(() => regions.value.map((r) => ({
    title: `${r.name} — ${r.uf}`,
    value: r.id,
  })))

  onMounted(async () => {
    try {
      regions.value = await listMicroRegions()
      const passoFundo = regions.value.find((r) => r.ibge_code === '43010')
      microRegionId.value = passoFundo?.id || regions.value[0]?.id || ''
      property.value = await getProperty()
    } catch (err) {
      error.value = apiError(err)
    }
  })

  async function onSubmit () {
    error.value = ''
    saving.value = true
    try {
      property.value = await createProperty({
        car: car.value.trim(),
        micro_region_id: microRegionId.value,
      })
    } catch (err) {
      error.value = apiError(err)
    } finally {
      saving.value = false
    }
  }
</script>
