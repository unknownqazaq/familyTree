import { ref } from 'vue'
import api from '../api'

/**
 * Composable for finding a path between two persons in the tree.
 * Wraps GET /api/tree/path/:from/:to
 */
export function usePathFinder() {
  const fromPerson  = ref(null)
  const toPerson    = ref(null)
  const pathResult  = ref([])   // Array of { id, name }
  const loading     = ref(false)
  const error       = ref(null)

  async function findPath() {
    if (!fromPerson.value || !toPerson.value) return

    loading.value    = true
    error.value      = null
    pathResult.value = []

    try {
      const { data } = await api.get(`/tree/path/${fromPerson.value.id}/${toPerson.value.id}`)
      // Backend returns array of PathNode { id, name }
      pathResult.value = Array.isArray(data) ? data : []
    } catch (e) {
      error.value = e.response?.data?.error || 'Path not found'
    } finally {
      loading.value = false
    }
  }

  function clearPath() {
    pathResult.value = []
    error.value      = null
  }

  function setFrom(person) {
    fromPerson.value = person
  }

  function setTo(person) {
    toPerson.value = person
  }

  return {
    fromPerson,
    toPerson,
    pathResult,
    loading,
    error,
    findPath,
    clearPath,
    setFrom,
    setTo,
  }
}
