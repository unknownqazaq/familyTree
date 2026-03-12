<template>
  <div class="zoom-controls" :class="{ mounted: isMounted }">
    <div class="zc-accent-edge"></div>
    <div class="zc-inner">
      <button
        class="zc-btn"
        title="Zoom In"
        @click="emit('zoom-in')"
        @pointerdown="pressStart"
        @pointerup="pressEnd"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="10.5" cy="10.5" r="7" stroke-width="1.6"/>
          <line x1="15.8" y1="15.8" x2="21" y2="21" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="10.5" y1="7.5" x2="10.5" y2="13.5" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>

      <button
        class="zc-btn"
        title="Zoom Out"
        @click="emit('zoom-out')"
        @pointerdown="pressStart"
        @pointerup="pressEnd"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="10.5" cy="10.5" r="7" stroke-width="1.6"/>
          <line x1="15.8" y1="15.8" x2="21" y2="21" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>

      <div class="zc-divider">
        <div class="zc-divider-pip"></div>
      </div>

      <button
        class="zc-btn"
        title="Fit to screen"
        @click="emit('fit')"
        @pointerdown="pressStart"
        @pointerup="pressEnd"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="8" y="8" width="8" height="8" rx="1" stroke-width="1.2" opacity="0.4"/>
        </svg>
      </button>

      <button
        class="zc-btn"
        title="Reset view"
        @click="emit('reset')"
        @pointerdown="pressStart"
        @pointerup="pressEnd"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4.5 12a7.5 7.5 0 1 1 1.2 4.1" stroke-width="1.5" stroke-linecap="round"/>
          <polyline points="2 10 4.8 12.5 7.2 10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['zoom-in', 'zoom-out', 'fit', 'reset'])

const isMounted = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { isMounted.value = true })
})

function pressStart(e) {
  e.currentTarget.classList.add('pressing')
}
function pressEnd(e) {
  e.currentTarget.classList.remove('pressing')
}
</script>

<style scoped>
.zoom-controls {
  --zc-amber: #d4a054;
  --zc-amber-glow: rgba(212, 160, 84, 0.15);
  --zc-amber-line: rgba(212, 160, 84, 0.35);
  --zc-surface: var(--panel2, rgba(22, 22, 24, 0.92));
  --zc-surface-hover: var(--panel, rgba(38, 38, 40, 0.85));
  --zc-stroke: var(--text, #ffffff);
  --zc-stroke-dim: var(--muted, rgba(235, 235, 245, 0.45));
  --zc-border: var(--border, rgba(255, 255, 255, 0.07));
  --zc-shadow: rgba(0, 0, 0, 0.4);

  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  border-radius: 14px;
  overflow: hidden;

  /* entry animation */
  opacity: 0;
  transform: translateY(12px) scale(0.96);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.zoom-controls.mounted {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* amber accent edge */
.zc-accent-edge {
  width: 2.5px;
  flex-shrink: 0;
  background: linear-gradient(
    to bottom,
    transparent 2%,
    var(--zc-amber-line) 15%,
    var(--zc-amber) 45%,
    var(--zc-amber) 55%,
    var(--zc-amber-line) 85%,
    transparent 98%
  );
  border-radius: 14px 0 0 14px;
}

.zc-inner {
  display: flex;
  flex-direction: column;
  background: var(--zc-surface);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--zc-border);
  border-left: none;
  border-radius: 0 14px 14px 0;
  box-shadow:
    0 8px 32px var(--zc-shadow),
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  padding: 5px;
  gap: 2px;
}

/* buttons */
.zc-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.12s ease;
}

.zc-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9px;
  opacity: 0;
  background: radial-gradient(circle at center, var(--zc-amber-glow) 0%, transparent 70%);
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.zc-btn svg {
  stroke: var(--zc-stroke);
  fill: none;
  transition: stroke 0.2s ease;
  position: relative;
  z-index: 1;
}

.zc-btn:hover {
  background: var(--zc-surface-hover);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.zc-btn:hover::before {
  opacity: 1;
}

.zc-btn:hover svg {
  stroke: var(--zc-amber);
}

.zc-btn:active,
.zc-btn.pressing {
  transform: scale(0.9);
  background: var(--zc-surface-hover);
}

.zc-btn:active svg,
.zc-btn.pressing svg {
  stroke: var(--zc-amber);
}

/* divider */
.zc-divider {
  height: 1px;
  margin: 3px 6px;
  background: var(--zc-border);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zc-divider-pip {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--zc-amber-line);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(212, 160, 84, 0.2);
}

/* light theme overrides */
:root[data-theme="light"] .zoom-controls {
  --zc-amber: #b8862d;
  --zc-amber-glow: rgba(184, 134, 45, 0.1);
  --zc-amber-line: rgba(184, 134, 45, 0.3);
  --zc-shadow: rgba(0, 0, 0, 0.1);
}
</style>
