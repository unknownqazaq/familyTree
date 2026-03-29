<template>
  <div ref="treeViewRef" class="tree-view card" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="tree-header">
      <h2 class="header-title">{{ t('treeMap.title') }}</h2>
      <span class="stats-pill" aria-live="polite" aria-atomic="true">{{ persons.length }}</span>
      <span class="header-spacer"></span>
      <div class="header-actions">
        <button type="button" class="hdr-btn" :title="t('treeMap.hint')" @click="centerTree('smooth')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
          <span class="hdr-btn-label">{{ t('treeMap.center') }}</span>
        </button>
        <button type="button" class="hdr-btn" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6m10-10h-6V4M4 10h6V4m10 10h-6v6"/></svg>
          <span class="hdr-btn-label">{{ isFullscreen ? t('treeMap.fullscreenExit') : t('treeMap.fullscreenEnter') }}</span>
        </button>
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
      <ZoomControls
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @fit="fitToScreen"
        @reset="resetView"
      />
      <TreeMinimap
        :nodes="layoutNodes"
        :sceneWidth="sceneBounds.width"
        :sceneHeight="sceneBounds.height"
        :viewportWidth="viewportWidth"
        :viewportHeight="viewportHeight"
        :panX="gestures.panX.value"
        :panY="gestures.panY.value"
        :zoomScale="gestures.zoomScale.value"
        :nodeW="NODE_W"
        :nodeH="NODE_H"
        @navigate="handleMinimapNavigate"
      />
    </div>

    <div v-if="modalState" class="modal-backdrop" @click.self="closeModal()">
      <div class="modal-card">
        <h4 v-if="modalState === 'add'">{{ t('treeMap.addTitle') }}</h4>
        <h4 v-else-if="modalState === 'edit'">{{ t('treeMap.editTitle') }}</h4>
        <h4 v-else>{{ t('treeMap.deleteTitle') }}</h4>

        <form v-if="modalState === 'add' || modalState === 'edit'" class="modal-form" @submit.prevent="submitPersonForm">
          <div v-if="modalState === 'add'" class="existing-children-section">
            <p class="existing-children-label">{{ t('treeMap.existingChildrenLabel') }}</p>
            <span v-if="existingAddChildrenLoading" class="existing-children-info">{{ t('common.saving') }}</span>
            <ul v-else-if="existingAddChildren.length" class="existing-children-list">
              <li v-for="child in existingAddChildren" :key="child.id">{{ child.name }}</li>
            </ul>
            <span v-else class="existing-children-info">{{ t('treeMap.existingChildrenNone') }}</span>
          </div>

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
import { computed, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { useTreeStore } from '../stores/tree'
import { useTreeLayout, NODE_W, NODE_H } from '../composables/useTreeLayout.js'
import { useTreeViewModal } from '../composables/useTreeViewModal.js'
import {
  clampZoomScale,
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
import ZoomControls from './tree/ZoomControls.vue'
import TreeMinimap from './tree/TreeMinimap.vue'

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
const viewportWidth   = ref(typeof window !== 'undefined' ? window.innerWidth : 800)
const viewportHeight  = ref(600)

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
        mutationLoading, mutationError, closeModal, submitPersonForm, confirmDelete,
        existingAddChildren, existingAddChildrenLoading } = modal

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

function handleZoomIn() {
  const vp = viewportRef.value
  if (!vp) return
  gestures.applyZoomAtPoint(clampZoomScale(gestures.zoomScale.value + 0.2), vp.clientWidth / 2, vp.clientHeight / 2)
}

function handleZoomOut() {
  const vp = viewportRef.value
  if (!vp) return
  gestures.applyZoomAtPoint(clampZoomScale(gestures.zoomScale.value - 0.2), vp.clientWidth / 2, vp.clientHeight / 2)
}

function fitToScreen() {
  const nds = layoutNodes.value
  const vp  = viewportRef.value
  if (!nds.length || !vp) return
  const minX  = Math.min(...nds.map(n => n.x))
  const minY  = Math.min(...nds.map(n => n.y))
  const maxX  = Math.max(...nds.map(n => n.x + n.w))
  const maxY  = Math.max(...nds.map(n => n.y + n.h))
  const treeW = maxX - minX
  const treeH = maxY - minY
  const scale = clampZoomScale(Math.min(vp.clientWidth / treeW, vp.clientHeight / treeH) * 0.85)
  gestures.zoomScale.value = scale
  gestures.panX.value = vp.clientWidth  / 2 - (minX + treeW / 2) * scale
  gestures.panY.value = vp.clientHeight / 2 - (minY + treeH / 2) * scale
}

function resetView() {
  gestures.zoomScale.value = 1
  centerTree('smooth')
}

// ─── Toggle collapse (with lazy-load) ────────────────────────────────────────
async function toggleNode(nodeId) {
  const isCollapsed = collapsedNodeIds.value.has(nodeId)
  // A node whose children haven't been loaded yet should expand, not collapse
  const childrenLoaded = treeStore.loadedParentIds.has(nodeId)
  if (isCollapsed || !childrenLoaded) {
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
  await nextTick()
  focusNode(nodeId, 'smooth')
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
  if (viewportRef.value) {
    viewportWidth.value  = viewportRef.value.clientWidth
    viewportHeight.value = viewportRef.value.clientHeight
  }
}

function handleMinimapNavigate({ sceneX, sceneY }) {
  const vp = viewportRef.value
  if (!vp) return
  const z = gestures.zoomScale.value
  gestures.panX.value = vp.clientWidth  / 2 - sceneX * z
  gestures.panY.value = vp.clientHeight / 2 - sceneY * z
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
watchEffect(() => {
  if (
    !autoCentered.value &&
    layoutNodes.value.length > 0 &&
    viewportRef.value
  ) {
    // All three conditions met: not yet centered, data ready, DOM ready
    nextTick(() => {
      centerTree('auto')
      autoCentered.value = true
      setTimeout(() => { layoutSettled.value = true }, 120)
    })
  }
})

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
  if (viewportRef.value) {
    viewportWidth.value  = viewportRef.value.clientWidth
    viewportHeight.value = viewportRef.value.clientHeight
  }
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
  --bg:         #000000;
  --panel:      rgba(28, 28, 30, 0.80);
  --panel2:     rgba(44, 44, 46, 0.90);
  --border:     rgba(255, 255, 255, 0.08);
  --text:       #ffffff;
  --muted:      rgba(235, 235, 245, 0.55);
  --shadow:     0 20px 50px rgba(0, 0, 0, 0.60);
  --radius:     18px;
  --gap-x:      34px;
  --gap-y:      16px;
  --node-width: 240px;
  --line-color: rgba(255, 255, 255, 0.12);
  --accent:     #0a84ff;
  --accent2:    #0070e0;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 18px 18px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background: var(--bg);
  color: var(--text);
}

/* Light mode tree */
[data-theme="light"] .tree-view {
  --bg:         #f2f2f7;
  --panel:      rgba(255, 255, 255, 0.85);
  --panel2:     rgba(255, 255, 255, 0.98);
  --border:     rgba(60, 60, 67, 0.18);
  --text:       #000000;
  --muted:      rgba(60, 60, 67, 0.55);
  --shadow:     0 18px 45px rgba(0, 0, 0, 0.10);
  --line-color: rgba(60, 60, 67, 0.18);
  --accent:     #007aff;
  --accent2:    #0062cc;
  background: var(--bg);
}

/* (dark is now the default — no overrides needed) */

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

/* ── Tree header toolbar ─────────────────────────────────────────────────── */
.tree-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 10px;
}

.header-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  color: var(--text);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.stats-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  background: var(--panel2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 6px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

.header-spacer {
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hdr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.hdr-btn svg {
  stroke: var(--muted);
  flex-shrink: 0;
  transition: stroke 0.15s;
}

.hdr-btn:hover {
  background: var(--panel);
  color: var(--text);
  border-color: rgba(255, 255, 255, 0.12);
}

.hdr-btn:hover svg {
  stroke: var(--text);
}

.hdr-btn:active {
  transform: scale(0.97);
}

[data-theme="light"] .hdr-btn:hover {
  background: rgba(60, 60, 67, 0.06);
  border-color: rgba(60, 60, 67, 0.18);
}
[data-theme="light"] .hdr-btn:hover svg {
  stroke: #000;
}

.tree-viewport {
  position: relative;
  height: clamp(340px, 60vh, 800px);
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg);
  box-shadow: inset 0 1px 0 var(--border);
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
  0%, 100% { outline-color: rgba(10, 132, 255, 0.45); }
  50%       { outline-color: rgba(10, 132, 255, 0.90); }
}

.selected-node {
  outline: 2px solid rgba(10, 132, 255, 0.60);
  outline-offset: 2px;
  animation: node-pulse 2s ease infinite;
}

.tree-node {
  /* Width is enforced via inline :style from NODE_W constant — CSS below is a
     safety net so the card never expands beyond its layout slot. */
  width: 240px !important;
  max-width: 240px !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  overflow: visible;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--panel);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35), 0 0 0 0.5px rgba(255, 255, 255, 0.04);
  padding: 12px 12px 12px 14px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.tree-node:hover {
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 0.5px rgba(255, 255, 255, 0.06);
}

/* Light-mode node overrides */
[data-theme="light"] .tree-node {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(60, 60, 67, 0.10);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06), 0 0 0 0.5px rgba(60, 60, 67, 0.08);
}
[data-theme="light"] .tree-node:hover {
  border-color: rgba(0, 122, 255, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10), 0 0 0 0.5px rgba(0, 122, 255, 0.12);
}
[data-theme="light"] .root-node {
  border-color: rgba(0, 122, 255, 0.30);
  box-shadow: 0 0 0 1px rgba(0,122,255,0.10), 0 4px 16px rgba(0,0,0,0.08);
}
[data-theme="light"] .node-actions-bar {
  background: rgba(255, 255, 255, 0.97);
  border-top-color: rgba(60, 60, 67, 0.08);
}
[data-theme="light"] .act-btn {
  border-color: rgba(60, 60, 67, 0.12);
}
[data-theme="light"] .act-btn:hover {
  background: rgba(60, 60, 67, 0.06);
  border-color: rgba(60, 60, 67, 0.18);
}
[data-theme="light"] .act-btn svg {
  stroke: rgba(60, 60, 67, 0.5);
}
[data-theme="light"] .act-btn:hover svg {
  stroke: #000;
}
[data-theme="light"] .act-add:hover svg    { stroke: #007aff; }
[data-theme="light"] .act-delete:hover svg { stroke: #ff3b30; }
[data-theme="light"] .access-badge.is-public  { background: rgba(52, 199, 89, 0.12); color: #1a7f37; }
[data-theme="light"] .access-badge.is-private { background: rgba(255, 149, 0, 0.12); color: #a85600; }
[data-theme="light"] .node-spinner {
  border-color: rgba(60, 60, 67, 0.15);
  border-top-color: rgba(60, 60, 67, 0.6);
}
[data-theme="light"] .modal-card {
  background: rgba(255, 255, 255, 0.97);
  border-color: rgba(60, 60, 67, 0.14);
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
}
[data-theme="light"] .modal-card h4 { color: #000; }
[data-theme="light"] .form-label label { color: rgba(60, 60, 67, 0.80); }
[data-theme="light"] .stats-pill {
  border-color: rgba(60, 60, 67, 0.12);
  background: rgba(60, 60, 67, 0.05);
  color: rgba(60, 60, 67, 0.55);
}
[data-theme="light"] .tree-viewport { background: var(--bg); }

/* Positions snap immediately so re-layout never creates a visible overlap window.
   Only hover-lift (transform) and shadow get a visual transition. */
.layout-settled .tree-node {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.root-node {
  border-color: rgba(10, 132, 255, 0.35);
  box-shadow: 0 0 0 1px rgba(10, 132, 255, 0.12), 0 4px 20px rgba(0, 0, 0, 0.40);
}

/* ── Path highlighting ──────────────────────────────────────────────── */
.on-path-node {
  outline: 2px solid rgba(10, 132, 255, 0.55);
  outline-offset: 2px;
  animation: path-glow 1.8s ease infinite;
  border-color: rgba(10, 132, 255, 0.40);
  box-shadow: 0 0 18px rgba(10, 132, 255, 0.20), 0 6px 20px rgba(0, 0, 0, 0.5);
}

@keyframes path-glow {
  0%, 100% { outline-color: rgba(10, 132, 255, 0.45); }
  50%       { outline-color: rgba(10, 132, 255, 0.90); }
}

/* Node badges and meta are now scoped in TreeNode.vue */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(560px, 100%);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--panel2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: var(--shadow);
  padding: 20px;
}

.modal-card h4 {
  margin: 0 0 14px;
  color: var(--text);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.012em;
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
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.modal-delete p {
  color: var(--text);
  margin-bottom: 14px;
}

.modal-error {
  margin-top: 10px;
}

.existing-children-section {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--panel);
}

.existing-children-label {
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
}

.existing-children-info {
  color: var(--muted);
  font-size: 13px;
}

.existing-children-list {
  margin: 0;
  padding: 0 0 0 16px;
  list-style: disc;
  color: var(--text);
  font-size: 13px;
  display: grid;
  gap: 2px;
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

  .hdr-btn-label {
    display: none;
  }

  .hdr-btn {
    padding: 0 8px;
  }

  .tree-viewport {
    height: 460px;
    border-radius: 14px;
  }

  .tree-node {
    border-radius: 12px;
    padding: 10px 10px 10px 12px;
  }

  .act-btn {
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

  .header-title {
    font-size: 13px;
  }

  .tree-viewport {
    height: 400px;
  }

  .act-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
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

  .hdr-btn {
    height: 28px;
    padding: 0 6px;
  }

  .stats-pill {
    font-size: 10px;
    height: 18px;
    min-width: 18px;
    padding: 0 5px;
  }
}
</style>
