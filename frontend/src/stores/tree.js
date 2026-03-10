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

  async function fetchFullTree() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/tree')
      persons.value = Array.isArray(data) ? data : []
    } catch (e) {
      error.value = e.response?.data?.error || 'Failed to load tree'
    } finally {
      loading.value = false
    }
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
    fetchFullTree,
    fetchTree,
    fetchPerson,
    createPerson,
    updatePerson,
    deletePerson,
    searchPersons,
    findPath,
    getChildren,
  }
})
