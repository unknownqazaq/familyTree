<template>
  <div ref="treeViewRef" class="tree-view card" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="tree-header">
      <div class="header-copy">
        <h3>{{ t('treeMap.title') }}</h3>
        <p>{{ t('treeMap.hint') }}</p>
      </div>
      <div class="header-controls">
        <button type="button" class="btn-secondary control-btn" @click="centerTree('smooth')">
          {{ t('treeMap.center') }}
        </button>
        <button type="button" class="btn-secondary control-btn" @click="toggleFullscreen">
          {{ isFullscreen ? t('treeMap.fullscreenExit') : t('treeMap.fullscreenEnter') }}
        </button>
        <span class="stats-pill">{{ t('treeMap.nodesCount', { count: persons.length }) }}</span>
      </div>
    </div>

    <div ref="viewportRef" class="tree-viewport" :class="{ 'is-dragging': gestures.isDragging.value }">
      <div ref="sceneRef" class="tree-scene" :style="sceneStyle">
        <svg class="tree-lines" :style="svgStyle" :viewBox="`0 0 ${sceneBounds.width} ${sceneBounds.height}`">
          <path
            v-for="edge in layoutEdges"
            :key="edge.id"
            :d="buildBezierPath(edge)"
            class="tree-edge"
          />
        </svg>
        <TransitionGroup name="node" tag="div" class="tree-nodes" :class="{ 'layout-settled': layoutSettled }">
          <TreeNode
            v-for="node in layoutNodes"
            :key="node.id"
            :ref="(el) => registerNodeEl(node.id, el)"
            :style="{
              position: 'absolute',
              left: node.x + 'px',
              top: node.y + 'px',
              width: (node.w || NODE_W) + 'px',
              maxWidth: (node.w || NODE_W) + 'px',
              minWidth: (node.w || NODE_W) + 'px',
              overflow: 'hidden',
              boxSizing: 'border-box',
              transition: layoutSettled
                ? 'left 280ms cubic-bezier(0.2, 0, 0, 1), top 280ms cubic-bezier(0.2, 0, 0, 1)'
                : 'none',
            }"
            :person="node.person"
            :isSelected="node.id === selectedNodeId"
            :isOnPath="props.pathNodeIds.has(node.id)"
            :isCollapsed="node.isCollapsed"
            :isLoading="treeStore.isNodeLoading(node.id)"
            :hasChildren="node.hasChildren"
            :depth="node.depth"
            :canManage="canManage"
            :canSeeNodeMeta="canSeeNodeMeta"
            :suppressClickUntil="gestures.suppressNodeClickUntil.value"
            @click="handleSelectNode(node.id)"
            @toggle="toggleNode(node.id)"
            @add="modal.openAddModal(node.id)"
            @edit="modal.openEditModal(node.id)"
            @delete="modal.openDeleteModal(node.id)"
          />
        </TransitionGroup>
      </div>
    </div>

    <div v-if="modalState" class="modal-backdrop" @click.self="closeModal()">
      <div class="modal-card">
        <h4 v-if="modalState === 'add'">{{ t('treeMap.addTitle') }}</h4>
        <h4 v-else-if="modalState === 'edit'">{{ t('treeMap.editTitle') }}</h4>
        <h4 v-else>{{ t('treeMap.deleteTitle') }}</h4>

        <form v-if="modalState === 'add' || modalState === 'edit'" class="modal-form" @submit.prevent="submitPersonForm">
          <div class="form-label">
            <label for="modal-name">{{ t('treeMap.nameLabel') }}</label>
            <input id="modal-name" name="name" v-model="formState.name" type="text" required />
          </div>

          <div class="form-label">
            <label for="modal-parent">{{ t('treeMap.parentLabel') }}</label>
            <select id="modal-parent" name="parent_id" v-model="formState.parent_id">
              <option value="">{{ t('treeMap.rootOption') }}</option>
              <option v-for="person in parentOptions" :key="person.id" :value="String(person.id)">
                {{ person.name }}
              </option>
            </select>
          </div>

          <div class="form-label">
            <label for="modal-designation">{{ t('treeMap.designationLabel') }}</label>
            <input id="modal-designation" name="designation" v-model="formState.designation" type="text" />
          </div>

          <div class="form-label">
            <label for="modal-reference">{{ t('treeMap.referenceLabel') }}</label>
            <textarea id="modal-reference" name="reference" v-model="formState.reference" rows="2"></textarea>
          </div>

          <div class="form-label">
            <label for="modal-history">{{ t('treeMap.historyLabel') }}</label>
            <textarea id="modal-history" name="history" v-model="formState.history" rows="4"></textarea>
          </div>

          <div class="form-label">
            <label for="modal-access">{{ t('treeMap.accessLabel') }}</label>
            <select id="modal-access" name="access" v-model="formState.access">
              <option value="private">{{ t('common.private') }}</option>
              <option value="public">{{ t('common.public') }}</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-primary" :disabled="mutationLoading">
              {{ mutationLoading ? t('common.saving') : (modalState === 'add' ? t('common.create') : t('common.update')) }}
            </button>
            <button type="button" class="btn-secondary" :disabled="mutationLoading" @click="closeModal()">
              {{ t('common.cancel') }}
            </button>
          </div>
        </form>

        <div v-else class="modal-delete">
          <p>{{ t('treeMap.deleteWarning', { name: activePerson?.name || '', children: activeChildrenCount }) }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-danger" :disabled="mutationLoading" @click="confirmDelete">
              {{ mutationLoading ? t('common.saving') : t('treeMap.confirmDelete') }}
            </button>
            <button type="button" class="btn-secondary" :disabled="mutationLoading" @click="closeModal()">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>

        <p v-if="mutationError" class="error-msg modal-error">{{ mutationError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useTreeStore } from '../stores/tree'
import { useTreeLayout, NODE_W, NODE_H } from '../composables/useTreeLayout.js'
import { useTreeViewModal } from '../composables/useTreeViewModal.js'
import {
  MOBILE_ZOOM_SCALE,
  TABLET_ZOOM_SCALE,
  useViewportGestures,
} from '../composables/useViewportGestures.js'
import {
  buildAncestorIds,
  buildChildrenByParentId,
  buildPersonById,
  buildRootIds,
  computeNextCollapsedState,
} from '../utils/treeUtils.js'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  persons: { type: Array, default: () => [] },
  pathNodeIds: { type: Set, default: () => new Set() },
})
const emit  = defineEmits(['node-click'])

const treeStore  = useTreeStore()
const authStore  = useAuthStore()
const { t, locale } = useI18n()

// ─── DOM refs ──────────────────────────────────────────────────────────────────
const treeViewRef = ref(null)
const viewportRef = ref(null)
const sceneRef    = ref(null)

// ─── Viewport / window state ───────────────────────────────────────────────────
const isFullscreen    = ref(false)
const windowWidth     = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

// ─── Tree navigation state ─────────────────────────────────────────────────────
const collapsedNodeIds = ref(new Set())
const selectedNodeId   = ref(null)
const knownNodeIds     = ref(new Set())
const autoCentered     = ref(false)
const panTransitioning = ref(false)
let   panTransitionTimeout = null

// ─── Node size tracking (ResizeObserver → layout engine) ─────────────────────
// Maps node id (string) → measured outer size { width, height }
const nodeSizeMap = ref(new Map())
const nodeElMap   = new Map()   // id → DOM Element (plain, non-reactive)
let   nodeRO      = null        // single shared ResizeObserver
let   roRafId     = null        // rAF handle for debounced batch update

function _flushNodeSizes(pending) {
  const next = new Map(nodeSizeMap.value)
  let changed = false
  for (const [id, size] of pending) {
    const prev = next.get(id)
    if (!prev || prev.width !== size.width || prev.height !== size.height) {
      next.set(id, size)
      changed = true
    }
  }
  if (changed) nodeSizeMap.value = next
}

function registerNodeEl(id, el) {
  // In Vue 3 <script setup>, template ref on a component → component instance;
  // the root DOM element is accessible via instance.$el
  const dom = el?.$el instanceof Element ? el.$el : (el instanceof Element ? el : null)
  if (dom) {
    const prev = nodeElMap.get(id)
    if (prev !== dom) {
      if (prev) nodeRO?.unobserve(prev)
      nodeElMap.set(id, dom)
      nodeRO?.observe(dom)
      const rect = dom.getBoundingClientRect()
      _flushNodeSizes(new Map([[String(id), {
        width: Math.max(Math.round(rect.width), NODE_W),
        height: Math.max(Math.round(rect.height), NODE_H),
      }]]))
    }
  } else {
    const prev = nodeElMap.get(id)
    if (prev) { nodeRO?.unobserve(prev); nodeElMap.delete(id) }
    const next = new Map(nodeSizeMap.value)
    if (next.delete(id)) nodeSizeMap.value = next
  }
}

// ─── Layout (d3-hierarchy based) ───────────────────────────────────────────────
const layout = useTreeLayout(computed(() => props.persons), collapsedNodeIds, nodeSizeMap)
const { layoutNodes, layoutEdges, sceneBounds, personById, childrenByParentId, rootIds } = layout

// ─── Gestures (CSS transform pan + zoom) ──────────────────────────────────────
const gestures = useViewportGestures({
  viewportRef,
  isInteractionEnabled: () => Boolean(viewportRef.value) && props.persons.length > 0,
})

// ─── Permissions ──────────────────────────────────────────────────────────────
const canManage      = computed(() => Boolean(authStore.isAuthenticated))
const canSeeNodeMeta = computed(() => Boolean(authStore.isAdmin))

// ─── Modal ─────────────────────────────────────────────────────────────────────
const modal = useTreeViewModal({
  authStore,
  treeStore,
  t,
  persons:            computed(() => props.persons),
  personById,
  childrenByParentId,
  selectedNodeId,
  emit,
  expandToNode,
})
const { modalState, formState, parentOptions, activePerson, activeChildrenCount,
        mutationLoading, mutationError, closeModal, submitPersonForm, confirmDelete } = modal

// ─── Scene styles ─────────────────────────────────────────────────────────────
const sceneStyle = computed(() => ({
  width:     `${sceneBounds.value.width}px`,
  height:    `${sceneBounds.value.height}px`,
  transform: `translate(${gestures.panX.value}px, ${gestures.panY.value}px) scale(${gestures.zoomScale.value})`,
  transition: panTransitioning.value ? 'transform 0.42s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
}))

const svgStyle = computed(() => ({
  position:      'absolute',
  inset:         '0',
  width:         '100%',
  height:        '100%',
  pointerEvents: 'none',
  overflow:      'visible',
}))

// ─── Bezier edge path builder ──────────────────────────────────────────────────
function buildBezierPath(edge) {
  const midX = (edge.x1 + edge.x2) / 2
  return `M ${edge.x1} ${edge.y1} C ${midX} ${edge.y1}, ${midX} ${edge.y2}, ${edge.x2} ${edge.y2}`
}

// ─── Focus / center helpers ────────────────────────────────────────────────────
function focusNode(nodeId, behavior = 'smooth') {
  const node = layoutNodes.value.find((n) => n.id === nodeId)
  if (!node || !viewportRef.value) return
  const vp         = viewportRef.value
  const targetPanX = vp.clientWidth  / 2 - (node.x + NODE_W / 2) * gestures.zoomScale.value
  const targetPanY = vp.clientHeight / 2 - (node.y + (node.h || NODE_H) / 2) * gestures.zoomScale.value

  if (behavior === 'smooth') {
    panTransitioning.value = true
    clearTimeout(panTransitionTimeout)
    panTransitionTimeout = setTimeout(() => { panTransitioning.value = false }, 450)
  }
  gestures.panX.value = targetPanX
  gestures.panY.value = targetPanY
}

function centerTree(behavior = 'smooth') {
  const targetId =
    selectedNodeId.value != null && personById.value.has(selectedNodeId.value)
      ? selectedNodeId.value
      : rootIds.value[0]
  if (targetId != null) focusNode(targetId, behavior)
}

// ─── Toggle collapse (with lazy-load) ────────────────────────────────────────
async function toggleNode(nodeId) {
  const isCollapsed = collapsedNodeIds.value.has(nodeId)
  if (isCollapsed) {
    // Expanding — lazy-fetch children if not already loaded
    await treeStore.fetchNodeChildren(nodeId)
    const next = new Set(collapsedNodeIds.value)
    next.delete(nodeId)
    collapsedNodeIds.value = next
  } else {
    // Collapsing
    const next = new Set(collapsedNodeIds.value)
    next.add(nodeId)
    collapsedNodeIds.value = next
  }
}

// ─── Node selection ───────────────────────────────────────────────────────────
function handleSelectNode(nodeId) {
  selectedNodeId.value = nodeId
  emit('node-click', nodeId)
  focusNode(nodeId, 'smooth')
}

// ─── Expand ancestors + focus (used by search) ────────────────────────────────
async function expandToNode(nodeId) {
  // Un-collapse all ancestors so the node becomes visible
  const ancestors = buildAncestorIds(nodeId, personById.value)
  if (ancestors.size > 0) {
    const next = new Set(collapsedNodeIds.value)
    ancestors.forEach((id) => next.delete(id))
    collapsedNodeIds.value = next
  }
  await nextTick()
  selectedNodeId.value = nodeId
  emit('node-click', nodeId)
  focusNode(nodeId, 'smooth')
}

// ─── syncCollapsedState ───────────────────────────────────────────────────────
function syncCollapsedState() {
  const { nextCollapsed, nextKnown } = computeNextCollapsedState(
    props.persons,
    childrenByParentId.value,
    rootIds.value,
    collapsedNodeIds.value,
    knownNodeIds.value,
  )
  collapsedNodeIds.value = nextCollapsed
  knownNodeIds.value     = nextKnown
}

// ─── Fullscreen ───────────────────────────────────────────────────────────────
function syncFullscreenState() {
  isFullscreen.value = Boolean(document.fullscreenElement && document.fullscreenElement === treeViewRef.value)
}

async function toggleFullscreen() {
  if (!treeViewRef.value) return
  try {
    if (document.fullscreenElement === treeViewRef.value) await document.exitFullscreen()
    else await treeViewRef.value.requestFullscreen()
  } catch { /* ignore browser-level fullscreen errors */ }
}

function handleFullscreenChange() {
  syncFullscreenState()
  nextTick(() => {
    const targetId =
      selectedNodeId.value != null && personById.value.has(selectedNodeId.value)
        ? selectedNodeId.value : rootIds.value[0]
    if (targetId != null) focusNode(targetId, 'auto')
  })
}

function handleWindowResize() {
  windowWidth.value = window.innerWidth
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(
  () => props.persons,
  () => {
    syncCollapsedState()
    if (selectedNodeId.value != null && !personById.value.has(selectedNodeId.value)) {
      selectedNodeId.value = null
    }
    modal.closeIfStaleNode(personById.value)
  },
  { deep: true },
)

// Auto-center once on first layout; mark layout as settled for transitions
const layoutSettled = ref(false)
watch(
  layoutNodes,
  (nodes) => {
    if (!autoCentered.value && nodes.length > 0) {
      nextTick(() => {
        centerTree('auto')
        autoCentered.value = true
        // Delay enabling position transitions so initial placement never animates
        setTimeout(() => { layoutSettled.value = true }, 120)
      })
    }
  },
  { immediate: true },
)

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value <= 640)      gestures.zoomScale.value = MOBILE_ZOOM_SCALE
  else if (windowWidth.value <= 980) gestures.zoomScale.value = TABLET_ZOOM_SCALE

  // ── ResizeObserver: feed actual node heights back into the layout engine ────
  nodeRO = new ResizeObserver((entries) => {
    const pending = new Map()
    for (const entry of entries) {
      for (const [id, dom] of nodeElMap) {
        if (dom !== entry.target) continue
        const rect = dom.getBoundingClientRect()
        pending.set(String(id), {
          width: Math.max(Math.round(rect.width), NODE_W),
          height: Math.max(Math.round(rect.height), NODE_H),
        })
        break
      }
    }
    if (pending.size === 0) return
    if (roRafId) cancelAnimationFrame(roRafId)
    roRafId = requestAnimationFrame(() => { _flushNodeSizes(pending); roRafId = null })
  })

  if (viewportRef.value) {
    const vp = viewportRef.value
    vp.addEventListener('wheel',       gestures.handleViewportWheel,     { passive: false })
    vp.addEventListener('mousedown',   gestures.handleViewportMouseDown)
    vp.addEventListener('touchstart',  gestures.handleViewportTouchStart, { passive: false })
    vp.addEventListener('touchmove',   gestures.handleViewportTouchMove,  { passive: false })
    vp.addEventListener('touchend',    gestures.handleViewportTouchEnd,   { passive: false })
    vp.addEventListener('touchcancel', gestures.handleViewportTouchEnd,   { passive: false })
  }

  window.addEventListener('resize',    handleWindowResize)
  window.addEventListener('mousemove', gestures.handleWindowMouseMove)
  window.addEventListener('mouseup',   gestures.handleWindowMouseUp)
  window.addEventListener('blur',      gestures.handleWindowMouseUp)
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  syncFullscreenState()
})

onUnmounted(() => {
  if (viewportRef.value) {
    const vp = viewportRef.value
    vp.removeEventListener('wheel',       gestures.handleViewportWheel)
    vp.removeEventListener('mousedown',   gestures.handleViewportMouseDown)
    vp.removeEventListener('touchstart',  gestures.handleViewportTouchStart)
    vp.removeEventListener('touchmove',   gestures.handleViewportTouchMove)
    vp.removeEventListener('touchend',    gestures.handleViewportTouchEnd)
    vp.removeEventListener('touchcancel', gestures.handleViewportTouchEnd)
  }
  window.removeEventListener('resize',    handleWindowResize)
  window.removeEventListener('mousemove', gestures.handleWindowMouseMove)
  window.removeEventListener('mouseup',   gestures.handleWindowMouseUp)
  window.removeEventListener('blur',      gestures.handleWindowMouseUp)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  gestures.stopViewportDrag()
  gestures.stopTouchGesture()
  if (roRafId) cancelAnimationFrame(roRafId)
  nodeRO?.disconnect()
  nodeRO = null
  nodeElMap.clear()
  clearTimeout(panTransitionTimeout)
})

// ─── Public API (called from TreePage / search) ────────────────────────────────
defineExpose({ focusNode, expandToNode, selectNode: handleSelectNode })
</script>

<style>
.tree-view {
  --bg: #eef4ff;
  --panel: rgba(255, 255, 255, 0.78);
  --panel2: rgba(255, 255, 255, 0.92);
  --border: rgba(148, 163, 184, 0.35);
  --text: #0f172a;
  --muted: #64748b;
  --shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
  --radius: 18px;
  --gap-x: 34px;
  --gap-y: 16px;
  --node-width: 220px;
  --line-color: rgba(100, 116, 139, 0.34);
  --accent: #38bdf8;
  --accent2: #818cf8;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 18px 18px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background:
    radial-gradient(1000px 500px at 15% 5%, rgba(125, 211, 252, 0.24), transparent 58%),
    radial-gradient(820px 420px at 78% 20%, rgba(129, 140, 248, 0.2), transparent 62%),
    linear-gradient(175deg, var(--panel), rgba(241, 245, 249, 0.84));
  color: var(--text);
  backdrop-filter: blur(8px);
}

.tree-view:fullscreen {
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  border-radius: 0;
  padding: 14px;
}

.tree-view.is-fullscreen {
  width: 100%;
  height: 100%;
  max-width: none;
  border-radius: 0;
}

.tree-view:fullscreen .tree-viewport {
  height: calc(100vh - 120px);
  border-radius: 14px;
}

.tree-view.is-fullscreen .tree-viewport {
  height: calc(100vh - 120px);
}

.tree-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 6px 12px;
}

.header-copy h3 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0.2px;
  color: var(--text);
}

.header-copy p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.35;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-controls .control-btn {
  border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--panel2), rgba(255, 255, 255, 0.62));
  color: var(--text);
  border-radius: 14px;
  min-height: 38px;
  padding: 10px 12px;
  box-shadow: none;
  font-size: 13px;
  font-weight: 600;
}

.header-controls .control-btn:hover {
  border-color: rgba(100, 116, 139, 0.45);
}

.header-controls .control-btn:active {
  transform: translateY(0);
}

.stats-pill {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  border: 1px dashed rgba(100, 116, 139, 0.4);
  background: rgba(255, 255, 255, 0.66);
  padding: 8px 10px;
  border-radius: 999px;
}

.tree-viewport {
  position: relative;
  height: 560px;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  border-radius: 16px;
  border: 1px solid var(--border);
  background:
    radial-gradient(860px 400px at 10% 10%, rgba(255, 255, 255, 0.75), transparent 60%),
    radial-gradient(700px 350px at 80% 30%, rgba(226, 232, 240, 0.65), transparent 65%),
    rgba(241, 245, 249, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.66);
}

.tree-viewport.is-dragging {
  cursor: grabbing;
}

.tree-viewport.is-dragging * {
  cursor: grabbing !important;
}

.tree-scene {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.tree-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.tree-edge {
  fill: none;
  stroke: var(--line-color);
  stroke-width: 2;
}

.tree-nodes {
  position: absolute;
  inset: 0;
  overflow: visible;
}

/* ── Node enter/leave transitions (TransitionGroup name="node") ─────────────── */
.node-enter-active,
.node-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.node-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(6px);
}

.node-leave-to {
  opacity: 0;
  transform: scale(0.88) translateY(6px);
}

/* ── Selected node pulse ──────────────────────────────────────────────────── */
@keyframes node-pulse {
  0%, 100% { outline-color: rgba(56, 189, 248, 0.45); }
  50%       { outline-color: rgba(56, 189, 248, 0.85); }
}

.selected-node {
  outline: 2px solid rgba(56, 189, 248, 0.45);
  outline-offset: 2px;
  animation: node-pulse 2s ease infinite;
}

.tree-node {
  /* Width is enforced via inline :style from NODE_W constant — CSS below is a
     safety net so the card never expands beyond its layout slot. */
  width: 220px !important;
  max-width: 220px !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.42);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.93), rgba(241, 245, 249, 0.86));
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.14);
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
}

.tree-node:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16);
  border-color: rgba(99, 102, 241, 0.35);
}

/* Positions snap immediately so re-layout never creates a visible overlap window.
   Only hover-lift (transform) and shadow get a visual transition. */
.layout-settled .tree-node {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.root-node {
  border-color: rgba(129, 140, 248, 0.45);
}

.node-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.label-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  flex: 1 1 auto;
}

.node-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
  background: radial-gradient(circle at 30% 30%, var(--accent), rgba(56, 189, 248, 0.24));
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.16);
}

.root-node .node-dot {
  background: radial-gradient(circle at 30% 30%, var(--accent2), rgba(129, 140, 248, 0.24));
  box-shadow: 0 0 0 5px rgba(129, 140, 248, 0.14);
}

.node-label {
  font-size: 13px;
  font-weight: 650;
  color: var(--text);
  line-height: 1.25;
  /* Allow up to 2 lines so the full name is always visible */
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-width: 0;
  flex: 1 1 auto;
}

.node-actions-wrap {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  flex-shrink: 0;
  align-self: flex-start;
}

.node-actions-hover {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.tree-node:hover .node-actions-hover {
  opacity: 1;
  pointer-events: all;
}

/* ── Path highlighting ──────────────────────────────────────────────── */
.on-path-node {
  outline: 2.5px solid #f59e0b;
  outline-offset: 2px;
  animation: path-glow 1.8s ease infinite;
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25), 0 10px 26px rgba(15, 23, 42, 0.14);
}

@keyframes path-glow {
  0%, 100% { outline-color: rgba(245, 158, 11, 0.5); }
  50%       { outline-color: rgba(245, 158, 11, 0.9); }
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.75);
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s ease, border-color 0.12s ease, background-color 0.12s ease;
  user-select: none;
}

.icon-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.42);
  background: rgba(255, 255, 255, 0.96);
}

.icon-btn:active {
  transform: translateY(0);
}

.add-btn {
  color: #0284c7;
}

.edit-btn {
  color: #4f46e5;
}

.danger-btn {
  color: #dc2626;
}

.toggle-btn {
  color: #1e293b;
  font-size: 12px;
}

.node-designation {
  color: #556277;
  font-size: 12px;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
}

.node-meta {
  margin-top: 2px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
}

.access-badge {
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 3px 8px;
}

.access-badge.is-public {
  background: #dcfce7;
  color: #166534;
}

.access-badge.is-private {
  background: #fef3c7;
  color: #92400e;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(560px, 100%);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #fff;
  box-shadow: 0 24px 42px rgba(15, 23, 42, 0.2);
  padding: 18px;
}

.modal-card h4 {
  margin: 0 0 12px;
  color: #0f172a;
}

.modal-form {
  display: grid;
  gap: 12px;
}

.form-label {
  display: grid;
  gap: 6px;
}

.form-label label {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.modal-delete p {
  color: #334155;
  margin-bottom: 14px;
}

.modal-error {
  margin-top: 10px;
}

@media (max-width: 1080px) {
  .tree-view {
    --gap-x: 28px;
    --gap-y: 14px;
    --node-width: 210px;
    padding: 16px 14px 12px;
  }

  .tree-viewport {
    height: 520px;
  }
}

@media (max-width: 880px) {
  .tree-view {
    --gap-x: 22px;
    --gap-y: 12px;
    --node-width: 196px;
    border-radius: 16px;
    padding: 14px 12px 10px;
  }

  .tree-header {
    flex-direction: column;
    gap: 10px;
    padding: 4px 4px 10px;
  }

  .header-copy p {
    font-size: 12.5px;
  }

  .header-controls {
    width: 100%;
    gap: 8px;
  }

  .header-controls .control-btn,
  .stats-pill {
    width: 100%;
    justify-content: center;
  }

  .tree-viewport {
    height: 460px;
    border-radius: 14px;
  }

  .tree-node {
    border-radius: 14px;
    padding: 10px 10px 8px;
    /* mobile breakpoint — keep width in sync with NODE_W responsive override */
  }

  .icon-btn {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 640px) {
  .tree-view {
    --gap-x: 16px;
    --gap-y: 10px;
    --node-width: 176px;
    border-radius: 14px;
    padding: 12px 10px 8px;
  }

  .header-copy h3 {
    font-size: 16px;
  }

  .header-copy p {
    font-size: 12px;
    line-height: 1.3;
  }

  .tree-viewport {
    height: 400px;
  }

  .node-label {
    font-size: 12px;
  }

  .node-designation,
  .node-meta {
    font-size: 11px;
  }

  .icon-btn {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    font-size: 12px;
  }

  .access-badge {
    font-size: 10px;
    padding: 2px 7px;
  }

  .modal-card {
    width: 100%;
    max-height: calc(100vh - 24px);
    border-radius: 12px;
    padding: 14px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .tree-viewport {
    height: 340px;
  }

  .header-controls .control-btn {
    min-height: 34px;
    padding: 8px 10px;
    font-size: 12px;
  }

  .stats-pill {
    font-size: 11px;
    padding: 7px 9px;
  }
}
</style>
