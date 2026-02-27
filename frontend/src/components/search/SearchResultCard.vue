<template>
  <div class="result-card" @click="goToProfile">
    <div class="card-avatar">{{ initials }}</div>
    <div class="card-content">
      <div class="card-main">
        <div class="name-row">
          <h4 class="person-name">{{ person.name }}</h4>
          <span :class="['badge', person.access === 'public' ? 'badge-public' : 'badge-private']">
            {{ person.access }}
          </span>
        </div>
        <p v-if="person.parent_name" class="lineage">Son of {{ person.parent_name }}</p>
        <p v-if="person.designation" class="designation">{{ person.designation }}</p>
        <p v-if="person.excerpt" class="excerpt">{{ person.excerpt }}</p>
      </div>
      <div class="card-actions" @click.stop>
        <router-link :to="`/person/${person.id}`" class="btn-ghost">View Profile</router-link>
        <router-link :to="`/tree/${person.id}`" class="btn-ghost">View in Tree</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  person: { type: Object, required: true },
})

const router = useRouter()

const initials = computed(() => {
  if (!props.person?.name) return '?'
  return props.person.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

function goToProfile() {
  router.push(`/person/${props.person.id}`)
}
</script>

<style scoped>
.result-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #EAECEE;
  cursor: pointer;
  transition: background 0.15s;
}
.result-card:hover { background: #F4F6F7; }

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #EAECEE;
  color: #1A5276;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-main { flex: 1; }

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.person-name { font-size: 15px; font-weight: 600; color: #1C2833; }

.badge {
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}
.badge-public  { background: #D5F5E3; color: #1E8449; }
.badge-private { background: #FEF9E7; color: #B7950B; }

.lineage     { font-size: 13px; color: #5D6D7E; margin-bottom: 2px; }
.designation { font-size: 13px; color: #5D6D7E; }
.excerpt {
  font-size: 13px;
  color: #AEB6BF;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin-top: 4px;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.btn-ghost {
  background: transparent;
  color: #2980B9;
  border: 1px solid #D5D8DC;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 13px;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-ghost:hover { background: #D4E6F1; }
</style>
