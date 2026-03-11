<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">{{ t('nav.brand') }}</router-link>

      <div class="navbar-center">
        <router-link to="/tree">{{ t('nav.tree') }}</router-link>
        <router-link v-if="authStore.isAuthenticated" to="/person/new">{{ t('nav.addPerson') }}</router-link>
      </div>

      <div class="navbar-right">
        <!-- Theme toggle -->
        <button class="icon-pill" :title="dark ? 'Light mode' : 'Dark mode'" @click="toggleTheme">
          <svg v-if="dark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
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
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Language -->
        <div class="lang-pill">
          <select v-model="localeValue" class="lang-select" aria-label="Language">
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="kk">KK</option>
          </select>
        </div>

        <!-- Authenticated -->
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

                <div class="dropdown-sep"></div>

                <router-link to="/settings" class="dropdown-item" @click="dropdownOpen = false">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  {{ t('nav.settings') }}
                </router-link>

                <router-link v-if="authStore.isStaff" to="/moderation" class="dropdown-item" @click="dropdownOpen = false">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.052-.13-2.075-.382-3.016z"/>
                  </svg>
                  {{ t('nav.moderation') }}
                </router-link>

                <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item" @click="dropdownOpen = false">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  {{ t('nav.admin') }}
                </router-link>

                <div class="dropdown-sep"></div>

                <button class="dropdown-item danger" @click="handleLogout">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

        <!-- Guest -->
        <template v-else>
          <router-link to="/login" class="nav-link">{{ t('nav.login') }}</router-link>
          <router-link to="/register" class="nav-cta">{{ t('nav.register') }}</router-link>
        </template>

        <!-- Mobile burger -->
        <button class="burger-btn" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span class="burger-icon" :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/tree" class="mobile-link" @click="mobileOpen = false">{{ t('nav.tree') }}</router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/person/new" class="mobile-link" @click="mobileOpen = false">{{ t('nav.addPerson') }}</router-link>
          <router-link to="/settings" class="mobile-link" @click="mobileOpen = false">{{ t('nav.settings') }}</router-link>
          <router-link v-if="authStore.isStaff" to="/moderation" class="mobile-link" @click="mobileOpen = false">{{ t('nav.moderation') }}</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin" class="mobile-link" @click="mobileOpen = false">{{ t('nav.admin') }}</router-link>
          <div class="mobile-sep"></div>
          <span class="mobile-email">{{ authStore.user?.email }}</span>
          <button class="mobile-logout" @click="handleLogout">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <router-link to="/login" class="mobile-link" @click="mobileOpen = false">{{ t('nav.login') }}</router-link>
          <router-link to="/register" class="mobile-link primary" @click="mobileOpen = false">{{ t('nav.register') }}</router-link>
        </template>
        <div class="lang-pill mobile-lang">
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

watch(() => route.path, () => {
  dropdownOpen.value = false
  mobileOpen.value   = false
})

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
/* ── Navbar shell ────────────────────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.72);
  border-bottom: 1px solid var(--c-border);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

[data-theme="light"] .navbar {
  background: rgba(242, 242, 247, 0.72);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 52px;
  padding: 0 20px;
}

/* ── Brand ───────────────────────────────────────────────────────────────── */
.navbar-brand {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: var(--c-text);
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.navbar-brand:hover { opacity: 0.65; }

/* ── Center links ────────────────────────────────────────────────────────── */
.navbar-center {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.navbar-center a {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-2);
  padding: 5px 12px;
  border-radius: 8px;
  letter-spacing: -0.01em;
  transition: color 0.15s, background 0.15s;
  text-decoration: none;
}
.navbar-center a:hover { color: var(--c-text); background: var(--c-fill-3); }
.navbar-center a.router-link-active { color: var(--c-primary); background: rgba(10, 132, 255, 0.10); }
[data-theme="light"] .navbar-center a.router-link-active {
  color: var(--c-primary);
  background: rgba(0, 122, 255, 0.10);
}

/* ── Right section ───────────────────────────────────────────────────────── */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ── Icon pill (theme toggle) ────────────────────────────────────────────── */
.icon-pill {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--c-fill-3);
  border: 1px solid var(--c-border);
  color: var(--c-text-2);
  padding: 0;
  box-shadow: none;
  transition: background 0.15s, color 0.15s, opacity 0.15s;
}
.icon-pill:hover { background: var(--c-fill-2); color: var(--c-text); opacity: 1; transform: none; }

/* ── Language pill ───────────────────────────────────────────────────────── */
.lang-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--c-fill-3);
  border: 1px solid var(--c-border);
}

.lang-select {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-sans);
  border: none;
  background: transparent;
  color: var(--c-text-2);
  padding: 0;
  width: auto;
  appearance: none;
  cursor: pointer;
  letter-spacing: 0.02em;
}
.lang-select:focus { outline: none; }
.lang-select option { background: var(--c-bg-2); color: var(--c-text); }

/* ── Guest nav links ─────────────────────────────────────────────────────── */
.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-2);
  padding: 6px 12px;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s;
  text-decoration: none;
}
.nav-link:hover { color: var(--c-text); background: var(--c-fill-3); opacity: 1; }

.nav-cta {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--c-primary);
  padding: 6px 14px;
  border-radius: 8px;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: opacity 0.15s;
}
.nav-cta:hover { opacity: 0.82; }

/* ── Avatar ──────────────────────────────────────────────────────────────── */
.user-menu { position: relative; }

.avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: none;
  border-radius: 999px;
}
.avatar-btn:hover { transform: none; opacity: 1; }

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--c-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  transition: box-shadow 0.15s;
  user-select: none;
}

.avatar-btn:hover .avatar-circle {
  box-shadow: 0 0 0 3px var(--c-primary-glow);
}

.avatar-lg {
  width: 38px;
  height: 38px;
  font-size: 15px;
  flex-shrink: 0;
}

/* ── Dropdown ────────────────────────────────────────────────────────────── */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 216px;
  background: var(--c-bg-2);
  border: 1px solid var(--c-sep);
  border-radius: 14px;
  box-shadow:
    0 0 0 0.5px var(--c-border),
    0 20px 48px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  padding: 8px;
  z-index: 200;
  overflow: hidden;
}

[data-theme="light"] .dropdown {
  box-shadow: 0 0 0 0.5px var(--c-border), 0 16px 40px rgba(0,0,0,0.15);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 10px;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.dropdown-email {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.dropdown-role {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-text-2);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dropdown-sep {
  height: 1px;
  background: var(--c-sep);
  margin: 4px -8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--c-text);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  box-shadow: none;
}
.dropdown-item svg { color: var(--c-text-2); flex-shrink: 0; }
.dropdown-item:hover { background: var(--c-fill-3); opacity: 1; transform: none; }
.dropdown-item.danger { color: var(--c-red); }
.dropdown-item.danger svg { color: var(--c-red); }
.dropdown-item.danger:hover { background: rgba(255, 69, 58, 0.10); }

/* ── Dropdown transition ─────────────────────────────────────────────────── */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* ── Burger ──────────────────────────────────────────────────────────────── */
.burger-btn {
  display: none;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  background: var(--c-fill-3);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 0;
  box-shadow: none;
}
.burger-btn:hover { background: var(--c-fill-2); opacity: 1; transform: none; }

.burger-icon,
.burger-icon::before,
.burger-icon::after {
  display: block;
  width: 16px;
  height: 1.5px;
  background: var(--c-text-2);
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}
.burger-icon { position: relative; }
.burger-icon::before { content: ''; position: absolute; top: -5px; left: 0; }
.burger-icon::after  { content: ''; position: absolute; top:  5px; left: 0; }

.burger-icon.open { background: transparent; }
.burger-icon.open::before { transform: rotate(45deg) translate(3.5px, 3.5px); }
.burger-icon.open::after  { transform: rotate(-45deg) translate(3.5px, -3.5px); }

/* ── Mobile menu ─────────────────────────────────────────────────────────── */
.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: 8px 12px 16px;
  border-top: 1px solid var(--c-sep);
  gap: 2px;
  background: var(--c-bg);
}

.mobile-link {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--c-text);
  text-decoration: none;
  transition: background 0.1s;
}
.mobile-link:hover { background: var(--c-fill-3); opacity: 1; }
.mobile-link.router-link-active { color: var(--c-primary); }
.mobile-link.primary { color: var(--c-primary); font-weight: 600; }

.mobile-sep {
  height: 1px;
  background: var(--c-sep);
  margin: 6px 0;
}

.mobile-email {
  font-size: 12px;
  color: var(--c-text-2);
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
  font-size: 15px;
  font-weight: 400;
  color: var(--c-red);
  cursor: pointer;
  width: 100%;
}
.mobile-logout:hover { background: rgba(255,69,58,0.1); transform: none; opacity: 1; }

.mobile-lang { margin-top: 10px; align-self: flex-start; }

/* ── Mobile transition ───────────────────────────────────────────────────── */
.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .navbar-center, .nav-link, .nav-cta, .lang-pill { display: none; }
  .burger-btn { display: flex; }
}
</style>
