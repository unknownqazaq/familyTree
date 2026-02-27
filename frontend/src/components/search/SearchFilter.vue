<template>
  <div class="search-filter">
    <div class="filter-group">
      <label class="filter-label">Sort:</label>
      <select v-model="localSort" class="filter-select" @change="emitChange">
        <option value="relevance">Relevance</option>
        <option value="recent">Most Recent</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Access:</label>
      <select v-model="localAccess" class="filter-select" @change="emitChange">
        <option value="">All</option>
        <option value="public">Public Only</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  sort:   { type: String, default: 'relevance' },
  access: { type: String, default: '' },
})

const emit = defineEmits(['change'])

const localSort   = ref(props.sort)
const localAccess = ref(props.access)

function emitChange() {
  emit('change', { sort: localSort.value, access: localAccess.value })
}
</script>

<style scoped>
.search-filter {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #F4F6F7;
  border-radius: 8px;
  padding: 8px 16px;
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
</style>
