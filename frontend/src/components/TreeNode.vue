<template>
  <div
    class="tree-node"
    :class="{
      'root-node':     depth === 0,
      'selected-node': isSelected,
      'on-path-node':  isOnPath,
    }"
    :data-node-id="person.id"
    @click.stop="handleClick"
  >
    <!-- Section 1: Full name, no truncation -->
    <div class="node-header">
      <span class="node-dot"></span>
      <span class="node-label">{{ person.name }}</span>
    </div>

    <!-- Section 2: Action buttons, always visible, larger -->
    <div v-if="canManage || hasChildren || isLoading" class="node-actions-row">
      <template v-if="canManage">
        <button
          class="icon-btn add-btn"
          :title="t('treeMap.addTitle')"
          :aria-label="t('treeMap.addTitle')"
          @click.stop="$emit('add')"
        >+</button>
        <button
          class="icon-btn edit-btn"
          :title="t('treeMap.editTitle')"
          :aria-label="t('treeMap.editTitle')"
          @click.stop="$emit('edit')"
        >✎</button>
        <button
          class="icon-btn danger-btn"
          :title="t('treeMap.deleteTitle')"
          :aria-label="t('treeMap.deleteTitle')"
          @click.stop="$emit('delete')"
        >✕</button>
      </template>
      <button
        v-if="hasChildren || isLoading"
        class="icon-btn toggle-btn"
        :class="{ 'is-loading': isLoading }"
        :title="isCollapsed ? t('treeMap.expand') : t('treeMap.collapse')"
        :aria-label="isCollapsed ? t('treeMap.expand') : t('treeMap.collapse')"
        :aria-expanded="!isCollapsed"
        :disabled="isLoading"
        @click.stop="$emit('toggle')"
      >
        <span v-if="isLoading" class="node-spinner"></span>
        <template v-else>{{ isCollapsed ? '›' : '‹' }}</template>
      </button>
    </div>

    <!-- Section 3: Content -->
    <div
      v-if="person.designation"
      class="node-designation"
      :class="{ 'is-clamped': longDesig && !expandedDesig }"
      :title="person.designation"
    >{{ person.designation }}</div>
    <button
      v-if="longDesig"
      class="text-expand-btn"
      @click.stop="expandedDesig = !expandedDesig"
    >{{ expandedDesig ? t('common.showLess') : t('common.showMore') }}</button>

    <div v-if="canSeeNodeMeta" class="node-meta">
      <span>#{{ person.id }}</span>
      <div
        v-if="person.reference"
        class="node-description"
        :class="{ 'is-clamped': longMeta && !expandedMeta }"
        :title="person.reference"
      >{{ person.reference }}</div>
    </div>
    <button
      v-if="canSeeNodeMeta && longMeta"
      class="text-expand-btn"
      @click.stop="expandedMeta = !expandedMeta"
    >{{ expandedMeta ? t('common.showLess') : t('common.showMore') }}</button>

    <!-- Section 4: Access badge -->
    <span
      v-if="person.access"
      class="access-badge"
      :class="person.access === 'public' ? 'is-public' : 'is-private'"
    >
      {{ person.access === 'public' ? t('common.public') : t('common.private') }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  person:              { type: Object,  required: true },
  isSelected:          { type: Boolean, default: false },
  isOnPath:            { type: Boolean, default: false },
  isCollapsed:         { type: Boolean, default: false },
  isLoading:           { type: Boolean, default: false },
  hasChildren:         { type: Boolean, default: false },
  depth:               { type: Number,  default: 0 },
  canManage:           { type: Boolean, default: false },
  canSeeNodeMeta:      { type: Boolean, default: false },
  suppressClickUntil:  { type: Number,  default: 0 },
})

const emit = defineEmits(['click', 'toggle', 'add', 'edit', 'delete'])

const { t } = useI18n()

const CLAMP_THRESHOLD = 80

const expandedDesig = ref(false)
const expandedMeta  = ref(false)

const longDesig = computed(() => (props.person?.designation?.length ?? 0) > CLAMP_THRESHOLD)
const longMeta  = computed(() => (props.person?.reference?.length ?? 0) > CLAMP_THRESHOLD)

function handleClick() {
  if (Date.now() < props.suppressClickUntil) return
  emit('click')
}
</script>

<style scoped>
/* ── Text clamping ─────────────────────────────────────────────────────────── */
.is-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Reference block inside meta ───────────────────────────────────────────── */
.node-description {
  margin-top: 3px;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.35;
}

/* ── Show more / Show less button ──────────────────────────────────────────── */
.text-expand-btn {
  all: unset;
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #0284c7;
  cursor: pointer;
  line-height: 1;
  padding: 1px 0;
  opacity: 0.85;
  transition: opacity 0.12s ease;
}

.text-expand-btn:hover {
  opacity: 1;
  text-decoration: underline;
}

/* ── Loading spinner on toggle button ────────────────────────────────────── */
.toggle-btn.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

.node-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(30, 41, 59, 0.2);
  border-top-color: #1e293b;
  border-radius: 50%;
  animation: node-spin 0.6s linear infinite;
}

@keyframes node-spin {
  to { transform: rotate(360deg); }
}
</style>
