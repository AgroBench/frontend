<template>
  <v-app>
    <v-app-bar flat class="px-md-4" style="background: color-mix(in srgb, #f6f2e6 88%, transparent); backdrop-filter: blur(14px)">
      <v-toolbar-title>
        <router-link to="/" class="d-flex align-center ga-2 text-decoration-none">
          <BrandMark />
          <span class="font-weight-bold">AgroBench</span>
        </router-link>
      </v-toolbar-title>
      <v-spacer />
      <v-btn class="d-none d-sm-inline-flex" variant="text" :to="{ path: '/', hash: '#como' }">Como funciona</v-btn>
      <v-btn class="d-none d-md-inline-flex" variant="text" to="/ciclos">Safras</v-btn>
      <v-btn v-if="isAuthenticated" color="primary" :to="homePathForRole()">Meu painel</v-btn>
      <template v-else>
        <v-btn variant="text" to="/login">Entrar</v-btn>
        <v-btn class="ml-1" color="primary" to="/cadastro">Sou agricultor</v-btn>
      </template>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import BrandMark from '@/components/BrandMark.vue'
  import { homePathForRole } from '@/models/auth'
  import { isAuthenticated } from '@/models/session'
</script>
