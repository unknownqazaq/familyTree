<template>
  <div class="edit-person">
    <h2>{{ isEdit ? 'Edit Person' : 'Add Person' }}</h2>

    <PersonForm
      :initial-data="personData"
      :is-edit="isEdit"
      :loading="loading"
      :error="error"
      @submit="handleSubmit"
      @cancel="router.back()"
    />

    <div v-if="isEdit" class="danger-zone card" style="margin-top: 32px">
      <h3>Danger Zone</h3>
      <p>Deleting a person is permanent and cannot be undone.</p>
      <button class="btn-danger" @click="handleDelete">Delete Person</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTreeStore } from '../stores/tree'
import PersonForm from '../components/PersonForm.vue'

const route = useRoute()
const router = useRouter()
const treeStore = useTreeStore()

const isEdit = computed(() => !!route.params.id)
const personData = ref(null)
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  if (isEdit.value) {
    const person = await treeStore.fetchPerson(parseInt(route.params.id))
    if (person) {
      personData.value = person
    }
  }
})

async function handleSubmit(formData) {
  loading.value = true
  error.value = null

  try {
    if (isEdit.value) {
      await treeStore.updatePerson(parseInt(route.params.id), formData)
    } else {
      await treeStore.createPerson(formData)
    }
    router.push('/tree')
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save person'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this person?')) return

  try {
    await treeStore.deletePerson(parseInt(route.params.id))
    router.push('/tree')
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to delete person'
  }
}
</script>

<style scoped>
.edit-person {
  max-width: 600px;
  margin: 0 auto;
}

.edit-person h2 {
  margin-bottom: 24px;
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
