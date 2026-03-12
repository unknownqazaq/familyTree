<template>
  <div class="search-view">
    <div class="search-bar-wrap">
      <div class="search-input-pill">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('search.personsPlaceholder')"
          class="search-input"
          @keydown.enter="handleSearch"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">&#10005;</button>
      </div>
    </div>

    <div v-if="searchStore.query" class="results-header">
      <h3 class="results-title">{{ t('search.resultsFor') }} "{{ searchStore.query }}"</h3>
      <span class="results-count">&middot; {{ searchStore.results.length }} {{ t('search.recordsFound') }}</span>
    </div>

    <div v-if="searchStore.loading" class="loading-state">
      <div class="spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="searchStore.results.length > 0" class="results-list">
      <SearchResultCard
        v-for="person in searchStore.results"
        :key="person.id"
        :person="person"
      />
    </div>

    <EmptyState
      v-else-if="searchStore.query && !searchStore.loading"
      :query="searchStore.query"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '../stores/search'
import SearchResultCard from '../components/search/SearchResultCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()

const searchQuery = ref(route.query.q || '')

function handleSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'search', query: { q: searchQuery.value } })
}

function clearSearch() {
  searchQuery.value = ''
  searchStore.reset()
}

function doSearch() {
  if (!searchQuery.value.trim()) return
  searchStore.search(searchQuery.value)
}

watch(() => route.query.q, (q) => {
  if (q) {
    searchQuery.value = q
    doSearch()
  }
})

onMounted(() => {
  if (searchQuery.value) doSearch()
})
</script>

<style scoped>
.search-view {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 0;
}

.search-bar-wrap { margin-bottom: 24px; }

.search-input-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #D5D8DC;
  border-radius: 16px;
  padding: 0 16px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.search-icon { color: #AEB6BF; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1C2833;
  background: transparent;
}
.search-input::placeholder { color: #AEB6BF; }

.clear-btn {
  background: none;
  border: none;
  color: #AEB6BF;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.results-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}
.results-title { font-size: 18px; font-weight: 600; color: #1C2833; }
.results-count { font-size: 14px; color: #5D6D7E; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
  color: #5D6D7E;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EAECEE;
  border-top-color: #1A5276;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.results-list { display: flex; flex-direction: column; }
</style>
