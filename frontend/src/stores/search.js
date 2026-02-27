import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useSearchStore = defineStore('search', () => {
  const results = ref([])
  const query   = ref('')
  const total   = ref(0)
  const page    = ref(1)
  const pages   = ref(0)
  const loading = ref(false)
  const error   = ref(null)

  async function search({ q, page: p = 1, sort = 'relevance', access = '' } = {}) {
    query.value   = q
    loading.value = true
    error.value   = null

    try {
      const params = { q, page: p, limit: 20 }
      if (sort)   params.sort   = sort
      if (access) params.access = access

      const { data } = await api.get('/search', { params })
      results.value = data.results || []
      total.value   = data.total   || 0
      page.value    = data.page    || p
      pages.value   = data.pages   || 0
    } catch (e) {
      error.value   = e.response?.data?.error || 'Search failed'
      results.value = []
      total.value   = 0
    } finally {
      loading.value = false
    }
  }

  function reset() {
    results.value = []
    query.value   = ''
    total.value   = 0
    page.value    = 1
    pages.value   = 0
    error.value   = null
  }

  return { results, query, total, page, pages, loading, error, search, reset }
})
