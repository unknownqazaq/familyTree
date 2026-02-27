<template>
  <span :class="['badge', badgeClass]">
    <span v-if="dotIndicator" class="dot"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  role:   { type: String, default: '' },
})

const config = {
  public:   { class: 'badge-public',   label: 'Public',   dot: false },
  private:  { class: 'badge-private',  label: 'Private',  dot: false },
  pending:  { class: 'badge-pending',  label: 'Pending',  dot: true  },
  approved: { class: 'badge-approved', label: 'Approved', dot: false },
  rejected: { class: 'badge-rejected', label: 'Rejected', dot: false },
  admin:    { class: 'badge-admin',    label: 'Admin',    dot: false },
  staff:    { class: 'badge-staff',    label: 'Staff',    dot: false },
  user:     { class: 'badge-user',     label: 'User',     dot: false },
}

const key = computed(() => props.role || props.status)
const entry = computed(() => config[key.value] || { class: 'badge-user', label: key.value, dot: false })
const badgeClass    = computed(() => entry.value.class)
const label         = computed(() => entry.value.label)
const dotIndicator  = computed(() => entry.value.dot)
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.badge-public   { background: #D5F5E3; color: #1E8449; }
.badge-private  { background: #FEF9E7; color: #B7950B; }
.badge-pending  { background: #FEF9E7; color: #B7950B; }
.badge-approved { background: #D5F5E3; color: #1E8449; }
.badge-rejected { background: #FADBD8; color: #C0392B; }
.badge-admin    { background: #1A5276; color: #fff; }
.badge-staff    { background: #2980B9; color: #fff; }
.badge-user     { background: #EAECEE; color: #5D6D7E; }
</style>
