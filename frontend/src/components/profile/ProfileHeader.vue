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
  background: #fff;
  border: 1px solid #EAECEE;
  border-bottom: 3px solid #C9A96E;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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
  background: #EAECEE;
  color: #1A5276;
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
.meta        { font-size: 12px; color: #AEB6BF; }

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  background: #1A5276;
  color: #fff;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
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
  text-decoration: none;
  cursor: pointer;
}
.btn-secondary:hover { background: #EAECEE; }
</style>
