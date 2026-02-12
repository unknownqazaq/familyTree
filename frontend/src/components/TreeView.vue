<template>
  <section class="tree-view">
    <header class="tree-header">
      <h2>Mind Map</h2>
    </header>
    <div ref="networkContainer" class="network-container"></div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

const props = defineProps({
  persons: { type: Array, default: () => [] },
})

const emit = defineEmits(['node-click'])

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
  const hasParent = new Set(props.persons.filter((person) => person.parent_id != null).map((person) => person.id))
  const next = new Set()

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

function hasChildren(nodeId) {
  return (childMap.value.get(nodeId) ?? []).length > 0
}

function nodeStyles(person) {
  const isPrivate = person.access !== 'public'
  return {
    background: isPrivate ? '#fef9c3' : '#e2e8f0',
    border: isPrivate ? '#f59e0b' : '#94a3b8',
  }
}

function buildGraph(persons) {
  const nodes = new DataSet(
    persons.map((person) => {
      const styles = nodeStyles(person)

      return {
        id: person.id,
        label: person.name,
        shape: 'box',
        hidden: !isNodeVisible(person.id),
        color: {
          background: styles.background,
          border: styles.border,
          highlight: {
            background: '#f1f5f9',
            border: '#475569',
          },
        },
        borderWidth: 1.5,
        font: {
          size: 14,
          face: 'Inter, Segoe UI, Roboto, sans-serif',
          color: '#0f172a',
        },
      }
    })
  )

  const edges = new DataSet(
    persons
      .filter((person) => person.parent_id != null)
      .map((person) => ({
        id: `${person.parent_id}-${person.id}`,
        from: person.parent_id,
        to: person.id,
        hidden: !isNodeVisible(person.id),
        color: { color: '#cbd5e1', highlight: '#64748b' },
        width: 1.5,
      }))
  )

  return { nodes, edges }
}

function renderNetwork() {
  if (!networkContainer.value || props.persons.length === 0) {
    return
  }

  const { nodes, edges } = buildGraph(props.persons)

  const options = {
    layout: {
      hierarchical: {
        direction: 'LR',
        sortMethod: 'directed',
        nodeSpacing: 160,
        levelSeparation: 170,
        treeSpacing: 210,
      },
    },
    physics: false,
    interaction: {
      hover: true,
      dragNodes: false,
      dragView: true,
      zoomView: true,
      navigationButtons: false,
      keyboard: true,
    },
    nodes: {
      borderRadius: 10,
      margin: { top: 10, right: 14, bottom: 10, left: 14 },
      shadow: { enabled: false },
    },
    edges: {
      arrows: { to: false },
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.14,
      },
    },
  }

  if (network) {
    network.destroy()
  }

  network = new Network(networkContainer.value, { nodes, edges }, options)

  network.on('click', (params) => {
    if (params.nodes.length === 0) {
      return
    }

    const nodeId = params.nodes[0]

    if (hasChildren(nodeId)) {
      if (collapsedNodeIds.value.has(nodeId)) {
        collapsedNodeIds.value.delete(nodeId)
      } else {
        collapsedNodeIds.value.add(nodeId)
      }
      renderNetwork()
    }

    emit('node-click', nodeId)
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
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.tree-header {
  margin-bottom: 10px;
}

.tree-header h2 {
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

.network-container {
  width: 100%;
  height: 660px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}
</style>
