<template>
  <div>
    <PageHeader
      eyebrow="Operação"
      title="Janelas de safra"
      subtitle="Cada janela é uma cultura × região × ano-safra. Abra uma contendo a data de hoje para o agricultor enviar ao vivo na demo."
    />

    <ErrorAlert :message="error" @clear="error = ''" />
    <v-alert v-if="info" class="mb-4" type="success" variant="tonal">{{ info }}</v-alert>

    <v-card class="pa-6 pa-md-8 mb-8 pitch-card" variant="flat">
      <h2 class="text-h6 mb-4">Abrir janela</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-select v-model="form.culture_id" :items="cultureItems" item-title="title" item-value="value" label="Cultura" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.micro_region_id" :items="regionItems" item-title="title" item-value="value" label="Região" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.label" label="Safra (ex.: 2026/27)" placeholder="2026/27" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.opens_at" label="Abre em" type="datetime-local" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.closes_at" label="Encerra em" type="datetime-local" />
        </v-col>
      </v-row>
      <v-btn color="primary" size="large" :loading="saving" @click="onCreate">Abrir janela</v-btn>
    </v-card>

    <v-row>
      <v-col v-for="c in cycles" :key="c.id" cols="12" md="6">
        <v-card class="pa-5 pitch-card" variant="flat">
          <div class="d-flex align-center justify-space-between ga-3 mb-2">
            <StatusChip :status="c.status" :label="CYCLE_STATUS_LABEL[c.status]" />
            <v-btn
              v-if="c.status === 'open'"
              size="small"
              variant="tonal"
              :loading="closing === c.id"
              @click="onClose(c.id)"
            >
              Encerrar e consolidar
            </v-btn>
          </div>
          <div class="text-subtitle-1 font-weight-bold">{{ cycleTitle(c, cultures, regions) }}</div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ formatDate(c.opens_at) }} → {{ formatDate(c.closes_at) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import ErrorAlert from '@/components/ErrorAlert.vue'
  import PageHeader from '@/components/PageHeader.vue'
  import StatusChip from '@/components/StatusChip.vue'
  import { cycleTitle, listCultures, listMicroRegions } from '@/models/catalog'
  import { closeCycle, createCycle, listCycles } from '@/models/cycle'
  import { apiError } from '@/models/errors'
  import { CYCLE_STATUS_LABEL, formatDate } from '@/models/labels'

  const error = ref('')
  const info = ref('')
  const saving = ref(false)
  const closing = ref('')
  const cycles = ref([])
  const cultures = ref([])
  const regions = ref([])

  const form = reactive({
    culture_id: '',
    micro_region_id: '',
    label: '2026/27',
    opens_at: toLocalInput(new Date(Date.now() - 3600_000)),
    closes_at: toLocalInput(new Date(Date.now() + 180 * 24 * 3600_000)),
  })

  const cultureItems = computed(() => cultures.value.map((c) => ({ title: c.name, value: c.id })))
  const regionItems = computed(() => regions.value.map((r) => ({ title: `${r.name} — ${r.uf}`, value: r.id })))

  function toLocalInput (d) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function toRfc3339 (local) {
    return new Date(local).toISOString().replace(/\.\d{3}Z$/, 'Z')
  }

  async function reload () {
    cycles.value = await listCycles()
  }

  onMounted(async () => {
    try {
      cultures.value = await listCultures()
      regions.value = await listMicroRegions()
      form.culture_id = cultures.value.find((c) => c.code === 'soybean')?.id || cultures.value[0]?.id || ''
      form.micro_region_id = regions.value.find((r) => r.ibge_code === '43010')?.id || regions.value[0]?.id || ''
      await reload()
    } catch (err) {
      error.value = apiError(err)
    }
  })

  async function onCreate () {
    error.value = ''
    info.value = ''
    saving.value = true
    try {
      await createCycle({
        culture_id: form.culture_id,
        micro_region_id: form.micro_region_id,
        label: form.label,
        opens_at: toRfc3339(form.opens_at),
        closes_at: toRfc3339(form.closes_at),
      })
      info.value = 'Janela aberta. O agricultor já pode enviar os dados da safra.'
      await reload()
    } catch (err) {
      error.value = apiError(err)
    } finally {
      saving.value = false
    }
  }

  async function onClose (id) {
    error.value = ''
    closing.value = id
    try {
      await closeCycle(id)
      info.value = 'Janela encerrada. A média da região está sendo consolidada — atualize em alguns segundos.'
      await reload()
    } catch (err) {
      error.value = apiError(err)
    } finally {
      closing.value = ''
    }
  }
</script>
