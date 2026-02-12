<template>
  <div class="moderation-page">
    <h2>Moderation Queue</h2>

    <div v-if="loading" class="loading">Loading pending entries...</div>

    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="persons.length > 0" class="pending-list">
      <div v-for="person in persons" :key="person.id" class="card pending-item">
        <div class="pending-header">
          <h3>{{ person.name }}</h3>
          <span class="badge-private">private</span>
        </div>

        <div v-if="person.designation" class="field">
          <strong>Designation:</strong> {{ person.designation }}
        </div>
        <div v-if="person.reference" class="field">
          <strong>Reference:</strong> {{ person.reference }}
        </div>
        <div v-if="person.history" class="field">
          <strong>History:</strong> {{ person.history }}
        </div>

        <div class="pending-actions">
          <button class="btn-success" @click="publish(person.id)">Publish</button>
          <router-link :to="`/person/${person.id}/edit`" class="btn-primary action-link">Edit</router-link>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="card empty-state">
      <p>No pending entries to moderate.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const persons = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  await fetchPending()
})

async function fetchPending() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/admin/pending')
    persons.value = data || []
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to load pending entries'
  } finally {
    loading.value = false
  }
}

async function publish(id) {
  try {
    await api.put(`/admin/publish/${id}`)
    persons.value = persons.value.filter((p) => p.id !== id)
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to publish'
  }
}
</script>

<style scoped>
.moderation-page {
  max-width: 800px;
  margin: 0 auto;
}

.moderation-page h2 {
  margin-bottom: 24px;
}

.pending-item {
  margin-bottom: 12px;
}

.pending-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.pending-header h3 {
  margin: 0;
}

.badge-private {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #fff3cd;
  color: #856404;
}

.field {
  font-size: 14px;
  margin-bottom: 4px;
}

.pending-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-link {
  display: inline-block;
  padding: 8px 16px;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}
</style>
