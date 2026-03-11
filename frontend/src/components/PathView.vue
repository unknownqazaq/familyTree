<template>
  <div class="path-view" v-if="path && path.length > 0">
    <h3>{{ t('path.title') }}</h3>
    <div class="path-chain">
      <template v-for="(node, index) in path" :key="node.id">
        <button type="button" class="path-node" @click="$emit('node-click', node.id)">
          {{ node.name }}
        </button>
        <div v-if="index < path.length - 1" class="path-arrow">&rarr;</div>
      </template>
    </div>
  </div>
  <div v-else-if="error" class="path-error">
    <p class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  path: { type: Array, default: () => [] },
  error: { type: String, default: null },
})

defineEmits(['node-click'])

const { t } = useI18n()
</script>

<style scoped>
.path-view {
  margin: 16px 0;
}

.path-view h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

.path-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.path-node {
  background: #dae8fc;
  border: 2px solid #6c8ebf;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.2s;
}

.path-node:hover {
  background: #b4d3f5;
}

.path-arrow {
  font-size: 20px;
  color: #888;
}

.path-error {
  margin: 16px 0;
}
</style>
