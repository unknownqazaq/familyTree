<template>
  <form class="person-form" @submit.prevent="onSubmit">
    <div class="form-group">
      <label>Name *</label>
      <input v-model="form.name" type="text" required placeholder="Person's name" />
    </div>

    <div class="form-group">
      <label>Parent</label>
      <SearchBar placeholder="Search for parent..." @select="onParentSelect" />
      <div v-if="selectedParent" class="selected-parent">
        Selected: {{ selectedParent.name }}
        <button type="button" class="btn-remove" @click="clearParent">&times;</button>
      </div>
    </div>

    <div class="form-group">
      <label>Designation</label>
      <input v-model="form.designation" type="text" placeholder="e.g. King, Scholar" />
    </div>

    <div class="form-group">
      <label>Reference</label>
      <textarea v-model="form.reference" rows="2" placeholder="Reference information"></textarea>
    </div>

    <div class="form-group">
      <label>History</label>
      <textarea v-model="form.history" rows="4" placeholder="Historical information"></textarea>
    </div>

    <div class="form-group">
      <label>Access</label>
      <select v-model="form.access">
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
      </button>
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Cancel</button>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import SearchBar from './SearchBar.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  name: '',
  parent_id: null,
  designation: '',
  reference: '',
  history: '',
  access: 'private',
})

const selectedParent = ref(null)

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.name = data.name || ''
      form.parent_id = data.parent_id || null
      form.designation = data.designation || ''
      form.reference = data.reference || ''
      form.history = data.history || ''
      form.access = data.access || 'private'
    }
  },
  { immediate: true }
)

function onParentSelect(person) {
  selectedParent.value = person
  form.parent_id = person.id
}

function clearParent() {
  selectedParent.value = null
  form.parent_id = null
}

function onSubmit() {
  emit('submit', { ...form })
}
</script>

<style scoped>
.person-form {
  max-width: 600px;
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

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

.selected-parent {
  margin-top: 8px;
  padding: 6px 10px;
  background: #e8f4fd;
  border-radius: 4px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-remove {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 18px;
  padding: 0 4px;
  cursor: pointer;
}
</style>
