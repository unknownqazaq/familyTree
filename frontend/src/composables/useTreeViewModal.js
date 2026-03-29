/**
 * useTreeViewModal
 *
 * Encapsulates all modal/form state and mutation actions for the tree view.
 * Reduces: submitPersonForm CC 17→7, confirmDelete CC 8→3.
 * Eliminates: D1 (duplicated catch block), D2 (modal-open preamble ×3).
 */
import { computed, nextTick, reactive, ref } from 'vue'
import { collectDescendantIds as _collectDescendantIds } from '../utils/treeUtils'

export function useTreeViewModal({
  authStore,
  treeStore,
  t,
  persons,
  personById,
  childrenByParentId,
  selectedNodeId,
  emit,
  expandToNode,
}) {
  // ─── State ───────────────────────────────────────────────────────────────────

  const modalState = ref(null)
  const activeNodeId = ref(null)
  const mutationLoading = ref(false)
  const mutationError = ref('')
  const existingAddChildren = ref([])
  const existingAddChildrenLoading = ref(false)

  const formState = reactive({
    name: '',
    parent_id: '',
    designation: '',
    reference: '',
    history: '',
    access: 'public',
  })

  // ─── Computed ────────────────────────────────────────────────────────────────

  const activePerson = computed(() => {
    if (activeNodeId.value == null) return null
    return personById.value.get(activeNodeId.value) || null
  })

  const activeChildrenCount = computed(() => {
    if (activeNodeId.value == null) return 0
    return (childrenByParentId.value.get(activeNodeId.value) || []).length
  })

  function collectDescendantIds(nodeId, collected = new Set()) {
    return _collectDescendantIds(nodeId, childrenByParentId.value, collected)
  }

  const blockedParentIds = computed(() => {
    if (modalState.value !== 'edit' || activeNodeId.value == null) return new Set()
    const blocked = collectDescendantIds(activeNodeId.value)
    blocked.add(activeNodeId.value)
    return blocked
  })

  const parentOptions = computed(() =>
    [...persons.value]
      .filter((p) => !blockedParentIds.value.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

  // ─── Private helpers ─────────────────────────────────────────────────────────

  function resetFormState() {
    formState.name = ''
    formState.parent_id = ''
    formState.designation = ''
    formState.reference = ''
    formState.history = ''
    formState.access = 'public'
  }

  // D2 — unified modal-open preamble
  function beginModal(nodeId, mode) {
    mutationError.value = ''
    activeNodeId.value = nodeId
    modalState.value = mode
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

  // D1 — unified error handler
  function handleMutationError(error, fallbackKey) {
    if (error?.response?.status === 403) {
      mutationError.value = t('treeMap.forbidden')
    } else {
      mutationError.value = error?.response?.data?.error || t(fallbackKey)
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  function openAddModal(nodeId) {
    if (!authStore.isAuthenticated) return
    beginModal(nodeId, 'add')
    resetFormState()
    formState.parent_id = String(nodeId)
    formState.access = 'public'

    // Fetch existing children to help user avoid duplicates
    existingAddChildren.value = []
    existingAddChildrenLoading.value = true
    treeStore.getChildren(nodeId)
      .then((children) => {
        existingAddChildren.value = Array.isArray(children) ? children : []
      })
      .catch(() => {
        existingAddChildren.value = []
      })
      .finally(() => {
        existingAddChildrenLoading.value = false
      })
  }

  function openEditModal(nodeId) {
    if (!authStore.isAuthenticated) return
    const person = personById.value.get(nodeId)
    if (!person) return
    beginModal(nodeId, 'edit')
    formState.name = person.name || ''
    formState.parent_id = person.parent_id == null ? '' : String(person.parent_id)
    formState.designation = person.designation || ''
    formState.reference = person.reference || ''
    formState.history = person.history || ''
    formState.access = person.access || 'public'
  }

  function openDeleteModal(nodeId) {
    if (!authStore.isAuthenticated) return
    beginModal(nodeId, 'delete')
  }

  function closeModal(force = false) {
    if (mutationLoading.value && !force) return
    modalState.value = null
    activeNodeId.value = null
    mutationError.value = ''
    resetFormState()
  }

  async function submitPersonForm() {
    if (mutationLoading.value || !authStore.isAuthenticated) return

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
      let newId = null
      if (modalState.value === 'add') {
        const created = await treeStore.createPerson(payload)
        newId = created?.id || null
        treeStore.addPersonToStore(created)
      } else if (modalState.value === 'edit' && activeNodeId.value != null) {
        const updated = await treeStore.updatePerson(activeNodeId.value, payload)
        newId = activeNodeId.value
        treeStore.updatePersonInStore(updated)
      }

      closeModal(true)

      if (newId && expandToNode) {
        await nextTick()
        await expandToNode(newId)
      } else if (newId) {
        selectedNodeId.value = newId
        emit('node-click', newId)
      }
    } catch (error) {
      handleMutationError(error, 'treeMap.saveFailed')
    } finally {
      mutationLoading.value = false
    }
  }

  async function confirmDelete() {
    if (mutationLoading.value || !authStore.isAuthenticated || activeNodeId.value == null) return

    mutationLoading.value = true
    mutationError.value = ''
    try {
      const deletingId = activeNodeId.value
      await treeStore.deletePerson(deletingId)
      treeStore.removePersonFromStore(deletingId)
      if (selectedNodeId.value === deletingId) selectedNodeId.value = null
      closeModal(true)
    } catch (error) {
      handleMutationError(error, 'treeMap.deleteFailed')
    } finally {
      mutationLoading.value = false
    }
  }

  function closeIfStaleNode(currentPersonById) {
    if (activeNodeId.value != null && !currentPersonById.has(activeNodeId.value)) {
      closeModal(true)
    }
  }

  return {
    // state
    formState,
    modalState,
    activeNodeId,
    mutationLoading,
    mutationError,
    existingAddChildren,
    existingAddChildrenLoading,
    // computed
    activePerson,
    activeChildrenCount,
    blockedParentIds,
    parentOptions,
    // actions
    openAddModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    submitPersonForm,
    confirmDelete,
    closeIfStaleNode,
    // exposed for tests
    buildFormPayload,
    normalizeOptionalField,
    collectDescendantIds,
  }
}
