<template>
  <div class="pagination" v-if="total > 1">
    <button
      class="page-btn arrow-btn"
      :disabled="current <= 1"
      @click="emit('change', current - 1)"
    >←</button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="ellipsis">…</span>
      <button
        v-else
        :class="['page-btn', { active: page === current }]"
        @click="emit('change', page)"
      >{{ page }}</button>
    </template>

    <button
      class="page-btn arrow-btn"
      :disabled="current >= total"
      @click="emit('change', current + 1)"
    >→</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total:   { type: Number, required: true },
})

const emit = defineEmits(['change'])

const visiblePages = computed(() => {
  const pages = []
  const { current, total } = props
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 32px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #D5D8DC;
  background: transparent;
  color: #5D6D7E;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.page-btn:hover:not(:disabled):not(.active) { background: #EAECEE; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn.active   { background: #1A5276; color: #fff; border-color: #1A5276; }

.ellipsis { width: 32px; text-align: center; color: #AEB6BF; font-size: 14px; }
</style>
