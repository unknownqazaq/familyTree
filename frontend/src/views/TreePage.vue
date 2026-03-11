<template>
  <div class="tree-page">
    <section class="tree-hero card fade-up">
      <div class="hero-content">
        <div class="hero-copy">
          <p class="hero-kicker">{{ t('tree.heroKicker') }}</p>
          <h1>{{ t('tree.familyGraph') }}</h1>
          <p class="hero-subtitle">{{ t('tree.heroSubtitle') }}</p>
        </div>
        <div class="hero-orb"></div>
      </div>
    </section>

    <div class="tree-controls card fade-up">
      <div class="controls-row">
        <div class="search-group">
          <SearchBar :placeholder="t('search.personsPlaceholder')" @select="onSearchSelect" />
        </div>

        <div class="path-finder">
          <SearchBar :placeholder="t('search.fromPlaceholder')" @select="onFromSelect" />
          <SearchBar :placeholder="t('search.toPlaceholder')" @select="onToSelect" />
          <button class="btn-primary" @click="findPath">
            {{ t('tree.findPath') }}
          </button>
          <p v-if="pathError" class="error-msg path-error">{{ pathError }}</p>
        </div>
      </div>
    </div>

    <div class="panel-grid fade-up">
      <div v-if="selectedPerson" class="card panel person-detail">
        <PersonCard :person="selectedPerson" />
      </div>

      <div v-if="treeStore.pathResult" class="card panel path-panel">
        <PathView :path="treeStore.pathResult" @node-click="navigateToTree" />
      </div>
    </div>

    <div v-if="treeStore.loading" class="loading-card fade-up">
      <span class="loading-pulse"></span>
      {{ t('tree.loading') }}
    </div>

    <div class="tree-graph fade-up" v-if="treeStore.persons.length > 0">
      <TreeView ref="treeViewRef" :persons="treeStore.persons" :pathNodeIds="pathNodeIds" @node-click="onNodeClick" />
    </div>

    <div v-if="!treeStore.loading && treeStore.persons.length === 0" class="empty-state card fade-up">
      <p>{{ t('tree.empty') }}</p>
      <router-link v-if="authStore.isAuthenticated" to="/person/new" class="btn-primary">
        {{ t('tree.addFirst') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const pathError = ref('')
const treeViewRef = ref(null)
const { t } = useI18n()

const pathNodeIds = computed(() => {
  const ids = new Set()
  if (treeStore.pathResult && Array.isArray(treeStore.pathResult)) {
    treeStore.pathResult.forEach((node) => ids.add(node.id))
  }
  return ids
})

onMounted(async () => {
  await treeStore.fetchFullTree()

  if (route.params.id) {
    const id = parseInt(route.params.id)
    const person = await treeStore.fetchPerson(id)
    if (person) {
      selectedPerson.value = person
      // Expand and focus the node once the tree is ready
      treeViewRef.value?.expandToNode(id)
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
  // Pan / expand to node instead of navigating away
  treeViewRef.value?.expandToNode(person.id)
  // Update URL without triggering full navigation
  router.replace({ name: 'tree-person', params: { id: person.id } })
}

function onFromSelect(person) {
  pathFrom.value = person
  pathError.value = ''
}

function onToSelect(person) {
  pathTo.value = person
  pathError.value = ''
}

async function findPath() {
  if (!pathFrom.value || !pathTo.value) {
    pathError.value = t('tree.pathSelectBoth')
    return
  }
  pathError.value = ''
  await treeStore.findPath(pathFrom.value.id, pathTo.value.id)
}

function navigateToTree(nodeId) {
  // Scroll to node in mind map instead of navigating away
  treeViewRef.value?.expandToNode(nodeId)
  onNodeClick(nodeId)
  router.replace({ name: 'tree-person', params: { id: nodeId } })
}

onUnmounted(() => {
  // Clear path result when leaving tree page
  treeStore.pathResult = null
})
</script>

<style scoped>
.tree-page {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
}

.tree-hero {
  position: relative;
  overflow: hidden;
  padding: 28px 28px 26px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.88), rgba(238, 242, 255, 0.9));
}

.hero-content {
  display: grid;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.hero-copy {
  max-width: 620px;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6366f1;
  font-weight: 700;
  margin-bottom: 6px;
}

.hero-copy h1 {
  font-size: clamp(28px, 4vw, 36px);
  margin-bottom: 6px;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  color: #475569;
  font-size: 15px;
  line-height: 1.5;
}

.hero-orb {
  position: absolute;
  right: -50px;
  top: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.28), rgba(99, 102, 241, 0));
  filter: blur(2px);
}

.tree-controls {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  overflow: visible;
  position: relative;
  z-index: 10;
}

.controls-row {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(280px, 2fr);
  gap: 16px;
  align-items: start;
}

.search-group {
  width: 100%;
}

.path-finder {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  align-items: center;
}

.path-finder button {
  min-height: 42px;
  width: 100%;
}

.path-error {
  grid-column: 1 / -1;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.panel {
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.94);
}

.path-panel :deep(.path-view) {
  margin: 0;
}

.loading-card {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #64748b;
  font-weight: 600;
  width: fit-content;
}

.loading-pulse {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #6366f1;
  box-shadow: 0 0 0 rgba(99, 102, 241, 0.35);
  animation: pulse 1.6s infinite;
}

.tree-graph :deep(.tree-view) {
  width: 100%;
  max-width: 1100px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.12);
}

.tree-graph {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
}

.tree-graph :deep(.tree-viewport) {
  border-radius: 18px;
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

.fade-up {
  animation: fadeUp 0.5s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.35);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

@media (max-width: 980px) {
  .tree-page {
    gap: 16px;
  }

  .controls-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .path-finder {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .tree-graph :deep(.tree-view) {
    max-width: 100%;
    border-radius: 18px;
  }
}

@media (max-width: 760px) {
  .tree-page {
    gap: 14px;
  }

  .tree-hero {
    padding: 20px 16px 18px;
  }

  .hero-copy h1 {
    font-size: clamp(24px, 7vw, 30px);
  }

  .hero-subtitle {
    font-size: 14px;
    line-height: 1.45;
  }

  .hero-orb {
    display: none;
  }

  .panel-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .path-finder {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .tree-graph :deep(.tree-view) {
    border-radius: 16px;
  }
}

@media (max-width: 560px) {
  .tree-page {
    gap: 12px;
  }

  .tree-hero {
    padding: 16px 12px;
  }

  .hero-kicker {
    letter-spacing: 0.11em;
  }

  .loading-card {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .empty-state {
    padding: 24px 16px;
  }
}
</style>
