<template>
  <div class="edit-person">
    <h2>{{ isEdit ? t('person.editTitle') : t('person.addTitle') }}</h2>

    <PersonForm
      :initial-data="personData"
      :is-edit="isEdit"
      :loading="loading"
      :error="error"
      @submit="handleSubmit"
      @cancel="router.back()"
    />

    <div v-if="isEdit" class="danger-zone card" style="margin-top: 32px">
      <h3>{{ t('person.dangerTitle') }}</h3>
      <p>{{ t('person.dangerText') }}</p>
      <button class="btn-danger" @click="handleDelete">{{ t('person.deletePerson') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTreeStore } from '../stores/tree'
import PersonForm from '../components/PersonForm.vue'

const route = useRoute()
const router = useRouter()
const treeStore = useTreeStore()

const isEdit = computed(() => !!route.params.id)
const personData = ref(null)
const loading = ref(false)
const error = ref(null)
const { t } = useI18n()

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
    error.value = e.response?.data?.error || t('person.saveFailed')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm(t('person.deleteConfirm'))) return

  try {
    await treeStore.deletePerson(parseInt(route.params.id))
    router.push('/tree')
  } catch (e) {
    error.value = e.response?.data?.error || t('person.deleteFailed')
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
