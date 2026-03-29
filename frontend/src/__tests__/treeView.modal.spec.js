/**
 * Phase 1A — Modal / mutation logic tests
 * Tests src/composables/useTreeViewModal.js in isolation.
 */
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTreeViewModal } from '../composables/useTreeViewModal.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const alice  = { id: 1, name: 'Alice',  parent_id: null,  access: 'public',  designation: 'Root' }
const bob    = { id: 2, name: 'Bob',    parent_id: 1,     access: 'private', designation: null   }
const carol  = { id: 3, name: 'Carol',  parent_id: 2,     access: 'private', designation: null   }

function makeStore({ isAuthenticated = true, isAdmin = false } = {}) {
  return {
    isAuthenticated,
    isAdmin,
  }
}

function makeTreeStore({ createOk = true, updateOk = true, deleteOk = true } = {}) {
  return {
    createPerson: createOk
      ? vi.fn().mockResolvedValue({ id: 99, name: 'New' })
      : vi.fn().mockRejectedValue({ response: { status: 500, data: { error: 'server error' } } }),
    updatePerson: updateOk
      ? vi.fn().mockResolvedValue({ id: 2, name: 'Bob updated' })
      : vi.fn().mockRejectedValue({ response: { status: 403, data: {} } }),
    deletePerson: deleteOk
      ? vi.fn().mockResolvedValue()
      : vi.fn().mockRejectedValue({ response: { status: 403, data: {} } }),
    getChildren: vi.fn().mockResolvedValue([]),
    addPersonToStore: vi.fn(),
    updatePersonInStore: vi.fn(),
    removePersonFromStore: vi.fn(),
    fetchFullTree: vi.fn().mockResolvedValue(),
  }
}

const t = (key, params) => {
  if (params) return `${key}:${JSON.stringify(params)}`
  return key
}

function makeContext(persons = [alice, bob, carol], authOverrides = {}, treeOverrides = {}) {
  const personsRef = computed(() => persons)
  const personByIdRef = computed(() => {
    const m = new Map()
    persons.forEach((p) => m.set(p.id, p))
    return m
  })
  const childrenByParentIdRef = computed(() => {
    const m = new Map()
    persons.forEach((p) => m.set(p.id, []))
    persons.forEach((p) => {
      if (p.parent_id != null && m.has(p.parent_id)) m.get(p.parent_id).push(p.id)
    })
    return m
  })

  const selectedNodeId = ref(null)
  const emit = vi.fn()

  return {
    authStore: makeStore(authOverrides),
    treeStore: makeTreeStore(treeOverrides),
    t,
    persons: personsRef,
    personById: personByIdRef,
    childrenByParentId: childrenByParentIdRef,
    selectedNodeId,
    emit,
  }
}

// ─── openAddModal ─────────────────────────────────────────────────────────────

describe('openAddModal', () => {
  it('sets modalState to add and populates parent_id + access', () => {
    const ctx = makeContext()
    const { openAddModal, modalState, formState, activeNodeId } = useTreeViewModal(ctx)

    openAddModal(1)

    expect(modalState.value).toBe('add')
    expect(activeNodeId.value).toBe(1)
    expect(formState.parent_id).toBe('1')
    expect(formState.access).toBe(alice.access)
  })

  it('does nothing when not authenticated', () => {
    const ctx = makeContext(undefined, { isAuthenticated: false })
    const { openAddModal, modalState } = useTreeViewModal(ctx)
    openAddModal(1)
    expect(modalState.value).toBeNull()
  })
})

// ─── openEditModal ────────────────────────────────────────────────────────────

describe('openEditModal', () => {
  it('mirrors all person fields into formState', () => {
    const ctx = makeContext()
    const { openEditModal, formState, modalState } = useTreeViewModal(ctx)

    openEditModal(1)

    expect(modalState.value).toBe('edit')
    expect(formState.name).toBe('Alice')
    expect(formState.parent_id).toBe('')        // null parent → empty string
    expect(formState.access).toBe('public')
    expect(formState.designation).toBe('Root')
  })

  it('converts non-null parent_id to string', () => {
    const ctx = makeContext()
    const { openEditModal, formState } = useTreeViewModal(ctx)
    openEditModal(2)
    expect(formState.parent_id).toBe('1')
  })

  it('does nothing for unknown node id', () => {
    const ctx = makeContext()
    const { openEditModal, modalState } = useTreeViewModal(ctx)
    openEditModal(9999)
    expect(modalState.value).toBeNull()
  })
})

// ─── openDeleteModal ──────────────────────────────────────────────────────────

describe('openDeleteModal', () => {
  it('sets modalState to delete', () => {
    const ctx = makeContext()
    const { openDeleteModal, modalState, activeNodeId } = useTreeViewModal(ctx)
    openDeleteModal(3)
    expect(modalState.value).toBe('delete')
    expect(activeNodeId.value).toBe(3)
  })
})

// ─── closeModal ───────────────────────────────────────────────────────────────

describe('closeModal', () => {
  it('resets all modal state', () => {
    const ctx = makeContext()
    const { openDeleteModal, closeModal, modalState, activeNodeId, mutationError } = useTreeViewModal(ctx)
    openDeleteModal(1)
    closeModal()
    expect(modalState.value).toBeNull()
    expect(activeNodeId.value).toBeNull()
    expect(mutationError.value).toBe('')
  })

  it('respects mutationLoading guard unless force=true', () => {
    const ctx = makeContext()
    const { openDeleteModal, closeModal, modalState, mutationLoading } = useTreeViewModal(ctx)
    openDeleteModal(1)
    mutationLoading.value = true
    closeModal()                  // should be blocked
    expect(modalState.value).toBe('delete')
    closeModal(true)              // force
    expect(modalState.value).toBeNull()
  })
})

// ─── activePerson & activeChildrenCount ──────────────────────────────────────

describe('activePerson / activeChildrenCount', () => {
  it('returns person matching activeNodeId', () => {
    const ctx = makeContext()
    const { openEditModal, activePerson } = useTreeViewModal(ctx)
    openEditModal(1)
    expect(activePerson.value).toBe(alice)
  })

  it('returns null when no active node', () => {
    const ctx = makeContext()
    const { activePerson } = useTreeViewModal(ctx)
    expect(activePerson.value).toBeNull()
  })

  it('returns direct child count for activeChildrenCount', () => {
    const ctx = makeContext()
    const { openDeleteModal, activeChildrenCount } = useTreeViewModal(ctx)
    openDeleteModal(2)                   // bob has carol as child
    expect(activeChildrenCount.value).toBe(1)
  })
})

// ─── blockedParentIds ─────────────────────────────────────────────────────────

describe('blockedParentIds', () => {
  it('blocks the edited node and all its descendants when in edit mode', () => {
    const ctx = makeContext()
    const { openEditModal, blockedParentIds } = useTreeViewModal(ctx)
    openEditModal(1)           // alice → bob → carol are all blocked
    expect(blockedParentIds.value.has(1)).toBe(true)   // self
    expect(blockedParentIds.value.has(2)).toBe(true)   // child
    expect(blockedParentIds.value.has(3)).toBe(true)   // grandchild
  })

  it('returns empty set when not in edit mode', () => {
    const ctx = makeContext()
    const { openAddModal, blockedParentIds } = useTreeViewModal(ctx)
    openAddModal(1)
    expect(blockedParentIds.value.size).toBe(0)
  })
})

// ─── parentOptions ────────────────────────────────────────────────────────────

describe('parentOptions', () => {
  it('excludes blocked ids and sorts alphabetically', () => {
    const ctx = makeContext()
    const { openEditModal, parentOptions } = useTreeViewModal(ctx)
    openEditModal(1)   // alice, bob, carol all blocked → parentOptions empty
    expect(parentOptions.value).toHaveLength(0)
  })

  it('includes all persons when not in edit mode (add mode)', () => {
    const ctx = makeContext()
    const { openAddModal, parentOptions } = useTreeViewModal(ctx)
    openAddModal(3)
    // all 3 persons are available
    expect(parentOptions.value).toHaveLength(3)
    // sorted by name: Alice, Bob, Carol
    expect(parentOptions.value.map((p) => p.name)).toEqual(['Alice', 'Bob', 'Carol'])
  })
})

// ─── submitPersonForm — add ───────────────────────────────────────────────────

describe('submitPersonForm (add)', () => {
  it('creates person and emits node-click on success', async () => {
    const ctx = makeContext()
    const { openAddModal, formState, submitPersonForm } = useTreeViewModal(ctx)

    openAddModal(1)
    formState.name = 'New Person'
    await submitPersonForm()

    expect(ctx.treeStore.createPerson).toHaveBeenCalled()
    expect(ctx.emit).toHaveBeenCalledWith('node-click', 99)
  })

  it('sets validationError when name is empty', async () => {
    const ctx = makeContext()
    const { openAddModal, formState, submitPersonForm, mutationError } = useTreeViewModal(ctx)
    openAddModal(1)
    formState.name = ''
    await submitPersonForm()
    expect(mutationError.value).toBe('treeMap.validationError')
  })

  it('sets validationError when parent_id is non-positive integer string', async () => {
    const ctx = makeContext()
    const { openAddModal, formState, submitPersonForm, mutationError } = useTreeViewModal(ctx)
    openAddModal(1)
    formState.name = 'Test'
    formState.parent_id = '0'
    await submitPersonForm()
    expect(mutationError.value).toBe('treeMap.validationError')
  })
})

// ─── submitPersonForm — edit ──────────────────────────────────────────────────

describe('submitPersonForm (edit)', () => {
  it('calls updatePerson and emits node-click on success', async () => {
    const ctx = makeContext()
    const { openEditModal, submitPersonForm } = useTreeViewModal(ctx)
    openEditModal(2)
    await submitPersonForm()
    expect(ctx.treeStore.updatePerson).toHaveBeenCalledWith(2, expect.objectContaining({ name: 'Bob' }))
    expect(ctx.emit).toHaveBeenCalledWith('node-click', 2)
  })

  it('blocks saving to a descendant (cycle prevention)', async () => {
    const ctx = makeContext()
    const { openEditModal, formState, submitPersonForm, mutationError } = useTreeViewModal(ctx)
    openEditModal(1)              // editing alice
    formState.parent_id = '3'    // trying to set carol (alice's grandchild) as parent
    await submitPersonForm()
    expect(mutationError.value).toBe('treeMap.validationError')
  })
})

// ─── error handling (D1) ──────────────────────────────────────────────────────

describe('error handling', () => {
  it('shows forbidden message for 403 in submitPersonForm', async () => {
    const ctx = makeContext(undefined, {}, { updateOk: false })
    const modal = useTreeViewModal(ctx)
    modal.openEditModal(2)
    await modal.submitPersonForm()
    expect(modal.mutationError.value).toBe('treeMap.forbidden')
  })

  it('shows specific server error message when available', async () => {
    const ctx = makeContext(undefined, {}, { createOk: false })
    const modal = useTreeViewModal(ctx)
    modal.openAddModal(1)
    modal.formState.name = 'Test'
    await modal.submitPersonForm()
    expect(modal.mutationError.value).toBe('server error')
  })

  it('shows forbidden message for 403 in confirmDelete', async () => {
    const ctx = makeContext(undefined, {}, { deleteOk: false })
    const modal = useTreeViewModal(ctx)
    modal.openDeleteModal(2)
    await modal.confirmDelete()
    expect(modal.mutationError.value).toBe('treeMap.forbidden')
  })
})

// ─── confirmDelete ────────────────────────────────────────────────────────────

describe('confirmDelete', () => {
  it('deletes and closes modal on success', async () => {
    const ctx = makeContext()
    const { openDeleteModal, confirmDelete, modalState } = useTreeViewModal(ctx)
    openDeleteModal(3)
    await confirmDelete()
    expect(ctx.treeStore.deletePerson).toHaveBeenCalledWith(3)
    expect(modalState.value).toBeNull()
  })

  it('clears selectedNodeId when the deleted node was selected', async () => {
    const ctx = makeContext()
    ctx.selectedNodeId.value = 3
    const { openDeleteModal, confirmDelete } = useTreeViewModal(ctx)
    openDeleteModal(3)
    await confirmDelete()
    expect(ctx.selectedNodeId.value).toBeNull()
  })
})

// ─── normalizeOptionalField ───────────────────────────────────────────────────

describe('normalizeOptionalField', () => {
  it('returns null for empty or whitespace-only string', () => {
    const ctx = makeContext()
    const { normalizeOptionalField } = useTreeViewModal(ctx)
    expect(normalizeOptionalField('')).toBeNull()
    expect(normalizeOptionalField('   ')).toBeNull()
    expect(normalizeOptionalField(null)).toBeNull()
    expect(normalizeOptionalField(undefined)).toBeNull()
  })

  it('returns trimmed string for non-empty input', () => {
    const ctx = makeContext()
    const { normalizeOptionalField } = useTreeViewModal(ctx)
    expect(normalizeOptionalField('  hello  ')).toBe('hello')
  })
})
