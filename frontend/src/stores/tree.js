import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useTreeStore = defineStore('tree', () => {
  const persons = ref([])
  const currentPerson = ref(null)
  const treeData = ref(null)
  const pathResult = ref(null)
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Lazy-loading state: tracks which parent IDs have had children fetched
  const loadedParentIds = ref(new Set())
  const loadingNodeIds = ref(new Set())

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

  async function fetchTree(personId) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/tree/${personId}`)
      treeData.value = data
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to load tree'
    } finally {
      loading.value = false
    }
  }

  async function fetchPerson(id) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/persons/${id}`)
      currentPerson.value = data
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
    currentPerson,
    treeData,
    pathResult,
    searchResults,
    loading,
    error,
    loadingNodeIds,
    loadedParentIds,
    fetchFullTree,
    fetchTree,
    fetchPerson,
    fetchNodeChildren,
    isNodeLoading,
    createPerson,
    updatePerson,
    deletePerson,
    searchPersons,
    findPath,
    getChildren,
  }
})
