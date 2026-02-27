<template>
  <div
    class="avatar"
    :style="{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.36) + 'px' }"
    :title="name"
  >
    {{ initials }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: Number, default: 40 },
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  background: #EAECEE;
  color: #1A5276;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
}
</style>
