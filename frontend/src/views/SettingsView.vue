<template>
  <div class="settings-page">
    <h2>Profile Settings</h2>

    <div class="card">
      <form @submit.prevent="handleUpdate">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input v-model="form.first_name" type="text" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input v-model="form.last_name" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Father Name</label>
            <input v-model="form.father_name" type="text" />
          </div>
          <div class="form-group">
            <label>Grandfather Name</label>
            <input v-model="form.grandfather_name" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Birth Date</label>
            <input v-model="form.birth_date" type="date" />
          </div>
          <div class="form-group">
            <label>Birth Place</label>
            <input v-model="form.birth_place" type="text" />
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>

    <div class="card danger-zone" style="margin-top: 32px">
      <h3>Delete Account</h3>
      <p>This action is permanent and cannot be undone. All your data will be lost.</p>
      <button class="btn-danger" @click="handleDelete">Delete My Account</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  first_name: '',
  last_name: '',
  father_name: '',
  grandfather_name: '',
  birth_date: '',
  birth_place: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  if (authStore.user) {
    form.first_name = authStore.user.first_name || ''
    form.last_name = authStore.user.last_name || ''
    form.father_name = authStore.user.father_name || ''
    form.grandfather_name = authStore.user.grandfather_name || ''
    form.birth_date = authStore.user.birth_date || ''
    form.birth_place = authStore.user.birth_place || ''
  }
})

async function handleUpdate() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await authStore.updateProfile({ ...form })
    success.value = 'Profile updated successfully'
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return

  try {
    await authStore.deleteAccount()
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to delete account'
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
}

.settings-page h2 {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.danger-zone {
  border: 1px solid #e74c3c;
}

.danger-zone h3 {
  color: #e74c3c;
  margin-bottom: 8px;
}

.danger-zone p {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}
</style>
