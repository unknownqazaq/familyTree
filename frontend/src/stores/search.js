import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useSearchStore = defineStore('search', () => {
  const results = ref([])
  const query   = ref('')
  const loading = ref(false)
  const error   = ref(null)

  async function search(q) {
    if (!q || q.length < 2) {
      results.value = []
      return
    }

    query.value   = q
    loading.value = true
    error.value   = null

    try {
      const { data } = await api.get('/persons/search', { params: { q } })
      results.value = Array.isArray(data) ? data : []
    } catch (e) {
      error.value   = e.response?.data?.error || 'Search failed'
      results.value = []
    } finally {
      loading.value = false
    }
  }

  function reset() {
    results.value = []
    query.value   = ''
    error.value   = null
  }

  return { results, query, loading, error, search, reset }
})
