<template>
  <div class="tree-view card">
    <div class="tree-header">
      <div class="header-copy">
        <h3>{{ t('treeMap.title') }}</h3>
        <p>{{ t('treeMap.hint') }}</p>
      </div>
      <div class="header-controls">
        <button type="button" class="btn-secondary control-btn" @click="centerTree('smooth')">
          {{ t('treeMap.center') }}
        </button>
        <span class="stats-pill">{{ t('treeMap.nodesCount', { count: persons.length }) }}</span>
      </div>
    </div>

    <div ref="viewportRef" class="tree-viewport">
      <div ref="stageRef" class="tree-stage">
        <svg ref="linesRef" class="tree-lines"></svg>
        <div ref="mountRef" class="tree-mount"></div>
      </div>
    </div>

    <div v-if="modalState" class="modal-backdrop" @click.self="closeModal()">
      <div class="modal-card">
        <h4 v-if="modalState === 'add'">{{ t('treeMap.addTitle') }}</h4>
        <h4 v-else-if="modalState === 'edit'">{{ t('treeMap.editTitle') }}</h4>
        <h4 v-else>{{ t('treeMap.deleteTitle') }}</h4>

        <form v-if="modalState === 'add' || modalState === 'edit'" class="modal-form" @submit.prevent="submitPersonForm">
          <label class="form-label">
            <span>{{ t('treeMap.nameLabel') }}</span>
            <input v-model="formState.name" type="text" required />
          </label>

          <label class="form-label">
            <span>{{ t('treeMap.parentLabel') }}</span>
            <select v-model="formState.parent_id">
              <option value="">{{ t('treeMap.rootOption') }}</option>
              <option v-for="person in parentOptions" :key="person.id" :value="String(person.id)">
                {{ person.name }}
              </option>
            </select>
          </label>

          <label class="form-label">
            <span>{{ t('treeMap.designationLabel') }}</span>
            <input v-model="formState.designation" type="text" />
          </label>

          <label class="form-label">
            <span>{{ t('treeMap.referenceLabel') }}</span>
            <textarea v-model="formState.reference" rows="2"></textarea>
          </label>

          <label class="form-label">
            <span>{{ t('treeMap.historyLabel') }}</span>
            <textarea v-model="formState.history" rows="4"></textarea>
          </label>

          <label class="form-label">
            <span>{{ t('treeMap.accessLabel') }}</span>
            <select v-model="formState.access">
              <option value="private">{{ t('common.private') }}</option>
              <option value="public">{{ t('common.public') }}</option>
            </select>
          </label>

          <div class="modal-actions">
            <button type="submit" class="btn-primary" :disabled="mutationLoading">
              {{ mutationLoading ? t('common.saving') : (modalState === 'add' ? t('common.create') : t('common.update')) }}
            </button>
            <button type="button" class="btn-secondary" :disabled="mutationLoading" @click="closeModal()">
              {{ t('common.cancel') }}
            </button>
          </div>
        </form>

        <div v-else class="modal-delete">
          <p>{{ t('treeMap.deleteWarning', { name: activePerson?.name || '', children: activeChildrenCount }) }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-danger" :disabled="mutationLoading" @click="confirmDelete">
              {{ mutationLoading ? t('common.saving') : t('treeMap.confirmDelete') }}
            </button>
            <button type="button" class="btn-secondary" :disabled="mutationLoading" @click="closeModal()">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>

        <p v-if="mutationError" class="error-msg modal-error">{{ mutationError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useTreeStore } from '../stores/tree'

const props = defineProps({
  persons: { type: Array, default: () => [] },
})

const emit = defineEmits(['node-click'])
const treeStore = useTreeStore()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const viewportRef = ref(null)
const stageRef = ref(null)
const linesRef = ref(null)
const mountRef = ref(null)

const collapsedNodeIds = ref(new Set())
const selectedNodeId = ref(null)
const modalState = ref(null)
const activeNodeId = ref(null)
const mutationLoading = ref(false)
const mutationError = ref('')
const knownNodeIds = ref(new Set())
const autoCentered = ref(false)

const formState = reactive({
  name: '',
  parent_id: '',
  designation: '',
  reference: '',
  history: '',
  access: 'private',
})

const canManage = computed(() => Boolean(authStore.isAuthenticated))

const personById = computed(() => {
  const map = new Map()
  props.persons.forEach((person) => {
    map.set(person.id, person)
  })
  return map
})

const childrenByParentId = computed(() => {
  const map = new Map()

  props.persons.forEach((person) => {
    map.set(person.id, [])
  })

  props.persons.forEach((person) => {
    if (person.parent_id != null && map.has(person.parent_id)) {
      map.get(person.parent_id).push(person.id)
    }
  })

  return map
})

const rootIds = computed(() => {
  const roots = props.persons
    .filter((person) => person.parent_id == null || !personById.value.has(person.parent_id))
    .map((person) => person.id)

  if (roots.length === 0 && props.persons.length > 0) {
    roots.push(props.persons[0].id)
  }

  return roots
})

const activePerson = computed(() => {
  if (activeNodeId.value == null) return null
  return personById.value.get(activeNodeId.value) || null
})

const activeChildrenCount = computed(() => {
  if (activeNodeId.value == null) return 0
  return (childrenByParentId.value.get(activeNodeId.value) || []).length
})

function collectDescendantIds(nodeId, collected = new Set()) {
  const children = childrenByParentId.value.get(nodeId) || []

  children.forEach((childId) => {
    if (collected.has(childId)) return
    collected.add(childId)
    collectDescendantIds(childId, collected)
  })

  return collected
}

const blockedParentIds = computed(() => {
  if (modalState.value !== 'edit' || activeNodeId.value == null) return new Set()

  const blocked = collectDescendantIds(activeNodeId.value)
  blocked.add(activeNodeId.value)
  return blocked
})

const parentOptions = computed(() => {
  const blocked = blockedParentIds.value

  return [...props.persons]
    .filter((person) => !blocked.has(person.id))
    .sort((a, b) => a.name.localeCompare(b.name))
})

let lineFrameId = null
let resizeObserver = null

function resetFormState() {
  formState.name = ''
  formState.parent_id = ''
  formState.designation = ''
  formState.reference = ''
  formState.history = ''
  formState.access = 'private'
}

function openAddModal(nodeId) {
  if (!canManage.value) return

  mutationError.value = ''
  activeNodeId.value = nodeId
  modalState.value = 'add'
  resetFormState()

  const parent = personById.value.get(nodeId)
  formState.parent_id = String(nodeId)
  formState.access = parent?.access || 'private'
}

function openEditModal(nodeId) {
  if (!canManage.value) return

  const person = personById.value.get(nodeId)
  if (!person) return

  mutationError.value = ''
  activeNodeId.value = nodeId
  modalState.value = 'edit'

  formState.name = person.name || ''
  formState.parent_id = person.parent_id == null ? '' : String(person.parent_id)
  formState.designation = person.designation || ''
  formState.reference = person.reference || ''
  formState.history = person.history || ''
  formState.access = person.access || 'private'
}

function openDeleteModal(nodeId) {
  if (!canManage.value) return

  mutationError.value = ''
  activeNodeId.value = nodeId
  modalState.value = 'delete'
}

function closeModal(force = false) {
  if (mutationLoading.value && !force) return

  modalState.value = null
  activeNodeId.value = null
  mutationError.value = ''
  resetFormState()
}

function normalizeOptionalField(value) {
  const normalized = String(value || '').trim()
  return normalized.length > 0 ? normalized : null
}

function buildFormPayload() {
  return {
    name: formState.name.trim(),
    parent_id: formState.parent_id === '' ? null : Number(formState.parent_id),
    designation: normalizeOptionalField(formState.designation),
    reference: normalizeOptionalField(formState.reference),
    history: normalizeOptionalField(formState.history),
    access: formState.access === 'public' ? 'public' : 'private',
  }
}

async function submitPersonForm() {
  if (mutationLoading.value || !canManage.value) return

  mutationError.value = ''

  const payload = buildFormPayload()
  if (!payload.name) {
    mutationError.value = t('treeMap.validationError')
    return
  }

  if (payload.parent_id != null && (!Number.isInteger(payload.parent_id) || payload.parent_id <= 0)) {
    mutationError.value = t('treeMap.validationError')
    return
  }

  if (modalState.value === 'edit' && payload.parent_id != null && blockedParentIds.value.has(payload.parent_id)) {
    mutationError.value = t('treeMap.validationError')
    return
  }

  mutationLoading.value = true

  try {
    if (modalState.value === 'add') {
      const created = await treeStore.createPerson(payload)
      if (created?.id) {
        selectedNodeId.value = created.id
        emit('node-click', created.id)
      }
    } else if (modalState.value === 'edit' && activeNodeId.value != null) {
      await treeStore.updatePerson(activeNodeId.value, payload)
      selectedNodeId.value = activeNodeId.value
      emit('node-click', activeNodeId.value)
    }

    await treeStore.fetchFullTree()
    closeModal(true)
  } catch (error) {
    if (error?.response?.status === 403) {
      mutationError.value = t('treeMap.forbidden')
    } else {
      mutationError.value = error?.response?.data?.error || t('treeMap.saveFailed')
    }
  } finally {
    mutationLoading.value = false
  }
}

async function confirmDelete() {
  if (mutationLoading.value || !canManage.value || activeNodeId.value == null) return

  mutationLoading.value = true
  mutationError.value = ''

  try {
    const deletingId = activeNodeId.value
    await treeStore.deletePerson(deletingId)
    await treeStore.fetchFullTree()

    if (selectedNodeId.value === deletingId) {
      selectedNodeId.value = null
    }

    closeModal(true)
  } catch (error) {
    if (error?.response?.status === 403) {
      mutationError.value = t('treeMap.forbidden')
    } else {
      mutationError.value = error?.response?.data?.error || t('treeMap.deleteFailed')
    }
  } finally {
    mutationLoading.value = false
  }
}

function syncCollapsedState() {
  const previousCollapsed = collapsedNodeIds.value
  const previousKnown = knownNodeIds.value
  const nextCollapsed = new Set()
  const roots = new Set(rootIds.value)

  props.persons.forEach((person) => {
    const hasChildren = (childrenByParentId.value.get(person.id) || []).length > 0
    if (!hasChildren) return

    if (previousKnown.has(person.id)) {
      if (previousCollapsed.has(person.id)) {
        nextCollapsed.add(person.id)
      }
      return
    }

    if (!roots.has(person.id)) {
      nextCollapsed.add(person.id)
    }
  })

  collapsedNodeIds.value = nextCollapsed
  knownNodeIds.value = new Set(props.persons.map((person) => person.id))
}

function scheduleDrawLines() {
  if (lineFrameId != null) {
    cancelAnimationFrame(lineFrameId)
  }

  lineFrameId = requestAnimationFrame(() => {
    lineFrameId = null
    drawLines()
  })
}

function createIconButton({ title, text, className, onClick }) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `icon-btn ${className || ''}`.trim()
  button.title = title
  button.textContent = text

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    onClick()
  })

  return button
}

function handleSelectNode(nodeId) {
  selectedNodeId.value = nodeId
  emit('node-click', nodeId)
  renderMindMap()
}

function toggleNode(nodeId) {
  const next = new Set(collapsedNodeIds.value)

  if (next.has(nodeId)) {
    next.delete(nodeId)
  } else {
    next.add(nodeId)
  }

  collapsedNodeIds.value = next
  renderMindMap()
}

function createNodeRow(nodeId, isRoot = false, path = new Set()) {
  if (path.has(nodeId)) return null

  const person = personById.value.get(nodeId)
  if (!person) return null

  const nextPath = new Set(path)
  nextPath.add(nodeId)

  const childIds = childrenByParentId.value.get(nodeId) || []
  const hasChildren = childIds.length > 0
  const isCollapsed = collapsedNodeIds.value.has(nodeId)

  const row = document.createElement('div')
  row.className = 'tree-row'
  row.dataset.nodeId = String(nodeId)
  if (isCollapsed) {
    row.classList.add('collapsed')
  }

  const card = document.createElement('div')
  card.className = [
    'tree-node',
    isRoot ? 'root-node' : '',
    selectedNodeId.value === nodeId ? 'selected-node' : '',
  ]
    .filter(Boolean)
    .join(' ')
  card.dataset.nodeId = String(nodeId)

  const top = document.createElement('div')
  top.className = 'node-top'

  const labelLine = document.createElement('div')
  labelLine.className = 'label-line'

  const dot = document.createElement('div')
  dot.className = 'node-dot'

  const label = document.createElement('div')
  label.className = 'node-label'
  label.textContent = person.name

  labelLine.appendChild(dot)
  labelLine.appendChild(label)

  const actions = document.createElement('div')
  actions.className = 'node-actions'

  if (canManage.value) {
    actions.appendChild(
      createIconButton({
        title: t('treeMap.addChild'),
        text: '+',
        className: 'add-btn',
        onClick: () => openAddModal(nodeId),
      })
    )

    actions.appendChild(
      createIconButton({
        title: t('treeMap.editNode'),
        text: '\u270E',
        className: 'edit-btn',
        onClick: () => openEditModal(nodeId),
      })
    )

    actions.appendChild(
      createIconButton({
        title: t('treeMap.deleteNode'),
        text: '\u2715',
        className: 'danger-btn',
        onClick: () => openDeleteModal(nodeId),
      })
    )
  }

  if (hasChildren) {
    actions.appendChild(
      createIconButton({
        title: isCollapsed ? t('treeMap.expand') : t('treeMap.collapse'),
        text: isCollapsed ? '\u25B8' : '\u25BE',
        className: 'toggle-btn',
        onClick: () => toggleNode(nodeId),
      })
    )
  }

  top.appendChild(labelLine)
  top.appendChild(actions)

  card.appendChild(top)

  if (person.designation) {
    const designation = document.createElement('div')
    designation.className = 'node-designation'
    designation.textContent = person.designation
    card.appendChild(designation)
  }

  const meta = document.createElement('div')
  meta.className = 'node-meta'
  meta.textContent = t('treeMap.meta', { id: person.id, count: childIds.length })
  card.appendChild(meta)

  const accessBadge = document.createElement('span')
  accessBadge.className = `access-badge ${person.access === 'public' ? 'is-public' : 'is-private'}`
  accessBadge.textContent = person.access === 'public' ? t('common.public') : t('common.private')
  card.appendChild(accessBadge)

  card.addEventListener('click', (event) => {
    if (event.target.closest('.icon-btn')) return
    handleSelectNode(nodeId)
  })

  const childrenWrap = document.createElement('div')
  childrenWrap.className = 'tree-children'

  childIds.forEach((childId) => {
    const childRow = createNodeRow(childId, false, nextPath)
    if (childRow) {
      childrenWrap.appendChild(childRow)
    }
  })

  row.appendChild(card)
  row.appendChild(childrenWrap)

  return row
}

function renderMindMap() {
  if (!mountRef.value) return

  mountRef.value.innerHTML = ''

  rootIds.value.forEach((rootId) => {
    const row = createNodeRow(rootId, true, new Set())
    if (row) {
      mountRef.value.appendChild(row)
    }
  })

  scheduleDrawLines()
}

function drawLines() {
  if (!linesRef.value || !stageRef.value || !mountRef.value) return

  linesRef.value.innerHTML = ''

  const stageRect = stageRef.value.getBoundingClientRect()
  const lineColor =
    getComputedStyle(stageRef.value).getPropertyValue('--line-color').trim() || 'rgba(148, 163, 184, 0.4)'

  const rows = mountRef.value.querySelectorAll('.tree-row')

  rows.forEach((row) => {
    if (row.classList.contains('collapsed')) return

    const parentCard = row.querySelector(':scope > .tree-node')
    const childrenCol = row.querySelector(':scope > .tree-children')
    if (!parentCard || !childrenCol) return

    const childRows = childrenCol.querySelectorAll(':scope > .tree-row')
    if (!childRows.length) return

    const parentRect = parentCard.getBoundingClientRect()
    const parentX = parentRect.right - stageRect.left
    const parentY = (parentRect.top + parentRect.bottom) / 2 - stageRect.top

    childRows.forEach((childRow) => {
      const childCard = childRow.querySelector(':scope > .tree-node')
      if (!childCard) return

      const childRect = childCard.getBoundingClientRect()
      const childX = childRect.left - stageRect.left
      const childY = (childRect.top + childRect.bottom) / 2 - stageRect.top
      const midX = (parentX + childX) / 2

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M ${parentX} ${parentY} C ${midX} ${parentY}, ${midX} ${childY}, ${childX} ${childY}`)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', lineColor)
      path.setAttribute('stroke-width', '2')
      path.setAttribute('stroke-linecap', 'round')
      linesRef.value.appendChild(path)

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      dot.setAttribute('cx', childX)
      dot.setAttribute('cy', childY)
      dot.setAttribute('r', '3')
      dot.setAttribute('fill', 'rgba(14, 165, 233, 0.56)')
      linesRef.value.appendChild(dot)
    })
  })
}

function centerTree(behavior = 'smooth') {
  if (!viewportRef.value || !mountRef.value) return

  const targetId =
    selectedNodeId.value != null && personById.value.has(selectedNodeId.value)
      ? selectedNodeId.value
      : rootIds.value[0]

  if (targetId == null) return

  const card = mountRef.value.querySelector(`.tree-node[data-node-id="${targetId}"]`)
  if (!card) return

  const cardRect = card.getBoundingClientRect()
  const viewportRect = viewportRef.value.getBoundingClientRect()

  const targetLeft = viewportRef.value.scrollLeft + (cardRect.left - viewportRect.left) - 60
  const targetTop =
    viewportRef.value.scrollTop + (cardRect.top - viewportRect.top) - viewportRect.height / 2 + cardRect.height / 2

  viewportRef.value.scrollTo({
    left: Math.max(0, targetLeft),
    top: Math.max(0, targetTop),
    behavior,
  })
}

function handleViewportScroll() {
  scheduleDrawLines()
}

function handleWindowResize() {
  scheduleDrawLines()
}

watch(
  () => props.persons,
  async () => {
    syncCollapsedState()

    if (selectedNodeId.value != null && !personById.value.has(selectedNodeId.value)) {
      selectedNodeId.value = null
    }

    if (activeNodeId.value != null && !personById.value.has(activeNodeId.value)) {
      closeModal(true)
    }

    await nextTick()
    renderMindMap()

    if (props.persons.length === 0) {
      autoCentered.value = false
      return
    }

    if (!autoCentered.value) {
      await nextTick()
      centerTree('auto')
      autoCentered.value = true
    }
  },
  { immediate: true, deep: true }
)

watch(canManage, () => {
  renderMindMap()
})

watch(
  () => locale.value,
  () => {
    renderMindMap()
  }
)

onMounted(() => {
  if (viewportRef.value) {
    viewportRef.value.addEventListener('scroll', handleViewportScroll, { passive: true })
  }

  window.addEventListener('resize', handleWindowResize)

  if (typeof ResizeObserver !== 'undefined' && stageRef.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleDrawLines()
    })

    resizeObserver.observe(stageRef.value)
    if (mountRef.value) {
      resizeObserver.observe(mountRef.value)
    }
  }

  renderMindMap()
})

onUnmounted(() => {
  if (viewportRef.value) {
    viewportRef.value.removeEventListener('scroll', handleViewportScroll)
  }

  window.removeEventListener('resize', handleWindowResize)

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (lineFrameId != null) {
    cancelAnimationFrame(lineFrameId)
    lineFrameId = null
  }
})
</script>

<style>
.tree-view {
  --bg: #eef4ff;
  --panel: rgba(255, 255, 255, 0.78);
  --panel2: rgba(255, 255, 255, 0.92);
  --border: rgba(148, 163, 184, 0.35);
  --text: #0f172a;
  --muted: #64748b;
  --shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
  --radius: 18px;
  --gap-x: 34px;
  --gap-y: 16px;
  --node-width: 220px;
  --line-color: rgba(100, 116, 139, 0.34);
  --accent: #38bdf8;
  --accent2: #818cf8;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 18px 18px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background:
    radial-gradient(1000px 500px at 15% 5%, rgba(125, 211, 252, 0.24), transparent 58%),
    radial-gradient(820px 420px at 78% 20%, rgba(129, 140, 248, 0.2), transparent 62%),
    linear-gradient(175deg, var(--panel), rgba(241, 245, 249, 0.84));
  color: var(--text);
  backdrop-filter: blur(8px);
}

.tree-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 6px 12px;
}

.header-copy h3 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0.2px;
  color: var(--text);
}

.header-copy p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-controls .control-btn {
  border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--panel2), rgba(255, 255, 255, 0.62));
  color: var(--text);
  border-radius: 14px;
  min-height: 38px;
  padding: 10px 12px;
  box-shadow: none;
  font-size: 13px;
  font-weight: 600;
}

.header-controls .control-btn:hover {
  border-color: rgba(100, 116, 139, 0.45);
}

.header-controls .control-btn:active {
  transform: translateY(0);
}

.stats-pill {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  border: 1px dashed rgba(100, 116, 139, 0.4);
  background: rgba(255, 255, 255, 0.66);
  padding: 8px 10px;
  border-radius: 999px;
}

.tree-viewport {
  position: relative;
  height: 560px;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid var(--border);
  background:
    radial-gradient(860px 400px at 10% 10%, rgba(255, 255, 255, 0.75), transparent 60%),
    radial-gradient(700px 350px at 80% 30%, rgba(226, 232, 240, 0.65), transparent 65%),
    rgba(241, 245, 249, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.66);
}

.tree-stage {
  position: relative;
  width: max-content;
  min-width: 1600px;
  min-height: 900px;
  padding: 26px;
}

.tree-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tree-mount {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap-y);
  width: max-content;
}

.tree-row {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-x);
}

.tree-row.collapsed > .tree-children {
  display: none;
}

.tree-children {
  display: flex;
  flex-direction: column;
  gap: var(--gap-y);
  padding-top: 2px;
}

.tree-node {
  width: fit-content;
  min-width: var(--node-width);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.42);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.93), rgba(241, 245, 249, 0.86));
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.14);
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
}

.tree-node:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16);
  border-color: rgba(99, 102, 241, 0.35);
}

.root-node {
  border-color: rgba(129, 140, 248, 0.45);
}

.selected-node {
  outline: 2px solid rgba(56, 189, 248, 0.45);
  outline-offset: 2px;
}

.node-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.label-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: fit-content;
}

.node-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
  background: radial-gradient(circle at 30% 30%, var(--accent), rgba(56, 189, 248, 0.24));
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.16);
}

.root-node .node-dot {
  background: radial-gradient(circle at 30% 30%, var(--accent2), rgba(129, 140, 248, 0.24));
  box-shadow: 0 0 0 5px rgba(129, 140, 248, 0.14);
}

.node-label {
  font-size: 13px;
  font-weight: 650;
  color: var(--text);
  line-height: 1.25;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  word-break: normal;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.75);
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s ease, border-color 0.12s ease, background-color 0.12s ease;
  user-select: none;
}

.icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.42);
  background: rgba(255, 255, 255, 0.96);
}

.icon-btn:active {
  transform: translateY(0);
}

.add-btn {
  color: #0284c7;
}

.edit-btn {
  color: #4f46e5;
}

.danger-btn {
  color: #dc2626;
}

.toggle-btn {
  color: #1e293b;
  font-size: 12px;
}

.node-designation {
  color: #556277;
  font-size: 12px;
  line-height: 1.35;
}

.node-meta {
  margin-top: 2px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.3;
}

.access-badge {
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 3px 8px;
}

.access-badge.is-public {
  background: #dcfce7;
  color: #166534;
}

.access-badge.is-private {
  background: #fef3c7;
  color: #92400e;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(560px, 100%);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #fff;
  box-shadow: 0 24px 42px rgba(15, 23, 42, 0.2);
  padding: 18px;
}

.modal-card h4 {
  margin: 0 0 12px;
  color: #0f172a;
}

.modal-form {
  display: grid;
  gap: 12px;
}

.form-label {
  display: grid;
  gap: 6px;
}

.form-label span {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.modal-delete p {
  color: #334155;
  margin-bottom: 14px;
}

.modal-error {
  margin-top: 10px;
}

.tree-viewport::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.tree-viewport::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.42);
  border-radius: 999px;
  border: 3px solid rgba(241, 245, 249, 0.78);
}

@media (max-width: 880px) {
  .tree-header {
    flex-direction: column;
  }

  .header-controls {
    width: 100%;
  }

  .control-btn {
    width: 100%;
  }

  .tree-viewport {
    height: 560px;
  }

  .tree-stage {
    min-width: 1200px;
    min-height: 760px;
  }
}
</style>
