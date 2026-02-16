<template>
  <div class="auth-page">
    <div class="card auth-card">
      <h2>{{ t('auth.registerTitle') }}</h2>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>{{ t('auth.firstNameLabel') }}</label>
          <input v-model="firstName" type="text" :placeholder="t('auth.firstNamePlaceholder')" />
        </div>

        <div class="form-group">
          <label>{{ t('auth.lastNameLabel') }}</label>
          <input v-model="lastName" type="text" :placeholder="t('auth.lastNamePlaceholder')" />
        </div>

        <div class="form-group">
          <label>{{ t('auth.emailLabel') }} *</label>
          <input v-model="email" type="email" required :placeholder="t('auth.emailPlaceholder')" />
        </div>

        <div class="form-group">
          <label>{{ t('auth.passwordLabel') }} *</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            :placeholder="t('auth.passwordMinPlaceholder')"
          />
        </div>

        <div class="form-group">
          <label>{{ t('auth.confirmPasswordLabel') }} *</label>
          <input v-model="confirmPassword" type="password" required :placeholder="t('auth.confirmPasswordPlaceholder')" />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>

        <button type="submit" class="btn-primary" :disabled="loading" style="width: 100%">
          {{ loading ? t('auth.registering') : t('auth.register') }}
        </button>
      </form>

      <p class="auth-link">
        {{ t('auth.haveAccount') }} <router-link to="/login">{{ t('auth.login') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const { t } = useI18n()

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.passwordsNoMatch')
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await authStore.register(email.value, password.value, firstName.value, lastName.value)
    success.value = t('auth.registrationSuccess')
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e.response?.data?.error || t('auth.registrationFailed')
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
