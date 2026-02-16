<template>
  <div class="tree-page">
    <div class="tree-controls card">
      <div class="controls-row">
        <SearchBar :placeholder="t('search.personsPlaceholder')" @select="onSearchSelect" />

        <div class="path-finder">
          <SearchBar :placeholder="t('search.fromPlaceholder')" @select="onFromSelect" />
          <SearchBar :placeholder="t('search.toPlaceholder')" @select="onToSelect" />
          <button class="btn-primary" @click="findPath" :disabled="!pathFrom || !pathTo">
            {{ t('tree.findPath') }}
          </button>
        </div>
      </div>
    </div>

    <PathView
      v-if="treeStore.pathResult"
      :path="treeStore.pathResult"
      @node-click="navigateToTree"
    />

    <div v-if="treeStore.loading" class="loading">{{ t('tree.loading') }}</div>

    <div v-if="selectedPerson" class="card person-detail">
      <PersonCard :person="selectedPerson" />
    </div>

    <TreeView
      v-if="treeStore.persons.length > 0"
      :persons="treeStore.persons"
      @node-click="onNodeClick"
    />

    <div v-if="!treeStore.loading && treeStore.persons.length === 0" class="empty-state card">
      <p>{{ t('tree.empty') }}</p>
      <router-link v-if="authStore.isAuthenticated" to="/person/new" class="btn-primary">
        {{ t('tree.addFirst') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTreeStore } from '../stores/tree'
import { useAuthStore } from '../stores/auth'
import TreeView from '../components/TreeView.vue'
import PersonCard from '../components/PersonCard.vue'
import PathView from '../components/PathView.vue'
import SearchBar from '../components/SearchBar.vue'

const treeStore = useTreeStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const selectedPerson = ref(null)
const pathFrom = ref(null)
const pathTo = ref(null)
const { t } = useI18n()

onMounted(async () => {
  await treeStore.fetchFullTree()

  if (route.params.id) {
    const person = await treeStore.fetchPerson(parseInt(route.params.id))
    if (person) {
      selectedPerson.value = person
    }
  }
})

async function onNodeClick(nodeId) {
  const person = await treeStore.fetchPerson(nodeId)
  if (person) {
    selectedPerson.value = person
  }
}

function onSearchSelect(person) {
  selectedPerson.value = person
  router.push(`/tree/${person.id}`)
}

function onFromSelect(person) {
  pathFrom.value = person
}

function onToSelect(person) {
  pathTo.value = person
}

async function findPath() {
  if (pathFrom.value && pathTo.value) {
    await treeStore.findPath(pathFrom.value.id, pathTo.value.id)
  }
}

function navigateToTree(nodeId) {
  router.push(`/tree/${nodeId}`)
  onNodeClick(nodeId)
}
</script>

<style scoped>
.tree-controls {
  margin-bottom: 16px;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.path-finder {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.person-detail {
  margin-bottom: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-state p {
  margin-bottom: 16px;
  color: #64748b;
}

.empty-state a {
  display: inline-block;
  padding: 10px 20px;
  color: white;
  text-decoration: none;
  border-radius: 10px;
}
</style>
