<template>
  <div class="profile-view" v-if="person">
    <nav class="breadcrumb">
      <router-link to="/">Home</router-link>
      <span class="sep">/</span>
      <router-link to="/tree">Tree</router-link>
      <span class="sep">/</span>
      <span class="current">{{ person.name }}</span>
    </nav>

    <div class="profile-header card">
      <div class="header-content">
        <div class="avatar-lg">{{ initials }}</div>
        <div class="header-info">
          <div class="header-top">
            <h1>{{ person.name }}</h1>
            <span :class="['badge', person.access === 'public' ? 'badge-public' : 'badge-private']">
              {{ person.access }}
            </span>
          </div>
          <p v-if="person.designation" class="designation">{{ person.designation }}</p>
          <p class="meta">Added {{ formatDate(person.created_at) }}</p>
        </div>
        <div class="header-actions">
          <router-link v-if="canEdit" :to="`/person/${person.id}/edit`" class="btn-primary">
            Edit Person
          </router-link>
          <router-link :to="`/tree/${person.id}`" class="btn-secondary">
            View in Tree
          </router-link>
        </div>
      </div>
    </div>

    <div class="profile-body">
      <div class="profile-left">
        <div class="card info-card">
          <div v-if="person.reference" class="info-field">
            <span class="field-label">REFERENCE</span>
            <p class="field-value">{{ person.reference }}</p>
          </div>
          <div v-if="person.history" class="info-field">
            <span class="field-label">HISTORY</span>
            <p class="field-value">{{ person.history }}</p>
          </div>
          <div v-if="!person.reference && !person.history" class="no-info">
            No additional information recorded.
          </div>
        </div>

        <div class="card mini-tree-card">
          <h4 class="mini-tree-title">Family Tree Context</h4>
          <div class="mini-tree-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#AEB6BF" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>Tree visualization</p>
          </div>
          <router-link :to="`/tree/${person.id}`" class="btn-ghost">Open Full Tree →</router-link>
        </div>
      </div>

      <div class="profile-right">
        <div class="card relations-card">
          <div class="relations-section">
            <span class="section-overline">PARENT</span>
            <RelationshipCard v-if="parent" :person="parent" />
            <p v-else class="no-relation">No parent recorded</p>
          </div>
          <div class="relations-section">
            <span class="section-overline">CHILDREN ({{ children.length }})</span>
            <div v-if="children.length > 0" class="children-list">
              <RelationshipCard v-for="child in children" :key="child.id" :person="child" />
            </div>
            <p v-else class="no-relation">No children recorded</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="loading-state">
    <div class="spinner"></div>
  </div>

  <div v-else class="not-found card">
    <h3>Person not found</h3>
    <router-link to="/tree" class="btn-primary">Browse Tree</router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTreeStore } from '../stores/tree'
import { useAuthStore } from '../stores/auth'
import RelationshipCard from '../components/profile/RelationshipCard.vue'

const route = useRoute()
const treeStore = useTreeStore()
const authStore = useAuthStore()

const person = ref(null)
const parent = ref(null)
const children = ref([])
const loading = ref(true)

const initials = computed(() => {
  if (!person.value?.name) return '?'
  return person.value.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const canEdit = computed(() => authStore.isAuthenticated && (authStore.isAdmin || authStore.isStaff))

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  const id = parseInt(route.params.id)
  const data = await treeStore.fetchPerson(id)
  if (data) {
    person.value = data
    if (data.parent_id) {
      parent.value = await treeStore.fetchPerson(data.parent_id)
    }
    const childData = await treeStore.getChildren(id)
    children.value = childData || []
  }
  loading.value = false
})
</script>

<style scoped>
.profile-view { max-width: 1100px; margin: 0 auto; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #AEB6BF;
}
.breadcrumb a { color: #2980B9; text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { color: #D5D8DC; }
.current { color: #1C2833; font-weight: 500; }

.card {
  background: #fff;
  border: 1px solid #EAECEE;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.profile-header {
  border-bottom: 3px solid #C9A96E;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #EAECEE;
  color: #1A5276;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-info { flex: 1; }

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

h1 { font-size: 28px; font-weight: 700; color: #1C2833; }

.badge {
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}
.badge-public  { background: #D5F5E3; color: #1E8449; }
.badge-private { background: #FEF9E7; color: #B7950B; }

.designation { font-size: 15px; color: #5D6D7E; margin-bottom: 4px; }
.meta { font-size: 12px; color: #AEB6BF; }

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.btn-primary {
  display: inline-block;
  background: #1A5276;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.btn-primary:hover { background: #154360; }

.btn-secondary {
  display: inline-block;
  background: transparent;
  color: #2C3E50;
  border: 1px solid #D5D8DC;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.btn-secondary:hover { background: #EAECEE; }

.btn-ghost {
  background: transparent;
  color: #2980B9;
  border: none;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.profile-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.profile-left  { display: flex; flex-direction: column; gap: 24px; }
.profile-right { display: flex; flex-direction: column; gap: 16px; }

.info-field {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EAECEE;
}
.info-field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5D6D7E;
  margin-bottom: 6px;
}
.field-value { font-size: 15px; color: #2C3E50; line-height: 1.6; }
.no-info { font-size: 14px; color: #AEB6BF; font-style: italic; }

.mini-tree-card { display: flex; flex-direction: column; }
.mini-tree-title { font-size: 14px; font-weight: 600; color: #1C2833; margin-bottom: 16px; }

.mini-tree-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  background: #F4F6F7;
  border-radius: 6px;
  color: #AEB6BF;
  font-size: 13px;
  margin-bottom: 16px;
}

.relations-card {}

.relations-section { margin-bottom: 24px; }
.relations-section:last-child { margin-bottom: 0; }

.section-overline {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5D6D7E;
  margin-bottom: 12px;
}

.children-list { display: flex; flex-direction: column; gap: 8px; }
.no-relation { font-size: 13px; color: #AEB6BF; font-style: italic; }

.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px;
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

.not-found {
  text-align: center;
  padding: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

@media (max-width: 768px) {
  .profile-body { grid-template-columns: 1fr; }
  .header-content { flex-direction: column; }
  .header-actions { margin-left: 0; }
}
</style>
