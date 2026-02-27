<template>
  <transition name="slide">
    <div v-if="person" class="side-panel">
      <div class="panel-header">
        <div class="header-avatar">{{ initials }}</div>
        <div class="header-info">
          <h3 class="header-name">{{ person.name }}</h3>
          <span :class="['badge', person.access === 'public' ? 'badge-public' : 'badge-private']">
            {{ person.access }}
          </span>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="panel-body">
        <div v-if="person.designation" class="detail-field">
          <span class="field-label">DESIGNATION</span>
          <p class="field-value">{{ person.designation }}</p>
        </div>

        <div v-if="person.reference" class="detail-field">
          <span class="field-label">REFERENCE</span>
          <p class="field-value">{{ person.reference }}</p>
        </div>

        <div v-if="person.history" class="detail-field">
          <span class="field-label">HISTORY</span>
          <p class="field-value history-text">{{ person.history }}</p>
        </div>

        <div v-if="person.parent_name" class="detail-field">
          <span class="field-label">PARENT</span>
          <div class="relation-chip" @click="emit('navigate-to', person.parent_id)">
            {{ person.parent_name }}
            <span class="chip-arrow">→</span>
          </div>
        </div>
      </div>

      <div class="panel-actions">
        <button class="btn-primary" @click="emit('view-profile', person.id)">
          View Full Profile
        </button>
        <div class="secondary-actions">
          <button class="btn-secondary" @click="emit('edit-person', person.id)">Edit</button>
          <button class="btn-secondary" @click="emit('view-subtree', person.id)">Subtree</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  person: { type: Object, default: null },
})

const emit = defineEmits(['close', 'view-profile', 'edit-person', 'navigate-to', 'view-subtree'])

const initials = computed(() => {
  if (!props.person?.name) return '?'
  return props.person.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})
</script>

<style scoped>
.side-panel {
  width: 360px;
  flex-shrink: 0;
  background: #fff;
  border-left: 1px solid #EAECEE;
  box-shadow: -2px 0 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #EAECEE;
  position: sticky;
  top: 0;
  background: #fff;
}

.header-avatar {
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

.header-info { flex: 1; }
.header-name { font-size: 16px; font-weight: 600; color: #1C2833; margin-bottom: 4px; }

.close-btn {
  background: none;
  border: none;
  color: #AEB6BF;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
}
.close-btn:hover { background: #EAECEE; color: #5D6D7E; }

.badge {
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}
.badge-public  { background: #D5F5E3; color: #1E8449; }
.badge-private { background: #FEF9E7; color: #B7950B; }

.panel-body {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5D6D7E;
  margin-bottom: 6px;
}

.field-value { font-size: 14px; color: #2C3E50; line-height: 1.6; }

.history-text {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.relation-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #F4F6F7;
  border: 1px solid #EAECEE;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  color: #1C2833;
  cursor: pointer;
  transition: all 0.15s;
}
.relation-chip:hover { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-color: #D5D8DC; }
.chip-arrow { color: #AEB6BF; }

.panel-actions {
  padding: 16px 24px;
  border-top: 1px solid #EAECEE;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-primary {
  width: 100%;
  background: #1A5276;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover { background: #154360; }

.secondary-actions { display: flex; gap: 8px; }

.btn-secondary {
  flex: 1;
  background: transparent;
  color: #2C3E50;
  border: 1px solid #D5D8DC;
  border-radius: 4px;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.btn-secondary:hover { background: #EAECEE; }

.slide-enter-active, .slide-leave-active { transition: transform 0.2s ease-out; }
.slide-enter-from { transform: translateX(100%); }
.slide-leave-to   { transform: translateX(100%); }
</style>
