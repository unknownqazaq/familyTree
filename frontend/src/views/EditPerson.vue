<template>
  <div class="edit-person">
    <h2>{{ isEdit ? t('person.editTitle') : t('person.addTitle') }}</h2>

    <div v-if="!isEdit && canUseExcel" class="excel-tools card">
      <h3>{{ t('person.excel.title') }}</h3>
      <p>{{ t('person.excel.description') }}</p>

      <div class="excel-actions">
        <button type="button" class="btn-secondary" :disabled="excelLoading" @click="downloadTemplate">
          {{ t('person.excel.downloadTemplate') }}
        </button>
        <button type="button" class="btn-secondary" :disabled="excelLoading" @click="exportToExcel">
          {{ t('person.excel.exportAll') }}
        </button>
        <button type="button" class="btn-primary" :disabled="excelLoading" @click="openImportDialog">
          {{ excelLoading ? t('person.excel.processing') : t('person.excel.import') }}
        </button>
        <input
          ref="excelInputRef"
          class="excel-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="handleImport"
        />
      </div>

      <ul class="excel-notes">
        <li>{{ t('person.excel.noteParentKey') }}</li>
        <li>{{ t('person.excel.noteParentId') }}</li>
        <li>{{ t('person.excel.noteOrder') }}</li>
      </ul>

      <p v-if="excelSuccess" class="success-msg">{{ excelSuccess }}</p>
      <p v-if="excelError" class="error-msg">{{ excelError }}</p>
    </div>

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
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTreeStore } from '../stores/tree'
import { useAuthStore } from '../stores/auth'
import PersonForm from '../components/PersonForm.vue'

const route = useRoute()
const router = useRouter()
const treeStore = useTreeStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const canUseExcel = computed(() => Boolean(authStore.isStaff))
const personData = ref(null)
const loading = ref(false)
const error = ref(null)
const excelInputRef = ref(null)
const excelLoading = ref(false)
const excelError = ref(null)
const excelSuccess = ref(null)
const { t } = useI18n()

let xlsxPromise = null

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      const person = await treeStore.fetchPerson(parseInt(newId))
      if (person) {
        personData.value = person
      }
    } else {
      personData.value = null
    }
  },
  { immediate: true }
)

function openImportDialog() {
  if (!canUseExcel.value) {
    excelError.value = t('person.excel.forbidden')
    return
  }
  excelError.value = null
  excelSuccess.value = null
  excelInputRef.value?.click()
}

async function loadXlsx() {
  if (!xlsxPromise) {
    xlsxPromise = import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm')
  }
  return xlsxPromise
}

function normalizeText(value) {
  if (value == null) return ''
  return String(value).trim()
}

function normalizeOptional(value) {
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : null
}

function normalizeAccess(value) {
  const normalized = normalizeText(value).toLowerCase()
  if (normalized === 'public' || normalized === 'публичный') return 'public'
  return 'private'
}

function parseOptionalInt(value) {
  const normalized = normalizeText(value)
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function getCell(raw, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      return raw[key]
    }
  }
  return ''
}

function toImportRow(raw, index) {
  return {
    rowNumber: index + 2,
    rowKey: normalizeText(getCell(raw, ['row_key', 'key', 'rowKey'])),
    parentKey: normalizeText(getCell(raw, ['parent_key', 'parentKey'])),
    parentId: parseOptionalInt(getCell(raw, ['parent_id', 'parentId'])),
    parentName: normalizeText(getCell(raw, ['parent_name', 'parentName'])),
    name: normalizeText(getCell(raw, ['name', 'Name', 'имя', 'Имя'])),
    designation: normalizeOptional(getCell(raw, ['designation', 'Designation', 'титул', 'Титул'])),
    reference: normalizeOptional(getCell(raw, ['reference', 'Reference', 'источник', 'Источник'])),
    history: normalizeOptional(getCell(raw, ['history', 'History', 'история', 'История'])),
    access: normalizeAccess(getCell(raw, ['access', 'Access', 'доступ', 'Доступ'])),
  }
}

function createNameIndex(persons) {
  const index = new Map()
  persons.forEach((person) => {
    const key = normalizeText(person.name).toLowerCase()
    if (!key) return
    const ids = index.get(key) || []
    ids.push(person.id)
    index.set(key, ids)
  })
  return index
}

function resolveParent(row, keyIndex, nameIndex) {
  if (row.parentKey) {
    if (keyIndex.has(row.parentKey)) {
      return { status: 'ok', parentId: keyIndex.get(row.parentKey) }
    }
    return { status: 'wait' }
  }

  if (row.parentId != null) {
    return { status: 'ok', parentId: row.parentId }
  }

  if (row.parentName) {
    const key = row.parentName.toLowerCase()
    const matches = nameIndex.get(key) || []
    if (matches.length === 1) {
      return { status: 'ok', parentId: matches[0] }
    }
    if (matches.length > 1) {
      return { status: 'ambiguous' }
    }
    return { status: 'wait' }
  }

  return { status: 'ok', parentId: null }
}

async function handleImport(event) {
  if (!canUseExcel.value) {
    excelError.value = t('person.excel.forbidden')
    return
  }

  const file = event.target.files?.[0]
  if (!file) return

  excelError.value = null
  excelSuccess.value = null
  excelLoading.value = true

  try {
    const XLSX = await loadXlsx()
    await treeStore.fetchFullTree()

    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      throw new Error(t('person.excel.emptyFile'))
    }

    const sheet = workbook.Sheets[firstSheetName]
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    if (!rawRows.length) {
      throw new Error(t('person.excel.emptyFile'))
    }

    const pending = rawRows.map((raw, index) => toImportRow(raw, index))
    const keyIndex = new Map()
    const nameIndex = createNameIndex(treeStore.persons)
    let importedCount = 0

    while (pending.length > 0) {
      let progressed = false

      for (let i = 0; i < pending.length; i += 1) {
        const row = pending[i]

        if (!row.name) {
          throw new Error(t('person.excel.rowWithoutName', { row: row.rowNumber }))
        }

        const parent = resolveParent(row, keyIndex, nameIndex)
        if (parent.status === 'wait') {
          continue
        }
        if (parent.status === 'ambiguous') {
          throw new Error(t('person.excel.ambiguousParent', { row: row.rowNumber, parent: row.parentName }))
        }

        const payload = {
          name: row.name,
          parent_id: parent.parentId,
          designation: row.designation,
          reference: row.reference,
          history: row.history,
          access: row.access,
        }

        const created = await treeStore.createPerson(payload)
        importedCount += 1
        progressed = true

        if (row.rowKey) {
          keyIndex.set(row.rowKey, created.id)
        }

        const nameKey = row.name.toLowerCase()
        const ids = nameIndex.get(nameKey) || []
        ids.push(created.id)
        nameIndex.set(nameKey, ids)

        pending.splice(i, 1)
        i -= 1
      }

      if (!progressed) {
        const unresolvedRows = pending.map((row) => row.rowNumber).join(', ')
        throw new Error(t('person.excel.unresolvedParents', { rows: unresolvedRows }))
      }
    }

    await treeStore.fetchFullTree()
    excelSuccess.value = t('person.excel.importSuccess', { count: importedCount })
  } catch (e) {
    excelError.value = e?.response?.data?.error || e?.message || t('person.excel.importFailed')
  } finally {
    excelLoading.value = false
    if (excelInputRef.value) {
      excelInputRef.value.value = ''
    }
  }
}

async function exportToExcel() {
  if (!canUseExcel.value) {
    excelError.value = t('person.excel.forbidden')
    return
  }

  excelError.value = null
  excelSuccess.value = null
  excelLoading.value = true

  try {
    const XLSX = await loadXlsx()
    await treeStore.fetchFullTree()

    const rows = treeStore.persons.map((person) => ({
      id: person.id,
      row_key: '',
      parent_key: '',
      name: person.name,
      parent_id: person.parent_id ?? '',
      parent_name: '',
      designation: person.designation ?? '',
      reference: person.reference ?? '',
      history: person.history ?? '',
      access: person.access ?? 'private',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Persons')
    XLSX.writeFile(workbook, `family-tree-export-${new Date().toISOString().slice(0, 10)}.xlsx`)

    excelSuccess.value = t('person.excel.exportSuccess', { count: rows.length })
  } catch (e) {
    excelError.value = e?.message || t('person.excel.exportFailed')
  } finally {
    excelLoading.value = false
  }
}

async function downloadTemplate() {
  if (!canUseExcel.value) {
    excelError.value = t('person.excel.forbidden')
    return
  }

  excelError.value = null
  excelSuccess.value = null
  excelLoading.value = true

  try {
    const XLSX = await loadXlsx()
    const rows = [
      {
        row_key: 'root_1',
        parent_key: '',
        name: 'Tumarkhan',
        parent_id: '',
        parent_name: '',
        designation: '',
        reference: '',
        history: '',
        access: 'public',
      },
      {
        row_key: 'child_1',
        parent_key: 'root_1',
        name: 'Rakhmet',
        parent_id: '',
        parent_name: '',
        designation: '',
        reference: '',
        history: '',
        access: 'private',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    XLSX.writeFile(workbook, 'family-tree-import-template.xlsx')

    excelSuccess.value = t('person.excel.templateReady')
  } catch (e) {
    excelError.value = e?.message || t('person.excel.exportFailed')
  } finally {
    excelLoading.value = false
  }
}

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
    const status = e.response?.status
    const msg = e.response?.data?.error
    if (status === 500 && msg === 'failed to create person') {
      error.value = t('person.saveFailed') + '. ' + t('person.saveFailedHint')
    } else {
      error.value = msg || t('person.saveFailed')
    }
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
  max-width: 760px;
  margin: 0 auto;
}

.edit-person h2 {
  margin-bottom: 24px;
}

.excel-tools {
  margin-bottom: 20px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.95);
}

.excel-tools h3 {
  margin-bottom: 8px;
}

.excel-tools p {
  color: #475569;
  font-size: 14px;
  margin-bottom: 12px;
}

.excel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.excel-input {
  display: none;
}

.excel-notes {
  margin: 0;
  padding-left: 18px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.excel-notes li + li {
  margin-top: 4px;
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
