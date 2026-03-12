<template>
  <div class="profile-header-card">
    <div class="header-flex">
      <div class="avatar-lg">{{ initials }}</div>
      <div class="info">
        <div class="title-row">
          <h1>{{ person.name }}</h1>
          <span :class="['badge', person.access === 'public' ? 'badge-public' : 'badge-private']">
            {{ person.access }}
          </span>
        </div>
        <p v-if="person.designation" class="designation">{{ person.designation }}</p>
        <p class="meta">Added {{ formatDate(person.created_at) }}</p>
      </div>
      <div class="actions">
        <slot name="actions">
          <router-link v-if="canEdit" :to="`/person/${person.id}/edit`" class="btn-primary">
            Edit Person
          </router-link>
          <router-link :to="`/tree/${person.id}`" class="btn-secondary">
            View in Tree
          </router-link>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  person:  { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
})

const initials = computed(() => {
  if (!props.person?.name) return '?'
  return props.person.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.profile-header-card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-border);
  border-bottom: 3px solid var(--c-gold);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px var(--c-shadow);
}

.header-flex {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--c-fill-3);
  color: var(--c-primary-d);
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info { flex: 1; }

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

h1 { font-size: 28px; font-weight: 700; color: var(--c-text); }

.badge {
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}
.badge-public  { background: var(--c-badge-green-bg); color: var(--c-badge-green-text); }
.badge-private { background: var(--c-badge-yellow-bg); color: var(--c-badge-yellow-text); }

.designation { font-size: 15px; color: var(--c-text-2); margin-bottom: 4px; }
.meta        { font-size: 12px; color: var(--c-text-3); }

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  background: var(--c-primary-d);
  color: var(--c-bg-2);
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
}
.btn-primary:hover { background: var(--c-primary-d); filter: brightness(0.9); }

.btn-secondary {
  display: inline-block;
  background: transparent;
  color: var(--c-text);
  border: 1px solid var(--c-sep-opaque);
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.btn-secondary:hover { background: var(--c-fill-3); }
</style>
