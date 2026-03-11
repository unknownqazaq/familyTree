<template>
  <div class="settings-page">
    <h2>{{ t('settings.title') }}</h2>

    <div class="card">
      <form @submit.prevent="handleUpdate">
        <div class="form-row">
          <div class="form-group">
            <label for="settings-first-name">{{ t('settings.firstName') }}</label>
            <input id="settings-first-name" name="first_name" v-model="form.first_name" type="text" />
          </div>
          <div class="form-group">
            <label for="settings-last-name">{{ t('settings.lastName') }}</label>
            <input id="settings-last-name" name="last_name" v-model="form.last_name" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="settings-father-name">{{ t('settings.fatherName') }}</label>
            <input id="settings-father-name" name="father_name" v-model="form.father_name" type="text" />
          </div>
          <div class="form-group">
            <label for="settings-grandfather-name">{{ t('settings.grandfatherName') }}</label>
            <input id="settings-grandfather-name" name="grandfather_name" v-model="form.grandfather_name" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="settings-birth-date">{{ t('settings.birthDate') }}</label>
            <input id="settings-birth-date" name="birth_date" v-model="form.birth_date" type="date" />
          </div>
          <div class="form-group">
            <label for="settings-birth-place">{{ t('settings.birthPlace') }}</label>
            <input id="settings-birth-place" name="birth_place" v-model="form.birth_place" type="text" />
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('common.saving') : t('settings.saveChanges') }}
        </button>
      </form>
    </div>

    <div class="card danger-zone" style="margin-top: 32px">
      <h3>{{ t('settings.deleteTitle') }}</h3>
      <p>{{ t('settings.deleteText') }}</p>
      <button class="btn-danger" @click="handleDelete">{{ t('settings.deleteButton') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

watch(
  () => authStore.user,
  (user) => {
    if (user) {
      form.first_name = user.first_name || ''
      form.last_name = user.last_name || ''
      form.father_name = user.father_name || ''
      form.grandfather_name = user.grandfather_name || ''
      form.birth_date = user.birth_date || ''
      form.birth_place = user.birth_place || ''
    }
  },
  { immediate: true }
)

async function handleUpdate() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await authStore.updateProfile({ ...form })
    success.value = t('settings.updateSuccess')
  } catch (e) {
    error.value = e.response?.data?.error || t('settings.updateFailed')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm(t('settings.deleteConfirm'))) return

  try {
    await authStore.deleteAccount()
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || t('settings.deleteFailed')
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
