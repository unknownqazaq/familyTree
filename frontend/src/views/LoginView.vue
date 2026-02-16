<template>
  <div class="auth-page">
    <div class="card auth-card">
      <h2>{{ t('auth.loginTitle') }}</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>{{ t('auth.emailLabel') }}</label>
          <input v-model="email" type="email" required :placeholder="t('auth.emailPlaceholder')" />
        </div>

        <div class="form-group">
          <label>{{ t('auth.passwordLabel') }}</label>
          <input v-model="password" type="password" required :placeholder="t('auth.passwordPlaceholder')" />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading" style="width: 100%">
          {{ loading ? t('auth.loggingIn') : t('auth.login') }}
        </button>
      </form>

      <p class="auth-link">
        {{ t('auth.noAccount') }} <router-link to="/register">{{ t('auth.register') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const { t } = useI18n()

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.error || t('auth.loginFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 14px;
}

.auth-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}
</style>
