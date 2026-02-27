import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../stores/search'

/**
 * Composable for inline search (autocomplete dropdown).
 * For the full search results page, use SearchView + useSearchStore directly.
 */
export function useSearch() {
  const router = useRouter()
  const searchStore = useSearchStore()

  const inputValue  = ref('')
  const suggestions = ref([])
  const showDropdown = ref(false)
  const debounceTimer = ref(null)

  function onInput(value) {
    inputValue.value = value
    clearTimeout(debounceTimer.value)

    if (!value || value.length < 2) {
      suggestions.value  = []
      showDropdown.value = false
      return
    }

    debounceTimer.value = setTimeout(() => fetchSuggestions(value), 280)
  }

  async function fetchSuggestions(q) {
    await searchStore.search({ q, page: 1 })
    suggestions.value  = searchStore.results.slice(0, 5)
    showDropdown.value = suggestions.value.length > 0
  }

  function selectSuggestion(person) {
    showDropdown.value = false
    inputValue.value   = ''
    router.push(`/person/${person.id}`)
  }

  function submitSearch() {
    if (!inputValue.value.trim()) return
    showDropdown.value = false
    router.push({ name: 'search', query: { q: inputValue.value } })
  }

  function closeDropdown() {
    showDropdown.value = false
  }

  return {
    inputValue,
    suggestions,
    showDropdown,
    loading: searchStore.loading,
    onInput,
    selectSuggestion,
    submitSearch,
    closeDropdown,
  }
}
