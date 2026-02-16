<template>
  <div class="tree-view card">
    <div class="tree-header">
      <h3>{{ t('tree.familyGraph') }}</h3>
      <p>{{ t('tree.expandHint') }}</p>
    </div>
    <div ref="networkContainer" class="network-container"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

const props = defineProps({
  persons: { type: Array, default: () => [] },
})

const emit = defineEmits(['node-click'])
const { t } = useI18n()

const networkContainer = ref(null)
let network = null
const collapsedNodeIds = ref(new Set())

const parentMap = computed(() => {
  const map = new Map()
  props.persons.forEach((person) => {
    if (person.parent_id != null) {
      map.set(person.id, person.parent_id)
    }
  })
  return map
})

const childMap = computed(() => {
  const map = new Map()
  props.persons.forEach((person) => {
    if (!map.has(person.id)) {
      map.set(person.id, [])
    }
    if (person.parent_id != null) {
      const parentChildren = map.get(person.parent_id) ?? []
      parentChildren.push(person.id)
      map.set(person.parent_id, parentChildren)
    }
  })
  return map
})

function initializeCollapsedState() {
  const next = new Set()
  const hasParent = new Set(props.persons.filter((p) => p.parent_id != null).map((p) => p.id))

  props.persons.forEach((person) => {
    const hasChildren = (childMap.value.get(person.id) ?? []).length > 0
    const isRoot = !hasParent.has(person.id)

    if (hasChildren && !isRoot) {
      next.add(person.id)
    }
  })

  collapsedNodeIds.value = next
}

function isNodeVisible(personId) {
  let currentParentId = parentMap.value.get(personId)

  while (currentParentId != null) {
    if (collapsedNodeIds.value.has(currentParentId)) {
      return false
    }
    currentParentId = parentMap.value.get(currentParentId)
  }

  return true
}

function buildGraph(persons) {
  const nodes = new DataSet(
    persons.map((p) => {
      return {
        id: p.id,
        label: p.name,
        shape: 'box',
        hidden: !isNodeVisible(p.id),
        color: {
          background: p.access === 'public' ? '#e0f2fe' : '#fef3c7',
          border: p.access === 'public' ? '#0284c7' : '#d97706',
          highlight: {
            background: '#ede9fe',
            border: '#7c3aed',
          },
        },
        font: {
          size: 14,
          face: 'Inter, Segoe UI, Roboto, sans-serif',
          color: '#0f172a',
          bold: {
            color: '#0f172a',
          },
        },
      }
    })
  )

  const edges = new DataSet(
    persons
      .filter((p) => p.parent_id != null)
      .map((p) => ({
        id: `${p.parent_id}-${p.id}`,
        from: p.parent_id,
        to: p.id,
        arrows: 'to',
        hidden: !isNodeVisible(p.id),
        color: { color: '#94a3b8', highlight: '#4f46e5' },
      }))
  )

  return { nodes, edges }
}

function renderNetwork() {
  if (!networkContainer.value || props.persons.length === 0) return

  const { nodes, edges } = buildGraph(props.persons)

  const options = {
    layout: {
      hierarchical: {
        direction: 'LR',
        sortMethod: 'directed',
        levelSeparation: 110,
        nodeSpacing: 130,
        treeSpacing: 190,
      },
    },
    physics: false,
    interaction: {
      hover: true,
      navigationButtons: true,
      keyboard: true,
    },
    nodes: {
      margin: { top: 10, bottom: 10, left: 16, right: 16 },
      borderWidth: 2,
      borderRadius: 18,
      shadow: {
        enabled: true,
        color: 'rgba(15, 23, 42, 0.15)',
        size: 12,
        x: 0,
        y: 6,
      },
    },
    edges: {
      smooth: {
        type: 'cubicBezier',
        forceDirection: 'horizontal',
        roundness: 0.4,
      },
      width: 2,
    },
  }

  if (network) {
    network.destroy()
  }

  network = new Network(networkContainer.value, { nodes, edges }, options)

  network.on('click', (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      const hasChildren = (childMap.value.get(nodeId) ?? []).length > 0

      if (hasChildren) {
        if (collapsedNodeIds.value.has(nodeId)) {
          collapsedNodeIds.value.delete(nodeId)
        } else {
          collapsedNodeIds.value.add(nodeId)
        }
        renderNetwork()
      }

      emit('node-click', nodeId)
    }
  })
}

watch(
  () => props.persons,
  () => {
    initializeCollapsedState()
    renderNetwork()
  },
  { deep: true }
)

onMounted(() => {
  initializeCollapsedState()
  renderNetwork()
})

onUnmounted(() => {
  if (network) {
    network.destroy()
  }
})
</script>

<style scoped>
.tree-view {
  width: 100%;
  height: 100%;
}

.tree-header {
  margin-bottom: 14px;
}

.tree-header h3 {
  margin-bottom: 4px;
  color: #0f172a;
}

.tree-header p {
  color: #64748b;
  font-size: 14px;
}

.network-container {
  width: 100%;
  height: 640px;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  background-size: 20px 20px, 100% 100%;
}
</style>
