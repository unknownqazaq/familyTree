<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">{{ t('nav.brand') }}</router-link>

      <div class="navbar-links">
        <router-link to="/tree">{{ t('nav.tree') }}</router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/person/new">{{ t('nav.addPerson') }}</router-link>
          <router-link v-if="authStore.isStaff" to="/moderation">{{ t('nav.moderation') }}</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin">{{ t('nav.admin') }}</router-link>
          <router-link to="/settings">{{ t('nav.settings') }}</router-link>
          <span class="user-email">{{ authStore.user?.email }}</span>
          <button class="btn-secondary" @click="handleLogout">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <router-link to="/login">{{ t('nav.login') }}</router-link>
          <router-link to="/register">{{ t('nav.register') }}</router-link>
        </template>
        <div class="lang-switch">
          <label class="lang-label" for="language-select">{{ t('nav.language') }}</label>
          <select id="language-select" v-model="localeValue" class="lang-select">
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="kk">KK</option>
          </select>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const localeValue = computed({
  get: () => locale.value,
  set: (value) => setLocale(value),
})

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(203, 213, 225, 0.65);
  backdrop-filter: blur(12px);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 68px;
  padding: 0 20px;
}

.navbar-brand {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1e1b4b;
}

.navbar-brand:hover {
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.navbar-links a {
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  padding: 7px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar-links a:hover {
  background: #eef2ff;
  color: #3730a3;
}

.navbar-links a.router-link-active {
  color: #3730a3;
  background: rgba(99, 102, 241, 0.14);
}

.user-email {
  font-size: 13px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 5px 10px;
}

.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.lang-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.lang-select {
  font-size: 12px;
  border: none;
  background: transparent;
  color: #0f172a;
  font-weight: 700;
  padding: 0 2px;
  width: auto;
  appearance: none;
}

.lang-select:focus {
  outline: none;
}

@media (max-width: 900px) {
  .navbar-inner {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding: 12px 20px;
  }

  .navbar-links {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
