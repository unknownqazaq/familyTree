<template>
  <div v-if="path && path.length" class="path-result">
    <div class="path-content">
      <span class="path-label">Path:</span>
      <div class="path-chips">
        <template v-for="(node, i) in path" :key="node.id">
          <div class="path-chip" @click="emit('navigate-to', node.id)">{{ node.name }}</div>
          <span v-if="i < path.length - 1" class="path-arrow">→</span>
        </template>
      </div>
      <span class="path-steps">{{ path.length }} steps</span>
    </div>
    <button class="close-btn" title="Close" @click="emit('close')">✕</button>
  </div>
</template>

<script setup>
defineProps({
  path: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'navigate-to'])
</script>

<style scoped>
.path-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #D4E6F1;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.path-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.path-label { font-size: 13px; font-weight: 600; color: #1A5276; white-space: nowrap; }

.path-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.path-chip {
  background: #fff;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 13px;
  color: #1C2833;
  cursor: pointer;
  border: 1px solid #AEB6BF;
  transition: box-shadow 0.15s;
}
.path-chip:hover { box-shadow: 0 1px 3px rgba(0,0,0,0.12); }

.path-arrow { color: #5D6D7E; font-size: 14px; }
.path-steps { font-size: 12px; color: #5D6D7E; white-space: nowrap; }

.close-btn {
  background: none;
  border: none;
  color: #5D6D7E;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.close-btn:hover { background: rgba(0,0,0,0.08); }
</style>
