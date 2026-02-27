<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#AEB6BF" stroke-width="1.2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    </div>
    <h3 class="empty-title">
      <template v-if="query">No results for "{{ query }}"</template>
      <template v-else>{{ message || 'Nothing here yet' }}</template>
    </h3>
    <p class="empty-body">
      <template v-if="query">
        Try a different spelling, use fewer words, or browse the full tree to explore records.
      </template>
      <template v-else>{{ description || 'Check back later or try a different search.' }}</template>
    </p>
    <router-link :to="actionTo" class="btn-primary">{{ actionLabel }}</router-link>
  </div>
</template>

<script setup>
defineProps({
  query:       { type: String, default: '' },
  message:     { type: String, default: '' },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: 'Browse Full Tree' },
  actionTo:    { type: String, default: '/tree' },
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 24px;
  max-width: 480px;
  margin: 0 auto;
  gap: 16px;
}

.empty-title { font-size: 20px; font-weight: 600; color: #1C2833; }

.empty-body { font-size: 14px; color: #5D6D7E; line-height: 1.6; }

.btn-primary {
  display: inline-block;
  background: #1A5276;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  margin-top: 8px;
}
.btn-primary:hover { background: #154360; }
</style>
