<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :temporary="mobile">
      <div class="px-5 py-5 d-flex align-center ga-2">
        <BrandMark />
        <div>
          <div class="font-weight-bold">AgroBench</div>
          <div class="text-caption text-medium-emphasis">{{ ROLE_LABEL[session.user?.role] }}</div>
        </div>
      </div>
      <v-divider />
      <v-list nav class="px-2 pt-3">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          color="primary"
          rounded="lg"
        />
      </v-list>
      <template #append>
        <div class="pa-4">
          <div class="text-body-2 font-weight-medium text-truncate">{{ session.user?.email }}</div>
          <div class="text-caption text-medium-emphasis mb-3">{{ ROLE_LABEL[session.user?.role] }}</div>
          <v-btn block variant="tonal" prepend-icon="mdi-logout" @click="onLogout">Sair</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat style="background: #f6f2e6">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="font-weight-medium">{{ title }}</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="py-6 py-md-8" style="max-width: 1120px">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { useRoute, useRouter } from 'vue-router'
  import BrandMark from '@/components/BrandMark.vue'
  import { logout } from '@/models/auth'
  import { ROLE_LABEL } from '@/models/labels'
  import { session } from '@/models/session'

  const route = useRoute()
  const router = useRouter()
  const { mobile } = useDisplay()
  const drawer = ref(!mobile.value)

  const title = computed(() => route.meta.title || 'AgroBench')

  const navByRole = {
    producer: [
      { title: 'Minha safra', to: '/app', icon: 'mdi-sprout-outline' },
      { title: 'Enviar dados', to: '/app/contribuir', icon: 'mdi-clipboard-text-outline' },
      { title: 'Meus envios', to: '/app/contribuicoes', icon: 'mdi-history' },
      { title: 'Minha fazenda', to: '/app/propriedade', icon: 'mdi-barn' },
      { title: 'Minha conta', to: '/app/carteira', icon: 'mdi-safe-square-outline' },
      { title: 'Comparar com a região', to: '/app/benchmark', icon: 'mdi-chart-bell-curve-cumulative' },
    ],
    institution: [
      { title: 'Acompanhamento', to: '/inst', icon: 'mdi-view-dashboard-outline' },
      { title: 'Acesso aos indicadores', to: '/inst/assinatura', icon: 'mdi-key-outline' },
      { title: 'Relatório da safra', to: '/inst/relatorio', icon: 'mdi-file-chart-outline' },
    ],
    admin: [
      { title: 'Operação', to: '/admin', icon: 'mdi-office-building-cog-outline' },
      { title: 'Janelas de safra', to: '/admin/ciclos', icon: 'mdi-calendar-range' },
      { title: 'Cooperativas e bancos', to: '/admin/instituicoes', icon: 'mdi-domain' },
      { title: 'Fundo coletivo', to: '/admin/pool', icon: 'mdi-hand-coin-outline' },
    ],
  }

  const navItems = computed(() => navByRole[session.user?.role] || [])

  async function onLogout () {
    await logout()
    router.push('/login')
  }
</script>
