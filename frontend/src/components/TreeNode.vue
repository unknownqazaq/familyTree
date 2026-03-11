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
    <!-- Avatar + name -->
    <div class="node-header">
      <span class="node-avatar" :style="{ background: avatarBg }">{{ avatarLetter }}</span>
      <span class="node-label">{{ person.name }}</span>
    </div>

    <!-- Action row -->
    <div v-if="canManage || hasChildren || isLoading" class="node-actions-row">
      <template v-if="canManage">
        <button class="icon-btn add-btn"    :title="t('treeMap.addTitle')"    @click.stop="$emit('add')">+</button>
        <button class="icon-btn edit-btn"   :title="t('treeMap.editTitle')"   @click.stop="$emit('edit')">✎</button>
        <button class="icon-btn danger-btn" :title="t('treeMap.deleteTitle')" @click.stop="$emit('delete')">✕</button>
      </template>
      <button
        v-if="hasChildren || isLoading"
        class="icon-btn toggle-btn"
        :class="{ 'is-loading': isLoading }"
        :title="isCollapsed ? t('treeMap.expand') : t('treeMap.collapse')"
        :aria-expanded="!isCollapsed"
        :disabled="isLoading"
        @click.stop="$emit('toggle')"
      >
        <span v-if="isLoading" class="node-spinner"></span>
        <template v-else>{{ isCollapsed ? '›' : '‹' }}</template>
      </button>
    </div>

    <!-- Designation -->
    <div
      v-if="person.designation"
      class="node-designation"
      :class="{ 'is-clamped': longDesig && !expandedDesig }"
      :title="person.designation"
    >{{ person.designation }}</div>
    <button v-if="longDesig" class="text-expand-btn" @click.stop="expandedDesig = !expandedDesig">
      {{ expandedDesig ? t('common.showLess') : t('common.showMore') }}
    </button>

    <!-- Meta -->
    <div v-if="canSeeNodeMeta" class="node-meta">
      <span>#{{ person.id }}</span>
      <div
        v-if="person.reference"
        class="node-description"
        :class="{ 'is-clamped': longMeta && !expandedMeta }"
        :title="person.reference"
      >{{ person.reference }}</div>
    </div>
    <button v-if="canSeeNodeMeta && longMeta" class="text-expand-btn" @click.stop="expandedMeta = !expandedMeta">
      {{ expandedMeta ? t('common.showLess') : t('common.showMore') }}
    </button>

    <!-- Access badge -->
    <span
      v-if="person.access"
      class="access-badge"
      :class="person.access === 'public' ? 'is-public' : 'is-private'"
    >{{ person.access === 'public' ? t('common.public') : t('common.private') }}</span>
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

const avatarLetter = computed(() => (props.person?.name || '?').charAt(0).toUpperCase())

// Deterministic color from person id — spread across hue circle
const avatarBg = computed(() => {
  const id  = props.person?.id ?? 0
  const hue = (id * 137.508) % 360
  return `hsl(${hue}, 60%, 52%)`
})

function handleClick() {
  if (Date.now() < props.suppressClickUntil) return
  emit('click')
}
</script>

<style scoped>
/* ── Avatar ──────────────────────────────────────────────────────────────── */
.node-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

/* ── Text clamping ───────────────────────────────────────────────────────── */
.is-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Description ─────────────────────────────────────────────────────────── */
.node-description {
  margin-top: 3px;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.35;
}

/* ── Show more ───────────────────────────────────────────────────────────── */
.text-expand-btn {
  all: unset;
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  color: var(--c-primary, #0a84ff);
  cursor: pointer;
  padding: 1px 0;
  opacity: 0.85;
  transition: opacity 0.1s;
}
.text-expand-btn:hover { opacity: 1; text-decoration: underline; }

/* ── Spinner ─────────────────────────────────────────────────────────────── */
.toggle-btn.is-loading { pointer-events: none; opacity: 0.6; }

.node-spinner {
  display: inline-block;
  width: 11px;
  height: 11px;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-top-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: node-spin 0.65s linear infinite;
}

@keyframes node-spin { to { transform: rotate(360deg); } }
</style>
