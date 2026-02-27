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
          placeholder="Search by name, clan, or region..."
          class="search-input"
          @keydown.enter="handleSearch"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
      </div>
    </div>

    <div v-if="searchStore.query" class="results-header">
      <h3 class="results-title">Results for "{{ searchStore.query }}"</h3>
      <span class="results-count">· {{ searchStore.total }} records found</span>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Sort:</label>
        <select v-model="filters.sort" class="filter-select" @change="handleFilterChange">
          <option value="relevance">Relevance</option>
          <option value="recent">Most Recent</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Access:</label>
        <select v-model="filters.access" class="filter-select" @change="handleFilterChange">
          <option value="">All</option>
          <option value="public">Public Only</option>
        </select>
      </div>
    </div>

    <div v-if="searchStore.loading" class="loading-state">
      <div class="spinner"></div>
      <span>Searching...</span>
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

    <Pagination
      v-if="searchStore.pages > 1"
      :current="searchStore.page"
      :total="searchStore.pages"
      @change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from '../stores/search'
import SearchResultCard from '../components/search/SearchResultCard.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Pagination from '../components/ui/Pagination.vue'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()

const searchQuery = ref(route.query.q || '')
const filters = ref({ sort: 'relevance', access: '' })

function handleSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'search', query: { q: searchQuery.value } })
}

function clearSearch() {
  searchQuery.value = ''
  searchStore.reset()
}

function handleFilterChange() {
  doSearch(1)
}

function handlePageChange(page) {
  doSearch(page)
}

function doSearch(page = 1) {
  if (!searchQuery.value.trim()) return
  searchStore.search({
    q: searchQuery.value,
    page,
    sort: filters.value.sort,
    access: filters.value.access,
  })
}

watch(() => route.query.q, (q) => {
  if (q) {
    searchQuery.value = q
    doSearch(1)
  }
})

onMounted(() => {
  if (searchQuery.value) doSearch(1)
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

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #F4F6F7;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 20px;
}

.filter-group { display: flex; align-items: center; gap: 8px; }

.filter-label { font-size: 13px; color: #5D6D7E; white-space: nowrap; }

.filter-select {
  border: 1px solid #D5D8DC;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  background: #fff;
  color: #2C3E50;
  cursor: pointer;
}

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
