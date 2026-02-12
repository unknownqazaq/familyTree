<template>
  <div class="person-card card" v-if="person">
    <div class="person-header">
      <h3>{{ person.name }}</h3>
      <span :class="['badge', person.access === 'public' ? 'badge-public' : 'badge-private']">
        {{ person.access }}
      </span>
    </div>

    <div v-if="person.designation" class="person-field">
      <strong>Designation:</strong> {{ person.designation }}
    </div>

    <div v-if="person.reference" class="person-field">
      <strong>Reference:</strong> {{ person.reference }}
    </div>

    <div v-if="person.history" class="person-field">
      <strong>History:</strong> {{ person.history }}
    </div>

    <div class="person-actions" v-if="showActions">
      <router-link :to="`/person/${person.id}/edit`" class="btn-primary">Edit</router-link>
      <router-link :to="`/tree/${person.id}`" class="btn-success">View Tree</router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  person: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
})
</script>

<style scoped>
.person-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.person-header h3 {
  margin: 0;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-public {
  background: #d4edda;
  color: #155724;
}

.badge-private {
  background: #fff3cd;
  color: #856404;
}

.person-field {
  margin-bottom: 8px;
  font-size: 14px;
}

.person-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.person-actions a {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  color: white;
  text-decoration: none;
}
</style>
