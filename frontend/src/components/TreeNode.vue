<template>
  <div
    class="tree-node"
    :class="{
      'root-node':     depth === 0,
      'selected-node': isSelected,
    }"
    :data-node-id="person.id"
    @click.stop="handleClick"
  >
    <div class="node-top">
      <div class="label-line">
        <span class="node-dot"></span>
        <span class="node-label">{{ person.name }}</span>
      </div>

      <div class="node-actions">
        <button
          v-if="canManage"
          class="icon-btn add-btn"
          :title="t('treeMap.addTitle')"
          @click.stop="$emit('add')"
        >+</button>
        <button
          v-if="canManage"
          class="icon-btn edit-btn"
          :title="t('treeMap.editTitle')"
          @click.stop="$emit('edit')"
        >✎</button>
        <button
          v-if="canManage"
          class="icon-btn danger-btn"
          :title="t('treeMap.deleteTitle')"
          @click.stop="$emit('delete')"
        >✕</button>
        <button
          v-if="hasChildren"
          class="icon-btn toggle-btn"
          :title="isCollapsed ? t('treeMap.expand') : t('treeMap.collapse')"
          @click.stop="$emit('toggle')"
        >{{ isCollapsed ? '›' : '‹' }}</button>
      </div>
    </div>

    <div v-if="person.designation" class="node-designation">{{ person.designation }}</div>

    <div v-if="canSeeNodeMeta" class="node-meta">
      <span>#{{ person.id }}</span>
      <span v-if="person.reference"> · {{ person.reference }}</span>
    </div>

    <span
      v-if="person.access"
      class="access-badge"
      :class="person.access === 'public' ? 'is-public' : 'is-private'"
    >
      {{ person.access === 'public' ? t('common.public') : t('common.private') }}
    </span>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  person:              { type: Object,  required: true },
  isSelected:          { type: Boolean, default: false },
  isCollapsed:         { type: Boolean, default: false },
  hasChildren:         { type: Boolean, default: false },
  depth:               { type: Number,  default: 0 },
  canManage:           { type: Boolean, default: false },
  canSeeNodeMeta:      { type: Boolean, default: false },
  suppressClickUntil:  { type: Number,  default: 0 },
})

const emit = defineEmits(['click', 'toggle', 'add', 'edit', 'delete'])

const { t } = useI18n()

function handleClick() {
  if (Date.now() < props.suppressClickUntil) return
  emit('click')
}
</script>
