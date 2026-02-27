<template>
  <div class="stats-bar">
    <div class="stats-content">
      <div class="stat-item">
        <span class="stat-number">{{ formatNumber(stats.total_persons) }}</span>
        <span class="stat-label">PEOPLE IN SYSTEM</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">{{ formatNumber(stats.total_families) }}</span>
        <span class="stat-label">FAMILIES MAPPED</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">{{ formatNumber(stats.monthly_edits) }}</span>
        <span class="stat-label">EDITS THIS MONTH</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    default: () => ({ total_persons: 0, total_families: 0, monthly_edits: 0 }),
  },
})

function formatNumber(n) {
  if (!n) return '0'
  return n.toLocaleString()
}
</script>

<style scoped>
.stats-bar {
  background: #1A5276;
  color: #fff;
  padding: 32px 24px;
  width: 100%;
}

.stats-content {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-number { font-size: 32px; font-weight: 700; line-height: 1; }

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(255,255,255,0.15);
}

@media (max-width: 600px) {
  .stats-content { flex-direction: column; gap: 24px; }
  .stat-divider { width: 60px; height: 1px; }
}
</style>
