<template>
  <div class="admin-panel">
    <h2>{{ t('admin.title') }}</h2>

    <!-- Recent Additions -->
    <div class="admin-section card">
      <h3>🔔 {{ t('admin.recentTitle') }}</h3>
      <p v-if="recentError" class="error-msg">{{ recentError }}</p>
      <ul v-else-if="recentPersons.length > 0" class="recent-list">
        <li v-for="person in recentPersons" :key="person.id" class="recent-item">
          <span class="recent-name">{{ person.name }} <span class="recent-id">#{{ person.id }}</span></span>
          <span class="recent-date">{{ t('admin.recentAdded') }}: {{ formatDate(person.created_at) }}</span>
        </li>
      </ul>
      <p v-else class="empty-text">{{ t('admin.recentEmpty') }}</p>
    </div>

    <div class="admin-section card">
      <h3>{{ t('admin.backupsTitle') }}</h3>

      <div class="backup-actions">
        <button class="btn-primary" @click="createBackup" :disabled="backupLoading">
          {{ backupLoading ? t('admin.creating') : t('admin.createBackup') }}
        </button>
      </div>

      <p v-if="backupMessage" class="success-msg">{{ backupMessage }}</p>
      <p v-if="backupError" class="error-msg">{{ backupError }}</p>

      <div v-if="backups.length > 0" class="backup-list">
        <table>
          <thead>
            <tr>
              <th>{{ t('admin.table.name') }}</th>
              <th>{{ t('admin.table.size') }}</th>
              <th>{{ t('admin.table.created') }}</th>
              <th>{{ t('admin.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in backups" :key="backup.name">
              <td>{{ backup.name }}</td>
              <td>{{ formatSize(backup.size) }}</td>
              <td>{{ backup.created_at }}</td>
              <td>
                <button class="btn-danger" @click="restoreBackup(backup.name)">
                  {{ t('admin.restore') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="empty-text">{{ t('admin.empty') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'

const backups = ref([])
const backupLoading = ref(false)
const backupMessage = ref('')
const backupError = ref('')

const recentPersons = ref([])
const recentError = ref('')

const { t, locale } = useI18n()

onMounted(async () => {
  await Promise.all([fetchBackups(), fetchRecentPersons()])
})

async function fetchRecentPersons() {
  try {
    const { data } = await api.get('/admin/recent-persons?limit=5')
    recentPersons.value = data || []
  } catch {
    recentError.value = t('admin.recentLoadFailed')
  }
}

async function fetchBackups() {
  try {
    const { data } = await api.get('/admin/backups')
    backups.value = data || []
  } catch (e) {
    backupError.value = t('admin.loadFailed')
  }
}

async function createBackup() {
  backupLoading.value = true
  backupMessage.value = ''
  backupError.value = ''

  try {
    const { data } = await api.post('/admin/backup')
    backupMessage.value = t('admin.backupCreated', { name: data.name })
    await fetchBackups()
  } catch (e) {
    backupError.value = e.response?.data?.error || t('admin.createFailed')
  } finally {
    backupLoading.value = false
  }
}

async function restoreBackup(name) {
  if (!confirm(t('admin.restoreConfirm', { name }))) return

  try {
    await api.post(`/admin/restore/${name}`)
    backupMessage.value = t('admin.restoreSuccess')
  } catch (e) {
    backupError.value = e.response?.data?.error || t('admin.restoreFailed')
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(locale.value)
}
</script>

<style scoped>
.admin-panel {
  max-width: 800px;
  margin: 0 auto;
}

.admin-panel h2 {
  margin-bottom: 24px;
}

.admin-section {
  margin-bottom: 24px;
}

.admin-section h3 {
  margin-bottom: 16px;
}

.backup-actions {
  margin-bottom: 16px;
}

.backup-list table {
  width: 100%;
  border-collapse: collapse;
}

.backup-list th,
.backup-list td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--c-border);
  font-size: 14px;
}

.backup-list th {
  font-weight: 600;
  color: var(--c-text-2);
}

.empty-text {
  color: var(--c-text-3);
  font-size: 14px;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--c-border);
  font-size: 14px;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-name {
  font-weight: 500;
}

.recent-id {
  color: var(--c-text-3);
  font-weight: 400;
  margin-left: 4px;
}

.recent-date {
  color: var(--c-text-2);
  font-size: 13px;
}
</style>
