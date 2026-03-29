import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useTreeStore = defineStore('tree', () => {
  const persons = ref([])
  const pathResult = ref(null)
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Lazy-loading state: tracks which parent IDs have had children fetched
  const loadedParentIds = ref(new Set())
  const loadingNodeIds = ref(new Set())

  /**
   * Load only root nodes (parent_id = null).
   * Children are fetched lazily on expand via fetchNodeChildren().
   */
  async function fetchRoots() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/tree/roots')
      persons.value = Array.isArray(data) ? data : []
      // Reset loaded state so children are fetched lazily on expand
      loadedParentIds.value = new Set()
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to load tree'
    } finally {
      loading.value = false
    }
  }

  /** Add a newly created person optimistically and invalidate its parent's loaded cache. */
  function addPersonToStore(person) {
    if (!person || persons.value.some((p) => p.id === person.id)) return
    let updated = [...persons.value, person]
    if (person.parent_id != null) {
      const next = new Set(loadedParentIds.value)
      next.delete(person.parent_id)
      loadedParentIds.value = next
      // Mark the parent as having children so the expand button appears immediately
      updated = updated.map((p) =>
        p.id === person.parent_id ? { ...p, has_children: true } : p,
      )
    }
    persons.value = updated
  }

  /** Replace a person in-place after an update, preserving has_children. */
  function updatePersonInStore(updated) {
    if (!updated) return
    persons.value = persons.value.map((p) =>
      p.id === updated.id ? { ...p, ...updated, has_children: p.has_children } : p,
    )
  }

  /** Remove a deleted person and all its loaded descendants from the store. */
  function removePersonFromStore(id) {
    const toRemove = new Set([id])
    let changed = true
    while (changed) {
      changed = false
      for (const p of persons.value) {
        if (p.parent_id != null && toRemove.has(p.parent_id) && !toRemove.has(p.id)) {
          toRemove.add(p.id)
          changed = true
        }
      }
    }
    persons.value = persons.value.filter((p) => !toRemove.has(p.id))
    const next = new Set(loadedParentIds.value)
    toRemove.forEach((removedId) => next.delete(removedId))
    loadedParentIds.value = next
  }

  async function fetchFullTree() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/tree')
      persons.value = Array.isArray(data) ? data : []
      // Mark all persons with children as "loaded" so lazy-fetch isn't triggered
      const parentIds = new Set()
      persons.value.forEach((p) => {
        if (p.parent_id != null) parentIds.add(p.parent_id)
      })
      loadedParentIds.value = parentIds
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to load tree'
    } finally {
      loading.value = false
    }
  }

  /**
   * Lazy-load children for a specific node.
   * Merges new children into the persons array and marks the parent as loaded.
   */
  async function fetchNodeChildren(parentId) {
    if (loadedParentIds.value.has(parentId)) return
    const next = new Set(loadingNodeIds.value)
    next.add(parentId)
    loadingNodeIds.value = next
    try {
      const { data } = await api.get(`/persons/${parentId}/children`)
      const children = Array.isArray(data) ? data : []
      if (children.length > 0) {
        const existingIds = new Set(persons.value.map((p) => p.id))
        const newPersons = children.filter((p) => !existingIds.has(p.id))
        if (newPersons.length > 0) {
          persons.value = [...persons.value, ...newPersons]
        }
      }
      loadedParentIds.value = new Set([...loadedParentIds.value, parentId])
    } finally {
      const rm = new Set(loadingNodeIds.value)
      rm.delete(parentId)
      loadingNodeIds.value = rm
    }
  }

  function isNodeLoading(nodeId) {
    return loadingNodeIds.value.has(nodeId)
  }

  async function fetchPerson(id) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/persons/${id}`)
      return data
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to load person'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createPerson(personData) {
    const { data } = await api.post('/persons', personData)
    return data
  }

  async function updatePerson(id, personData) {
    const { data } = await api.put(`/persons/${id}`, personData)
    return data
  }

  async function deletePerson(id) {
    await api.delete(`/persons/${id}`)
  }

  /**
   * Ensure a person and all their ancestors are loaded in the store.
   * Walks up the parent_id chain until reaching a root or an already-loaded node.
   */
  async function loadAncestorChain(personId) {
    const existingIds = new Set(persons.value.map((p) => p.id))
    const toAdd = []
    let currentId = personId

    while (currentId != null && !existingIds.has(currentId)) {
      try {
        const { data } = await api.get(`/persons/${currentId}`)
        if (!data) break
        toAdd.push(data)
        existingIds.add(data.id)
        currentId = data.parent_id
      } catch {
        break
      }
    }

    if (toAdd.length > 0) {
      persons.value = [...persons.value, ...toAdd]
    }
  }

  async function searchPersons(query) {
    if (!query || query.length < 2) {
      searchResults.value = []
      return
    }
    try {
      const { data } = await api.get(`/persons/search?q=${encodeURIComponent(query)}`)
      searchResults.value = data
    } catch {
      searchResults.value = []
    }
  }

  async function findPath(fromId, toId) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/tree/path/${fromId}/${toId}`)
      pathResult.value = data.path
      return data.path
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to find path'
      return null
    } finally {
      loading.value = false
    }
  }

  async function getChildren(personId) {
    const { data } = await api.get(`/persons/${personId}/children`)
    return data
  }

  return {
    persons,
    pathResult,
    searchResults,
    loading,
    error,
    loadingNodeIds,
    loadedParentIds,
    fetchRoots,
    fetchFullTree,
    fetchPerson,
    fetchNodeChildren,
    isNodeLoading,
    addPersonToStore,
    updatePersonInStore,
    removePersonFromStore,
    createPerson,
    updatePerson,
    deletePerson,
    loadAncestorChain,
    searchPersons,
    findPath,
    getChildren,
  }
})
