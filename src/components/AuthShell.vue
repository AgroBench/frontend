<template>
  <v-app>
    <v-app-bar flat class="px-md-4" style="background: color-mix(in srgb, #f6f2e6 88%, transparent)">
      <v-toolbar-title>
        <router-link to="/" class="d-flex align-center ga-2 text-decoration-none">
          <BrandMark />
          <span class="font-weight-bold">AgroBench</span>
        </router-link>
      </v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" to="/login">Entrar</v-btn>
      <v-btn class="ml-1" color="primary" to="/cadastro">Criar conta</v-btn>
    </v-app-bar>
    <v-main class="pitch-hero-field">
      <v-container class="py-10 py-md-16" style="max-width: 480px">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import BrandMark from '@/components/BrandMark.vue'
</script>
