<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">{{ t('nav.brand') }}</router-link>

      <div class="navbar-center">
        <router-link to="/tree">{{ t('nav.tree') }}</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/person/new">{{ t('nav.addPerson') }}</router-link>
      </div>

      <div class="navbar-right">
        <!-- Dark mode toggle -->
        <button class="theme-btn" :title="dark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <svg v-if="dark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1"  x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1"  y1="12" x2="3"  y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64"  y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <div class="lang-switch">
          <select v-model="localeValue" class="lang-select" aria-label="Language">
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="kk">KK</option>
          </select>
        </div>

        <!-- Authenticated: avatar + dropdown -->
        <template v-if="authStore.isAuthenticated">
          <div class="user-menu" ref="menuRef">
            <button class="avatar-btn" @click="dropdownOpen = !dropdownOpen" :aria-expanded="dropdownOpen">
              <span class="avatar-circle">{{ avatarLetter }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="dropdownOpen" class="dropdown" role="menu">
                <div class="dropdown-header">
                  <span class="avatar-circle avatar-lg">{{ avatarLetter }}</span>
                  <div class="dropdown-user-info">
                    <span class="dropdown-email">{{ authStore.user?.email }}</span>
                    <span class="dropdown-role">{{ roleLabel }}</span>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <router-link to="/settings" class="dropdown-item" @click="dropdownOpen = false">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  {{ t('nav.settings') }}
                </router-link>

                <router-link v-if="authStore.isStaff" to="/moderation" class="dropdown-item" @click="dropdownOpen = false">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.052-.13-2.075-.382-3.016z"/>
                  </svg>
                  {{ t('nav.moderation') }}
                </router-link>

                <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item" @click="dropdownOpen = false">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  {{ t('nav.admin') }}
                </router-link>

                <div class="dropdown-divider"></div>

                <button class="dropdown-item danger" @click="handleLogout">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {{ t('nav.logout') }}
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <!-- Guest: login/register links -->
        <template v-else>
          <router-link to="/login" class="nav-link">{{ t('nav.login') }}</router-link>
          <router-link to="/register" class="btn-primary nav-btn">{{ t('nav.register') }}</router-link>
        </template>

        <!-- Mobile burger -->
        <button class="burger-btn" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          {{ mobileOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/tree" @click="mobileOpen = false">{{ t('nav.tree') }}</router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/person/new" @click="mobileOpen = false">{{ t('nav.addPerson') }}</router-link>
          <router-link to="/settings" @click="mobileOpen = false">{{ t('nav.settings') }}</router-link>
          <router-link v-if="authStore.isStaff" to="/moderation" @click="mobileOpen = false">{{ t('nav.moderation') }}</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin" @click="mobileOpen = false">{{ t('nav.admin') }}</router-link>
          <div class="mobile-divider"></div>
          <span class="mobile-email">{{ authStore.user?.email }}</span>
          <button class="mobile-logout" @click="handleLogout">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <router-link to="/login" @click="mobileOpen = false">{{ t('nav.login') }}</router-link>
          <router-link to="/register" @click="mobileOpen = false">{{ t('nav.register') }}</router-link>
        </template>
        <div class="lang-switch mobile-lang">
          <select v-model="localeValue" class="lang-select">
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="kk">KK</option>
          </select>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'

const authStore = useAuthStore()
const route  = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { dark, toggle: toggleTheme } = useTheme()

const dropdownOpen = ref(false)
const mobileOpen   = ref(false)
const menuRef      = ref(null)

const localeValue = computed({
  get: () => locale.value,
  set: (v) => setLocale(v),
})

const avatarLetter = computed(() => {
  const u = authStore.user
  if (u?.first_name) return u.first_name.charAt(0).toUpperCase()
  if (u?.email)      return u.email.charAt(0).toUpperCase()
  return '?'
})

const roleLabel = computed(() => {
  const role = authStore.user?.role
  if (!role) return ''
  const map = { admin: 'Admin', staff: 'Staff', user: 'User' }
  return map[role] || role
})

// Close menu on route change
watch(() => route.path, () => {
  dropdownOpen.value = false
  mobileOpen.value   = false
})

// Close dropdown on outside click
function handleOutsideClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(()  => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

function handleLogout() {
  dropdownOpen.value = false
  mobileOpen.value   = false
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
/* ── Base ────────────────────────────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 253, 245, 0.88);
  border-bottom: 1px solid var(--c-border, rgba(231, 219, 200, 0.65));
  backdrop-filter: blur(12px);
  transition: background 0.3s ease;
}

[data-theme="dark"] .navbar {
  background: rgba(28, 25, 23, 0.92);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 64px;
  padding: 0 20px;
}

/* ── Brand ───────────────────────────────────────────────────────────────── */
.navbar-brand {
  font-size: 20px;
  font-weight: 800;
  font-family: var(--font-serif, Georgia, serif);
  letter-spacing: -0.02em;
  color: var(--c-text, #1c1917);
  white-space: nowrap;
  flex-shrink: 0;
}
.navbar-brand:hover { text-decoration: none; color: var(--c-primary); }

/* ── Center links ────────────────────────────────────────────────────────── */
.navbar-center {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.navbar-center a {
  color: var(--c-muted, #78716c);
  font-size: 14px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
}

.navbar-center a:hover { background: rgba(217,119,6,0.10); color: var(--c-primary); text-decoration: none; }
.navbar-center a.router-link-active { color: var(--c-primary-dark, #b45309); background: rgba(217,119,6,0.12); }

/* ── Right section ───────────────────────────────────────────────────────── */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-link {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  padding: 7px 12px;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
}
.nav-link:hover { background: #eef2ff; color: #3730a3; text-decoration: none; }

.nav-btn {
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 8px;
  text-decoration: none;
}

/* ── Dark mode toggle ────────────────────────────────────────────────────── */
.theme-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--c-secondary-bg, #f5f0e8);
  border: 1px solid var(--c-secondary-border, #e7ddd0);
  color: var(--c-muted, #78716c);
  padding: 0;
  box-shadow: none;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}
.theme-btn:hover {
  background: rgba(217,119,6,0.14);
  color: var(--c-primary);
  transform: rotate(20deg) translateY(-1px);
}

/* ── Language switcher ───────────────────────────────────────────────────── */
.lang-switch {
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.lang-select {
  font-size: 12px;
  border: none;
  background: transparent;
  color: #0f172a;
  font-weight: 700;
  padding: 0;
  width: auto;
  appearance: none;
  cursor: pointer;
}
.lang-select:focus { outline: none; }

/* ── Avatar button ───────────────────────────────────────────────────────── */
.user-menu { position: relative; }

.avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: none;
  border-radius: 999px;
}
.avatar-btn:hover { transform: none; }

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  border: 2px solid rgba(99,102,241,0.25);
  transition: box-shadow 0.15s, border-color 0.15s;
  user-select: none;
}

.avatar-btn:hover .avatar-circle {
  box-shadow: 0 0 0 4px var(--c-primary-glow, rgba(217,119,6,0.22));
  border-color: var(--c-primary);
}

.avatar-lg {
  width: 40px;
  height: 40px;
  font-size: 16px;
  flex-shrink: 0;
}

/* ── Dropdown ────────────────────────────────────────────────────────────── */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  background: var(--c-surface, rgba(255,253,245,0.97));
  border: 1px solid var(--c-border, rgba(231,219,200,0.9));
  border-radius: 14px;
  box-shadow: 0 16px 40px var(--c-shadow, rgba(28,25,23,0.18));
  backdrop-filter: blur(8px);
  padding: 8px;
  z-index: 100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px 12px;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dropdown-email {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-role {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-divider {
  height: 1px;
  background: rgba(226,232,240,0.8);
  margin: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, color 0.12s;
  box-shadow: none;
}

.dropdown-item:hover {
  background: rgba(217,119,6,0.10);
  color: var(--c-primary-dark, #b45309);
  transform: none;
}

.dropdown-item.danger { color: #dc2626; }
.dropdown-item.danger:hover { background: #fef2f2; color: #b91c1c; }

/* ── Dropdown transition ─────────────────────────────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* ── Burger button ───────────────────────────────────────────────────────── */
.burger-btn {
  display: none;
  background: none;
  border: 1px solid rgba(148,163,184,0.4);
  border-radius: 8px;
  font-size: 18px;
  line-height: 1;
  padding: 6px 10px;
  cursor: pointer;
  color: #1e1b4b;
  box-shadow: none;
}
.burger-btn:hover { transform: none; background: #f1f5f9; }

/* ── Mobile menu ─────────────────────────────────────────────────────────── */
.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(226,232,240,0.7);
  gap: 4px;
}

.mobile-menu a {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: background 0.12s;
}
.mobile-menu a:hover { background: #eef2ff; color: #3730a3; }
.mobile-menu a.router-link-active { background: rgba(99,102,241,0.1); color: #3730a3; }

.mobile-divider {
  height: 1px;
  background: rgba(226,232,240,0.7);
  margin: 4px 0;
}

.mobile-email {
  font-size: 12px;
  color: #64748b;
  padding: 4px 12px;
  overflow-wrap: anywhere;
}

.mobile-logout {
  background: none;
  border: none;
  box-shadow: none;
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  width: 100%;
}
.mobile-logout:hover { background: #fef2f2; transform: none; }

.mobile-lang {
  margin-top: 8px;
  align-self: flex-start;
}

/* ── Mobile transition ───────────────────────────────────────────────────── */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .navbar-center { display: none; }
  .burger-btn    { display: block; }
  .nav-link, .nav-btn { display: none; }
  .lang-switch   { display: none; }
}
</style>
