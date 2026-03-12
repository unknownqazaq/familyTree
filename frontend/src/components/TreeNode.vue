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
    <!-- Depth accent strip -->
    <div class="node-accent" :style="{ background: accentGradient }"></div>

    <div class="node-body">
      <!-- Avatar + name row -->
      <div class="node-header">
        <div class="avatar-wrap">
          <span class="node-avatar" :style="{ background: avatarBg }">{{ avatarLetter }}</span>
        </div>
        <div class="node-info">
          <span class="node-label">{{ person.name }}</span>
          <span v-if="person.designation" class="node-designation" :title="person.designation">
            {{ person.designation }}
          </span>
        </div>
      </div>

      <!-- Expandable designation (only if long) -->
      <div
        v-if="person.designation && longDesig"
        class="node-designation-full"
        :class="{ 'is-clamped': !expandedDesig }"
        :title="person.designation"
      >{{ person.designation }}</div>
      <button v-if="longDesig" class="text-expand-btn" @click.stop="expandedDesig = !expandedDesig">
        {{ expandedDesig ? t('common.showLess') : t('common.showMore') }}
      </button>

      <!-- Meta (admin) -->
      <div v-if="canSeeNodeMeta" class="node-meta">
        <span class="meta-id">#{{ person.id }}</span>
        <div
          v-if="person.reference"
          class="node-reference"
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

    <!-- Floating action bar — revealed on hover -->
    <Transition name="actions">
      <div v-if="canManage || hasChildren || isLoading" class="node-actions-bar">
        <template v-if="canManage">
          <button class="act-btn act-add" :title="t('treeMap.addTitle')" @click.stop="$emit('add')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="act-btn act-edit" :title="t('treeMap.editTitle')" @click.stop="$emit('edit')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button class="act-btn act-delete" :title="t('treeMap.deleteTitle')" @click.stop="$emit('delete')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </template>
        <button
          v-if="hasChildren || isLoading"
          class="act-btn act-toggle"
          :class="{ 'is-loading': isLoading }"
          :title="isCollapsed ? t('treeMap.expand') : t('treeMap.collapse')"
          :aria-expanded="!isCollapsed"
          :disabled="isLoading"
          @click.stop="$emit('toggle')"
        >
          <span v-if="isLoading" class="node-spinner"></span>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline v-if="isCollapsed" points="9 6 15 12 9 18"/>
            <polyline v-else points="15 6 9 12 15 18"/>
          </svg>
        </button>
      </div>
    </Transition>
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

const avatarBg = computed(() => {
  const id  = props.person?.id ?? 0
  const hue = (id * 137.508) % 360
  return `hsl(${hue}, 55%, 48%)`
})

const accentGradient = computed(() => {
  const id  = props.person?.id ?? 0
  const hue = (id * 137.508) % 360
  return `linear-gradient(to bottom, hsl(${hue}, 60%, 52%), hsl(${(hue + 30) % 360}, 50%, 40%))`
})

function handleClick() {
  if (Date.now() < props.suppressClickUntil) return
  emit('click')
}
</script>

<style scoped>
/* ── Accent strip (left edge, depth indicator) ──────────────────────────── */
.node-accent {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.tree-node:hover .node-accent {
  opacity: 1;
}

/* ── Body container ─────────────────────────────────────────────────────── */
.node-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
}

/* ── Header: avatar + info ──────────────────────────────────────────────── */
.node-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-wrap {
  flex-shrink: 0;
  position: relative;
}

.node-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.node-info {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-label {
  font-size: 14px;
  font-weight: 650;
  color: var(--text, #ffffff);
  line-height: 1.2;
  word-break: normal;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
}

.node-designation {
  font-size: 11px;
  color: var(--muted, rgba(235, 235, 245, 0.55));
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Full designation (expandable) ──────────────────────────────────────── */
.node-designation-full {
  font-size: 11.5px;
  color: var(--muted, rgba(235, 235, 245, 0.55));
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
}

/* ── Text clamping ──────────────────────────────────────────────────────── */
.is-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Show more ──────────────────────────────────────────────────────────── */
.text-expand-btn {
  all: unset;
  display: inline-block;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--accent, #0a84ff);
  cursor: pointer;
  padding: 1px 0;
  opacity: 0.8;
  transition: opacity 0.15s;
  letter-spacing: 0.01em;
}
.text-expand-btn:hover { opacity: 1; }

/* ── Meta (admin) ───────────────────────────────────────────────────────── */
.node-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 4px;
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.06));
}

.meta-id {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted, rgba(235, 235, 245, 0.4));
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
}

.node-reference {
  font-size: 11px;
  color: var(--muted, rgba(235, 235, 245, 0.45));
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
}

/* ── Access badge ───────────────────────────────────────────────────────── */
.access-badge {
  width: fit-content;
  font-size: 10px;
  font-weight: 700;
  border-radius: 6px;
  padding: 2px 7px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.access-badge.is-public {
  background: rgba(50, 215, 75, 0.12);
  color: #32d74b;
}

.access-badge.is-private {
  background: rgba(255, 159, 10, 0.12);
  color: #ff9f0a;
}

/* ── Action bar (hover reveal) ──────────────────────────────────────────── */
.node-actions-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--panel2, rgba(44, 44, 46, 0.95));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border, rgba(255, 255, 255, 0.06));
  border-radius: 0 0 13px 13px;
  z-index: 5;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform: translateY(4px);
}

.tree-node:hover .node-actions-bar {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.act-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.12s, border-color 0.12s, transform 0.1s;
}

.act-btn svg {
  stroke: var(--muted, rgba(235, 235, 245, 0.55));
  transition: stroke 0.12s;
}

.act-btn:hover {
  background: var(--panel, rgba(28, 28, 30, 0.80));
  border-color: rgba(255, 255, 255, 0.12);
}

.act-btn:hover svg {
  stroke: var(--text, #ffffff);
}

.act-btn:active {
  transform: scale(0.9);
}

.act-add:hover svg    { stroke: #0a84ff; }
.act-delete:hover svg { stroke: #ff453a; }
.act-toggle:hover svg { stroke: var(--accent, #0a84ff); }

/* ── Loading toggle state ───────────────────────────────────────────────── */
.act-toggle.is-loading { pointer-events: none; opacity: 0.5; }

/* ── Spinner ────────────────────────────────────────────────────────────── */
.node-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: node-spin 0.65s linear infinite;
}

@keyframes node-spin { to { transform: rotate(360deg); } }

/* ── Action bar transition ──────────────────────────────────────────────── */
.actions-enter-active,
.actions-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.actions-enter-from,
.actions-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
