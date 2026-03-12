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
  background: var(--c-fill-3);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
}
.relation-card:hover {
  background: var(--c-bg-2);
  border-color: var(--c-sep-opaque);
  box-shadow: 0 1px 3px var(--c-shadow);
}

.rel-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--c-fill-3);
  color: var(--c-primary-d);
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

.rel-name { font-size: 14px; font-weight: 600; color: var(--c-text); }
.rel-meta { font-size: 12px; color: var(--c-text-2); }

.rel-badge {
  border-radius: 2px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 500;
  align-self: flex-start;
}
.badge-public  { background: var(--c-badge-green-bg); color: var(--c-badge-green-text); }
.badge-private { background: var(--c-badge-yellow-bg); color: var(--c-badge-yellow-text); }

.rel-arrow { color: var(--c-text-3); font-size: 14px; flex-shrink: 0; }
</style>
