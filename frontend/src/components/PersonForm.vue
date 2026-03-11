<template>
  <!-- ── Edit mode: flat form ─────────────────────────────────────────────── -->
  <form v-if="isEdit" class="person-form" @submit.prevent="onSubmit">
    <div class="form-group">
      <label for="person-name">{{ t('person.nameLabel') }}</label>
      <input id="person-name" v-model="form.name" type="text" required :placeholder="t('person.namePlaceholder')" />
    </div>

    <div class="form-group">
      <label>{{ t('person.parentLabel') }}</label>
      <SearchBar :placeholder="t('search.parentPlaceholder')" @select="onParentSelect" />
      <div v-if="selectedParent" class="selected-parent">
        {{ t('person.selected') }} {{ selectedParent.name }}
        <button type="button" class="btn-remove" @click="clearParent">&times;</button>
      </div>
    </div>

    <div class="form-group">
      <label for="person-designation">{{ t('person.designationLabel') }}</label>
      <input id="person-designation" v-model="form.designation" type="text" :placeholder="t('person.designationPlaceholder')" />
    </div>

    <div class="form-group">
      <label for="person-reference">{{ t('person.referenceLabel') }}</label>
      <textarea id="person-reference" v-model="form.reference" rows="2" :placeholder="t('person.referencePlaceholder')"></textarea>
    </div>

    <div class="form-group">
      <label for="person-history">{{ t('person.historyLabel') }}</label>
      <textarea id="person-history" v-model="form.history" rows="4" :placeholder="t('person.historyPlaceholder')"></textarea>
    </div>

    <div class="form-group">
      <label for="person-access">{{ t('person.accessLabel') }}</label>
      <select id="person-access" v-model="form.access">
        <option value="private">{{ t('common.private') }}</option>
        <option value="public">{{ t('common.public') }}</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? t('common.saving') : t('common.update') }}
      </button>
      <button type="button" class="btn-secondary" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </form>

  <!-- ── Add mode: stepper wizard ─────────────────────────────────────────── -->
  <div v-else class="stepper-wrapper">

    <!-- Progress header -->
    <div class="stepper-header" role="list">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="step-item"
        :class="{ 'is-active': currentStep === i, 'is-done': currentStep > i }"
        role="listitem"
      >
        <div class="step-bubble">
          <svg v-if="currentStep > i" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
        <div v-if="i < steps.length - 1" class="step-connector" :class="{ 'is-done': currentStep > i }"></div>
      </div>
    </div>

    <!-- Step body -->
    <div class="step-body">

      <!-- Step 1: Name -->
      <template v-if="currentStep === 0">
        <div class="step-intro">
          <div class="step-icon">👤</div>
          <h3>{{ steps[0].label }}</h3>
          <p>{{ steps[0].hint }}</p>
        </div>
        <div class="form-group" :class="{ 'has-error': nameError }">
          <label for="s-name">{{ t('person.nameLabel') }}</label>
          <input
            id="s-name"
            v-model="form.name"
            type="text"
            :placeholder="t('person.namePlaceholder')"
            @input="nameError = ''"
            @blur="validateName"
            autofocus
          />
          <span v-if="nameError" class="field-error">{{ nameError }}</span>
        </div>
      </template>

      <!-- Step 2: Relations -->
      <template v-else-if="currentStep === 1">
        <div class="step-intro">
          <div class="step-icon">🔗</div>
          <h3>{{ steps[1].label }}</h3>
          <p>{{ steps[1].hint }}</p>
        </div>
        <div class="form-group">
          <label>{{ t('person.parentLabel') }}</label>
          <SearchBar :placeholder="t('search.parentPlaceholder')" @select="onParentSelect" />
          <div v-if="selectedParent" class="selected-parent">
            <span class="parent-avatar">{{ selectedParent.name.charAt(0).toUpperCase() }}</span>
            <span class="parent-name">{{ selectedParent.name }}</span>
            <button type="button" class="btn-remove" @click="clearParent">&times;</button>
          </div>
          <p v-else class="field-hint">{{ steps[1].skipHint }}</p>
        </div>
      </template>

      <!-- Step 3: Description -->
      <template v-else-if="currentStep === 2">
        <div class="step-intro">
          <div class="step-icon">📝</div>
          <h3>{{ steps[2].label }}</h3>
          <p>{{ steps[2].hint }}</p>
        </div>
        <div class="form-group">
          <label for="s-designation">{{ t('person.designationLabel') }}</label>
          <input id="s-designation" v-model="form.designation" type="text" :placeholder="t('person.designationPlaceholder')" />
        </div>
        <div class="form-group">
          <label for="s-reference">{{ t('person.referenceLabel') }}</label>
          <textarea id="s-reference" v-model="form.reference" rows="2" :placeholder="t('person.referencePlaceholder')"></textarea>
        </div>
        <div class="form-group">
          <label for="s-history">{{ t('person.historyLabel') }}</label>
          <textarea id="s-history" v-model="form.history" rows="3" :placeholder="t('person.historyPlaceholder')"></textarea>
        </div>
        <div class="form-group">
          <label for="s-access">{{ t('person.accessLabel') }}</label>
          <select id="s-access" v-model="form.access">
            <option value="private">{{ t('common.private') }}</option>
            <option value="public">{{ t('common.public') }}</option>
          </select>
        </div>
      </template>

      <!-- Step 4: Review -->
      <template v-else>
        <div class="step-intro">
          <div class="step-icon">✅</div>
          <h3>{{ steps[3].label }}</h3>
          <p>{{ steps[3].hint }}</p>
        </div>
        <div class="review-card">
          <div class="review-row">
            <span class="review-label">{{ t('person.nameLabel').replace(' *', '') }}</span>
            <strong class="review-value">{{ form.name }}</strong>
          </div>
          <div class="review-row">
            <span class="review-label">{{ t('person.parentLabel') }}</span>
            <strong class="review-value">{{ selectedParent?.name || '—' }}</strong>
          </div>
          <div v-if="form.designation" class="review-row">
            <span class="review-label">{{ t('person.designationLabel') }}</span>
            <strong class="review-value">{{ form.designation }}</strong>
          </div>
          <div v-if="form.reference" class="review-row">
            <span class="review-label">{{ t('person.referenceLabel') }}</span>
            <strong class="review-value review-long">{{ form.reference }}</strong>
          </div>
          <div v-if="form.history" class="review-row">
            <span class="review-label">{{ t('person.historyLabel') }}</span>
            <strong class="review-value review-long">{{ form.history }}</strong>
          </div>
          <div class="review-row">
            <span class="review-label">{{ t('person.accessLabel') }}</span>
            <span class="access-pill" :class="form.access === 'public' ? 'is-public' : 'is-private'">
              {{ form.access === 'public' ? t('common.public') : t('common.private') }}
            </span>
          </div>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </template>

    </div>

    <!-- Navigation -->
    <div class="step-nav">
      <button v-if="currentStep > 0" type="button" class="btn-secondary" @click="currentStep--">
        ← {{ navLabels.back }}
      </button>
      <button type="button" class="btn-secondary cancel-btn" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </button>
      <div style="flex: 1"></div>
      <button v-if="currentStep < steps.length - 1" type="button" class="btn-primary" @click="nextStep">
        {{ navLabels.next }} →
      </button>
      <button v-else type="button" class="btn-primary" :disabled="loading" @click="onSubmit">
        {{ loading ? t('common.saving') : t('common.create') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchBar from './SearchBar.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isEdit:      { type: Boolean, default: false },
  loading:     { type: Boolean, default: false },
  error:       { type: String, default: null },
})

const emit = defineEmits(['submit', 'cancel'])
const { t, locale } = useI18n()

const form = reactive({
  name: '',
  parent_id: null,
  designation: '',
  reference: '',
  history: '',
  access: 'public',
})

const selectedParent = ref(null)
const currentStep   = ref(0)
const nameError     = ref('')

// ── Stepper labels (reactive to locale changes) ────────────────────────────
const steps = computed(() => {
  const isRu = locale.value === 'ru'
  const isKk = locale.value === 'kk'
  return [
    {
      label:    isRu ? 'Имя' : isKk ? 'Есім' : 'Name',
      hint:     isRu ? 'Введите полное имя человека.' : isKk ? 'Адамның толық атын енгізіңіз.' : 'Enter the full name of the person.',
    },
    {
      label:    isRu ? 'Связи' : isKk ? 'Байланыс' : 'Relations',
      hint:     isRu ? 'Выберите родителя или оставьте пустым для корневого узла.' : isKk ? 'Ата-ананы таңдаңыз немесе бос қалдырыңыз.' : 'Choose a parent or leave blank for a root node.',
      skipHint: isRu ? 'Родитель не выбран — человек будет корневым.' : isKk ? 'Ата-ана таңдалмады — бастапқы түйін болады.' : 'No parent selected — will be a root node.',
    },
    {
      label:    isRu ? 'Описание' : isKk ? 'Сипаттама' : 'Description',
      hint:     isRu ? 'Необязательно. Добавьте титул, источник или историю.' : isKk ? 'Міндетті емес. Лауазым, сілтеме немесе тарих қосыңыз.' : 'Optional. Add designation, reference or history.',
    },
    {
      label:    isRu ? 'Проверка' : isKk ? 'Тексеру' : 'Review',
      hint:     isRu ? 'Проверьте данные перед сохранением.' : isKk ? 'Сақтамас бұрын деректерді тексеріңіз.' : 'Review the data before saving.',
    },
  ]
})

const navLabels = computed(() => {
  const isRu = locale.value === 'ru'
  const isKk = locale.value === 'kk'
  return {
    back: isRu ? 'Назад' : isKk ? 'Артқа' : 'Back',
    next: isRu ? 'Далее' : isKk ? 'Келесі' : 'Next',
  }
})

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.name        = data.name        || ''
      form.parent_id   = data.parent_id   || null
      form.designation = data.designation || ''
      form.reference   = data.reference   || ''
      form.history     = data.history     || ''
      form.access      = data.access      || 'public'
    }
  },
  { immediate: true }
)

function validateName() {
  const isRu = locale.value === 'ru'
  const isKk = locale.value === 'kk'
  if (!form.name.trim()) {
    nameError.value = isRu ? 'Имя обязательно' : isKk ? 'Есім міндетті' : 'Name is required'
    return false
  }
  nameError.value = ''
  return true
}

function nextStep() {
  if (currentStep.value === 0 && !validateName()) return
  currentStep.value++
}

function onParentSelect(person) {
  selectedParent.value = person
  form.parent_id = person.id
}

function clearParent() {
  selectedParent.value = null
  form.parent_id = null
}

function onSubmit() {
  if (!form.name.trim()) {
    currentStep.value = 0
    validateName()
    return
  }
  emit('submit', { ...form })
}
</script>

<style scoped>
/* ── Shared form ─────────────────────────────────────────────────────────── */
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
  padding: 8px 12px;
  background: #eef2ff;
  border: 1px solid rgba(99, 102, 241, 0.22);
  border-radius: 10px;
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
  line-height: 1;
  box-shadow: none;
}

.btn-remove:hover { transform: none; }

.field-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
}

.form-group.has-error input,
.form-group.has-error textarea,
.form-group.has-error select {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14);
}

/* ── Stepper wrapper ─────────────────────────────────────────────────────── */
.stepper-wrapper {
  max-width: 580px;
}

/* ── Stepper header ──────────────────────────────────────────────────────── */
.stepper-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-bubble {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  background: #f8fafc;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  z-index: 1;
}

.step-item.is-active .step-bubble {
  border-color: #6366f1;
  background: #6366f1;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
}

.step-item.is-done .step-bubble {
  border-color: #10b981;
  background: #10b981;
  color: #fff;
}

.step-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 6px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.step-item.is-active .step-label { color: #4f46e5; }
.step-item.is-done  .step-label  { color: #059669; }

.step-connector {
  position: absolute;
  top: 15px;
  left: calc(50% + 16px);
  right: calc(-50% + 16px);
  height: 2px;
  background: #e2e8f0;
  transition: background 0.3s;
  z-index: 0;
}

.step-connector.is-done { background: #10b981; }

/* ── Step body ───────────────────────────────────────────────────────────── */
.step-body {
  min-height: 280px;
  margin-bottom: 24px;
}

.step-intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 24px;
}

.step-icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 4px;
}

.step-intro h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.step-intro p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.field-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.parent-avatar {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.parent-name { font-weight: 600; font-size: 14px; }

/* ── Review card ─────────────────────────────────────────────────────────── */
.review-card {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.review-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 100px;
  padding-top: 1px;
}

.review-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.review-long {
  font-weight: 400;
  color: #475569;
  line-height: 1.5;
}

.access-pill {
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 3px 10px;
}

.access-pill.is-public  { background: #dcfce7; color: #166534; }
.access-pill.is-private { background: #fef9c3; color: #854d0e; }

/* ── Step navigation ─────────────────────────────────────────────────────── */
.step-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.cancel-btn {
  font-size: 13px;
  padding: 8px 12px;
}

@media (max-width: 480px) {
  .step-label { display: none; }
  .step-connector { top: 15px; }
  .cancel-btn { display: none; }
}
</style>
