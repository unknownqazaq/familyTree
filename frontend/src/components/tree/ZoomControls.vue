<template>
  <div class="zoom-controls">
    <button class="ctrl-btn" title="Zoom In" @click="emit('zoom-in')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8"  y1="11" x2="14" y2="11"/>
      </svg>
    </button>
    <button class="ctrl-btn" title="Zoom Out" @click="emit('zoom-out')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="8"  y1="11" x2="14" y2="11"/>
      </svg>
    </button>
    <div class="divider"></div>
    <button class="ctrl-btn" title="Fit to screen" @click="emit('fit')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    </button>
    <button class="ctrl-btn" title="Reset view" @click="emit('reset')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['zoom-in', 'zoom-out', 'fit', 'reset'])
</script>

<style scoped>
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  background: var(--panel2, rgba(44, 44, 46, 0.90));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25), 0 0 0 0.5px var(--border, rgba(255,255,255,0.08));
  padding: 4px;
  gap: 2px;
  z-index: 10;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text, #ffffff);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.1s;
}
.ctrl-btn:hover {
  background: var(--panel, rgba(28, 28, 30, 0.80));
}
.ctrl-btn:active {
  transform: scale(0.92);
}

.divider { height: 1px; background: var(--border, rgba(255, 255, 255, 0.08)); margin: 2px 4px; }
</style>
