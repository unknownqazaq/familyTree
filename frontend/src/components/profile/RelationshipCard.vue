<template>
  <router-link :to="`/person/${person.id}`" class="relation-card">
    <div class="rel-avatar">{{ initials }}</div>
    <div class="rel-info">
      <span class="rel-name">{{ person.name }}</span>
      <span v-if="person.designation" class="rel-meta">{{ person.designation }}</span>
      <span v-if="person.access" :class="['rel-badge', person.access === 'public' ? 'badge-public' : 'badge-private']">
        {{ person.access }}
      </span>
    </div>
    <span class="rel-arrow">→</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  person: { type: Object, required: true },
})

const initials = computed(() => {
  if (!props.person?.name) return '?'
  return props.person.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})
</script>

<style scoped>
.relation-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F4F6F7;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
}
.relation-card:hover {
  background: #fff;
  border-color: #D5D8DC;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.rel-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #EAECEE;
  color: #1A5276;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rel-name { font-size: 14px; font-weight: 600; color: #1C2833; }
.rel-meta { font-size: 12px; color: #5D6D7E; }

.rel-badge {
  border-radius: 2px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  align-self: flex-start;
}
.badge-public  { background: #D5F5E3; color: #1E8449; }
.badge-private { background: #FEF9E7; color: #B7950B; }

.rel-arrow { color: #AEB6BF; font-size: 14px; flex-shrink: 0; }
</style>
