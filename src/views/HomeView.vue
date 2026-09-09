<template>
  <div class="pitch-hero-field">
    <v-container class="py-12 py-md-16">
      <v-row align="center" class="mb-12 mb-md-16">
        <v-col cols="12" md="7">
          <p class="pitch-eyebrow mb-4">Benchmarking regional · Passo Fundo e o RS</p>
          <h1 class="text-h3 text-md-h2 font-weight-bold mb-5" style="letter-spacing: -0.03em; max-width: 16ch">
            Quanto o vizinho está pagando — sem expor o dado de ninguém.
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-8" style="max-width: 52ch">
            Você envia os custos da safra. O AgroBench junta com os da região e devolve a média.
            Bancos e cooperativas pagam pelo relatório — e parte desse valor volta para quem contribuiu.
          </p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="primary" size="large" to="/cadastro">Sou agricultor</v-btn>
            <v-btn variant="tonal" size="large" to="/cadastro/instituicao">Sou instituição</v-btn>
            <v-btn variant="text" size="large" to="/login">Já tenho conta</v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="5">
          <v-card class="pa-6 pa-md-8 pitch-card" variant="flat" id="como" style="scroll-margin-top: 80px">
            <p class="pitch-eyebrow mb-5">Como funciona</p>
            <div v-for="(step, i) in steps" :key="step.title" class="d-flex ga-4" :class="i < steps.length - 1 ? 'mb-6' : ''">
              <div class="pitch-metric text-primary" style="min-width: 2ch">{{ String(i + 1).padStart(2, '0') }}</div>
              <div>
                <div class="font-weight-bold mb-1">{{ step.title }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ step.body }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-12">
        <v-col v-for="stat in stats" :key="stat.label" cols="12" md="4">
          <v-card class="pa-6 h-100 pitch-card" variant="flat">
            <div class="pitch-eyebrow mb-3">{{ stat.label }}</div>
            <div class="text-h5 font-weight-bold pitch-metric mb-2">{{ stat.value }}</div>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ stat.body }}</p>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="card in cards" :key="card.title" cols="12" md="6">
          <v-card class="pa-6 pa-md-8 h-100 pitch-card" variant="flat">
            <v-icon :icon="card.icon" color="primary" class="mb-4" size="32" />
            <h2 class="text-h5 mb-2">{{ card.title }}</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">{{ card.body }}</p>
            <v-btn color="primary" :to="card.to">{{ card.action }}</v-btn>
          </v-card>
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap justify-space-between ga-4 mt-16 pt-8" style="border-top: 1px solid rgba(28,28,17,0.12)">
        <div class="text-body-2 text-medium-emphasis">AgroBench · dado da safra, sem expor ninguém.</div>
        <div class="d-flex ga-4 text-body-2">
          <router-link to="/ciclos">Safras da região</router-link>
          <router-link to="/pool">Fundo coletivo</router-link>
          <router-link to="/login">Entrar</router-link>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup>
  import { nextTick, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  function scrollToComo() {
    if (route.hash !== '#como') return
    nextTick(() => {
      document.getElementById('como')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  onMounted(scrollToComo)
  watch(() => route.hash, scrollToComo)

  const steps = [
    {
      title: 'Envie os dados da fazenda',
      body: 'Área, cultura e quanto custou a safra. Ninguém da região vê o seu número individual.',
    },
    {
      title: 'Compare com a média',
      body: 'Depois de três safras confirmadas, você vê se está pagando mais ou menos que a região.',
    },
    {
      title: 'Quem usa o relatório paga — você recebe',
      body: 'Bancos e cooperativas assinam os indicadores. Parte do valor volta para quem contribuiu.',
    },
  ]

  const stats = [
    { label: 'Plano Safra', value: 'R$ 605 bi', body: 'Crédito rural no Brasil que hoje precifica risco sem a média real da região.' },
    { label: 'Começamos no RS', value: 'Passo Fundo', body: 'Soja, milho e trigo na microrregião — a base da demonstração.' },
    { label: 'Seu dado', value: 'Fica anônimo', body: 'A comparação mostra só a média. O número da sua fazenda não aparece para o vizinho.' },
  ]

  const cards = [
    {
      icon: 'mdi-sprout-outline',
      title: 'Para o agricultor',
      body: 'Cadastre a fazenda, envie a safra e veja se o adubo e o custo total estão acima ou abaixo da média da região. A recompensa cai na sua conta no AgroBench.',
      action: 'Começar como agricultor',
      to: '/cadastro',
    },
    {
      icon: 'mdi-bank-outline',
      title: 'Para banco, cooperativa e seguradora',
      body: 'Acesse o relatório da safra — custo, produtividade e risco por região e cultura — com dado atualizado, não estimativa de safra antiga.',
      action: 'Começar como instituição',
      to: '/cadastro/instituicao',
    },
  ]
</script>
