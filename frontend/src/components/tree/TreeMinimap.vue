<template>
  <div class="minimap" :class="{ 'is-collapsed': collapsed }" :title="toggleLabel">
    <button class="minimap-toggle" @click="collapsed = !collapsed" :aria-label="toggleLabel">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    </button>

    <Transition name="minimap-body">
      <div v-if="!collapsed" class="minimap-body">
        <canvas
          ref="canvas"
          :width="W"
          :height="H"
          class="minimap-canvas"
          @click="handleClick"
          @mousemove="handleHover"
          @mouseleave="hovering = false"
          title="Click to navigate"
        ></canvas>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'

const props = defineProps({
  nodes:          { type: Array,  default: () => [] },
  sceneWidth:     { type: Number, default: 1 },
  sceneHeight:    { type: Number, default: 1 },
  viewportWidth:  { type: Number, default: 1 },
  viewportHeight: { type: Number, default: 1 },
  panX:           { type: Number, default: 0 },
  panY:           { type: Number, default: 0 },
  zoomScale:      { type: Number, default: 1 },
  nodeW:          { type: Number, default: 240 },
  nodeH:          { type: Number, default: 130 },
})

const emit = defineEmits(['navigate'])

const W = 168
const H = 100
const PAD = 6

const canvas    = ref(null)
const collapsed = ref(false)
const hovering  = ref(false)

const toggleLabel = computed(() => collapsed.value ? 'Show minimap' : 'Hide minimap')

// Scale factors from scene coords → minimap pixels
function getScale() {
  const sw = props.sceneWidth  || 1
  const sh = props.sceneHeight || 1
  const usableW = W - PAD * 2
  const usableH = H - PAD * 2
  const scale = Math.min(usableW / sw, usableH / sh)
  return {
    scale,
    offsetX: PAD + (usableW - sw * scale) / 2,
    offsetY: PAD + (usableH - sh * scale) / 2,
  }
}

watchEffect(() => {
  const c = canvas.value
  if (!c) return

  const ctx = c.getContext('2d')
  const { scale, offsetX, offsetY } = getScale()

  // Background – read theme from DOM
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(241, 245, 249, 0.95)'
  ctx.fillRect(0, 0, W, H)

  // Subtle scene boundary
  const sw = props.sceneWidth * scale
  const sh = props.sceneHeight * scale
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(148, 163, 184, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(offsetX, offsetY, sw, sh)

  // Nodes as small rounded rects
  const nw = Math.max(props.nodeW * scale, 3)
  const nh = Math.max(props.nodeH * scale, 2)

  for (const node of props.nodes) {
    const nx = offsetX + node.x * scale
    const ny = offsetY + node.y * scale

    ctx.fillStyle = 'rgba(99, 102, 241, 0.55)'
    ctx.beginPath()
    ctx.roundRect(nx, ny, nw, nh, 1)
    ctx.fill()
  }

  // Viewport rectangle
  const z = props.zoomScale || 1
  const vx = offsetX + (-props.panX / z) * scale
  const vy = offsetY + (-props.panY / z) * scale
  const vw = (props.viewportWidth  / z) * scale
  const vh = (props.viewportHeight / z) * scale

  ctx.fillStyle   = 'rgba(56, 189, 248, 0.1)'
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'
  ctx.lineWidth   = 1.5
  ctx.fillRect(vx, vy, vw, vh)
  ctx.strokeRect(vx, vy, vw, vh)
})

function handleClick(e) {
  const rect = canvas.value.getBoundingClientRect()
  const mx = (e.clientX - rect.left) * (W / rect.width)
  const my = (e.clientY - rect.top)  * (H / rect.height)

  const { scale, offsetX, offsetY } = getScale()
  // Convert minimap click → scene coords → request pan
  const sceneX = (mx - offsetX) / scale
  const sceneY = (my - offsetY) / scale

  emit('navigate', { sceneX, sceneY })
}

function handleHover() {
  hovering.value = true
}
</script>

<style scoped>
.minimap {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
  background: var(--c-surface, rgba(255, 255, 255, 0.92));
  border: 1px solid var(--c-border, rgba(148, 163, 184, 0.4));
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(8px);
  overflow: hidden;
  transition: box-shadow 0.15s;
  user-select: none;
}

.minimap:hover {
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.16);
}

.minimap-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 7px 10px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--c-border, rgba(226, 232, 240, 0.7));
  cursor: pointer;
  color: var(--c-text-2, #64748b);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: none;
  gap: 6px;
}

.minimap.is-collapsed .minimap-toggle {
  border-bottom: none;
}

.minimap-toggle:hover {
  background: var(--c-bg-3, rgba(241, 245, 249, 0.8));
  color: var(--c-text, #334155);
  transform: none;
}

.minimap-body {
  padding: 0;
}

.minimap-canvas {
  display: block;
  cursor: crosshair;
  width: 168px;
  height: 100px;
}

/* Transition */
.minimap-body-enter-active,
.minimap-body-leave-active {
  transition: opacity 0.15s ease, max-height 0.2s ease;
  max-height: 120px;
  overflow: hidden;
}
.minimap-body-enter-from,
.minimap-body-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
