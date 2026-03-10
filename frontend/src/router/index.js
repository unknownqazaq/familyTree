import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TreePage from '../views/TreePage.vue'
import EditPerson from '../views/EditPerson.vue'
import SettingsView from '../views/SettingsView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import ModerationView from '../views/ModerationView.vue'
import SearchView from '../views/SearchView.vue'
import PersonProfile from '../views/PersonProfile.vue'
import AboutView from '../views/AboutView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/tree', name: 'tree', component: TreePage },
  { path: '/tree/:id', name: 'tree-person', component: TreePage },
  { path: '/person/new', name: 'new-person', component: EditPerson, meta: { requiresAuth: true } },
  { path: '/person/:id', name: 'person-profile', component: PersonProfile },
  { path: '/person/:id/edit', name: 'edit-person', component: EditPerson, meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/moderation', name: 'moderation', component: ModerationView, meta: { requiresAuth: true, requiresStaff: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin || to.meta.requiresStaff) {
    await authStore.waitForUser()
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
