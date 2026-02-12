<template>
  <div class="admin-panel">
    <h2>Admin Panel</h2>

    <div class="admin-section card">
      <h3>Database Backups</h3>

      <div class="backup-actions">
        <button class="btn-primary" @click="createBackup" :disabled="backupLoading">
          {{ backupLoading ? 'Creating...' : 'Create Backup' }}
        </button>
      </div>

      <p v-if="backupMessage" class="success-msg">{{ backupMessage }}</p>
      <p v-if="backupError" class="error-msg">{{ backupError }}</p>

      <div v-if="backups.length > 0" class="backup-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in backups" :key="backup.name">
              <td>{{ backup.name }}</td>
              <td>{{ formatSize(backup.size) }}</td>
              <td>{{ backup.created_at }}</td>
              <td>
                <button class="btn-danger" @click="restoreBackup(backup.name)">Restore</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="empty-text">No backups yet</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const backups = ref([])
const backupLoading = ref(false)
const backupMessage = ref('')
const backupError = ref('')

onMounted(async () => {
  await fetchBackups()
})

async function fetchBackups() {
  try {
    const { data } = await api.get('/admin/backups')
    backups.value = data || []
  } catch (e) {
    backupError.value = 'Failed to load backups'
  }
}

async function createBackup() {
  backupLoading.value = true
  backupMessage.value = ''
  backupError.value = ''

  try {
    const { data } = await api.post('/admin/backup')
    backupMessage.value = `Backup created: ${data.name}`
    await fetchBackups()
  } catch (e) {
    backupError.value = e.response?.data?.error || 'Failed to create backup'
  } finally {
    backupLoading.value = false
  }
}

async function restoreBackup(name) {
  if (!confirm(`Restore database from ${name}? This will overwrite current data.`)) return

  try {
    await api.post(`/admin/restore/${name}`)
    backupMessage.value = 'Database restored successfully'
  } catch (e) {
    backupError.value = e.response?.data?.error || 'Failed to restore backup'
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.backup-list th {
  font-weight: 600;
  color: #666;
}

.empty-text {
  color: #888;
  font-size: 14px;
}
</style>
