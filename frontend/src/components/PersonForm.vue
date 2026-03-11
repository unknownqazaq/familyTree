<template>
  <form class="person-form" @submit.prevent="onSubmit">
    <div class="form-group">
      <label for="person-name">{{ t('person.nameLabel') }}</label>
      <input id="person-name" name="name" v-model="form.name" type="text" required :placeholder="t('person.namePlaceholder')" />
    </div>

    <div class="form-group">
      <label for="person-parent">{{ t('person.parentLabel') }}</label>
      <SearchBar :placeholder="t('search.parentPlaceholder')" @select="onParentSelect" />
      <div v-if="selectedParent" class="selected-parent">
        {{ t('person.selected') }} {{ selectedParent.name }}
        <button type="button" class="btn-remove" @click="clearParent">&times;</button>
      </div>
    </div>

    <div class="form-group">
      <label for="person-designation">{{ t('person.designationLabel') }}</label>
      <input id="person-designation" name="designation" v-model="form.designation" type="text" :placeholder="t('person.designationPlaceholder')" />
    </div>

    <div class="form-group">
      <label for="person-reference">{{ t('person.referenceLabel') }}</label>
      <textarea id="person-reference" name="reference" v-model="form.reference" rows="2" :placeholder="t('person.referencePlaceholder')"></textarea>
    </div>

    <div class="form-group">
      <label for="person-history">{{ t('person.historyLabel') }}</label>
      <textarea id="person-history" name="history" v-model="form.history" rows="4" :placeholder="t('person.historyPlaceholder')"></textarea>
    </div>

    <div class="form-group">
      <label for="person-access">{{ t('person.accessLabel') }}</label>
      <select id="person-access" name="access" v-model="form.access">
        <option value="private">{{ t('common.private') }}</option>
        <option value="public">{{ t('common.public') }}</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? t('common.saving') : (isEdit ? t('common.update') : t('common.create')) }}
      </button>
      <button type="button" class="btn-secondary" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchBar from './SearchBar.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()

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
