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
          <button class="btn-primary" @click="findPath" :disabled="!pathFrom || !pathTo">
            {{ t('tree.findPath') }}
          </button>
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
      <TreeView :persons="treeStore.persons" @node-click="onNodeClick" />
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
.tree-page {
  display: grid;
  gap: 20px;
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
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.12);
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
  .controls-row {
    grid-template-columns: 1fr;
  }
}
</style>
