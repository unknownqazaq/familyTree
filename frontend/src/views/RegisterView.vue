<template>
  <div class="auth-page">
    <div class="card auth-card">
      <h2>Register</h2>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>First Name</label>
          <input v-model="firstName" type="text" placeholder="First name" />
        </div>

        <div class="form-group">
          <label>Last Name</label>
          <input v-model="lastName" type="text" placeholder="Last name" />
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input v-model="email" type="email" required placeholder="your@email.com" />
        </div>

        <div class="form-group">
          <label>Password *</label>
          <input v-model="password" type="password" required minlength="6" placeholder="Min 6 characters" />
        </div>

        <div class="form-group">
          <label>Confirm Password *</label>
          <input v-model="confirmPassword" type="password" required placeholder="Repeat password" />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>

        <button type="submit" class="btn-primary" :disabled="loading" style="width: 100%">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <p class="auth-link">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await authStore.register(email.value, password.value, firstName.value, lastName.value)
    success.value = 'Registration successful! Redirecting to login...'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e) {
    error.value = e.response?.data?.error || 'Registration failed'
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
