import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/tree', name: 'tree', component: () => import('../views/TreePage.vue') },
  { path: '/tree/:id', name: 'tree-person', component: () => import('../views/TreePage.vue') },
  { path: '/person/new', name: 'new-person', component: () => import('../views/EditPerson.vue'), meta: { requiresAuth: true } },
  { path: '/person/:id', name: 'person-profile', component: () => import('../views/PersonProfile.vue') },
  { path: '/person/:id/edit', name: 'edit-person', component: () => import('../views/EditPerson.vue'), meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: () => import('../views/AdminPanel.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/moderation', name: 'moderation', component: () => import('../views/ModerationView.vue'), meta: { requiresAuth: true, requiresStaff: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization before checking any auth-related guards
  if (to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.requiresStaff) {
    await authStore.waitForUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'home' })
    return
  }

  if (to.meta.requiresStaff && !['admin', 'staff'].includes(authStore.user?.role)) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
