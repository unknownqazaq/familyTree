<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      :placeholder="placeholder"
      @input="onSearch"
    />
    <div v-if="results.length > 0" class="search-results">
      <div
        v-for="person in results"
        :key="person.id"
        class="search-item"
        @click="selectPerson(person)"
      >
        {{ person.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTreeStore } from '../stores/tree'

const props = defineProps({
  placeholder: { type: String, default: 'Search persons...' },
})

const emit = defineEmits(['select'])

const treeStore = useTreeStore()
const query = ref('')
const results = ref([])

let debounceTimer = null

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (query.value.length >= 2) {
      await treeStore.searchPersons(query.value)
      results.value = treeStore.searchResults
    } else {
      results.value = []
    }
  }, 300)
}

function selectPerson(person) {
  emit('select', person)
  query.value = person.name
  results.value = []
}
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-item {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
}

.search-item:hover {
  background-color: #f0f4f8;
}
</style>
