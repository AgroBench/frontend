import { createRouter, createWebHistory } from 'vue-router'
import { fetchMe, homePathForRole } from '@/models/auth'
import { isAuthenticated, session } from '@/models/session'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve({ el: to.hash, behavior: 'smooth' })
        })
      })
    }
    if (savedPosition) return savedPosition
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/components/PublicShell.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: 'ciclos', name: 'cycles-public', component: () => import('@/views/public/CyclesCatalogView.vue'), meta: { title: 'Safras da região' } },
        { path: 'pool', name: 'pool-public', component: () => import('@/views/public/PoolCatalogView.vue'), meta: { title: 'Fundo coletivo' } },
      ],
    },
    {
      path: '/',
      component: () => import('@/components/AuthShell.vue'),
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
        { path: 'cadastro', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
        { path: 'cadastro/instituicao', name: 'register-institution', component: () => import('@/views/auth/InstitutionRegisterView.vue'), meta: { guest: true } },
        { path: 'mfa', name: 'mfa', component: () => import('@/views/auth/MfaView.vue') },
        { path: 'recuperar', name: 'recovery', component: () => import('@/views/auth/RecoveryView.vue'), meta: { guest: true } },
      ],
    },
    {
      path: '/app',
      component: () => import('@/components/AppShell.vue'),
      meta: { requiresAuth: true, role: 'producer' },
      children: [
        { path: '', name: 'producer-home', component: () => import('@/views/producer/DashboardView.vue'), meta: { title: 'Minha safra' } },
        { path: 'contribuir', name: 'producer-contribute', component: () => import('@/views/producer/ContributeView.vue'), meta: { title: 'Enviar dados da safra' } },
        { path: 'contribuicoes', name: 'producer-contributions', component: () => import('@/views/producer/ContributionsView.vue'), meta: { title: 'Meus envios' } },
        { path: 'propriedade', name: 'producer-property', component: () => import('@/views/producer/PropertyView.vue'), meta: { title: 'Minha fazenda' } },
        { path: 'carteira', name: 'producer-wallet', component: () => import('@/views/producer/WalletView.vue'), meta: { title: 'Minha conta' } },
        { path: 'benchmark', name: 'producer-benchmark', component: () => import('@/views/producer/BenchmarkView.vue'), meta: { title: 'Comparar com a região' } },
      ],
    },
    {
      path: '/inst',
      component: () => import('@/components/AppShell.vue'),
      meta: { requiresAuth: true, role: 'institution' },
      children: [
        { path: '', name: 'institution-home', component: () => import('@/views/institution/DashboardView.vue'), meta: { title: 'Acompanhamento' } },
        { path: 'assinatura', name: 'institution-subscribe', component: () => import('@/views/institution/SubscribeView.vue'), meta: { title: 'Acesso aos indicadores' } },
        { path: 'relatorio', name: 'institution-report', component: () => import('@/views/institution/ReportView.vue'), meta: { title: 'Relatório da safra' } },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/components/AppShell.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', name: 'admin-home', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: 'Bastidores da operação' } },
        { path: 'ciclos', name: 'admin-cycles', component: () => import('@/views/admin/CyclesView.vue'), meta: { title: 'Janelas de safra' } },
        { path: 'instituicoes', name: 'admin-institutions', component: () => import('@/views/admin/InstitutionsView.vue'), meta: { title: 'Cooperativas e bancos' } },
        { path: 'pool', name: 'admin-pool', component: () => import('@/views/admin/PoolView.vue'), meta: { title: 'Fundo coletivo' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.guest && isAuthenticated.value) {
    return homePathForRole()
  }

  if (to.meta.requiresAuth || to.matched.some((r) => r.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
    if (!session.user) {
      try {
        await fetchMe()
      } catch {
        return { path: '/login' }
      }
    }
    const needed = to.matched.find((r) => r.meta.role)?.meta.role
    if (needed && session.user?.role !== needed) {
      return homePathForRole(session.user?.role)
    }
  }

  if (to.name === 'mfa' && !session.mfaToken) {
    return '/login'
  }

  return true
})

export default router
