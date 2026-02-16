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
      const hasChildren = (childMap.value.get(p.id) ?? []).length > 0
      const isCollapsed = collapsedNodeIds.value.has(p.id)

      return {
        id: p.id,
        label: hasChildren ? `${p.name}\n${isCollapsed ? '' : ''}` : p.name,
        shape: 'box',
        hidden: !isNodeVisible(p.id),
        color: {
          background: p.access === 'public' ? '#e6f6ec' : '#fff6d6',
          border: p.access === 'public' ? '#2fb574' : '#e6b94b',
          highlight: {
            background: '#e7ecff',
            border: '#5b62d6',
          },
        },
        font: { size: 14, face: 'Inter, Segoe UI, Roboto, sans-serif' },
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
        hidden: !isNodeVisible(p.id),
        color: { color: '#9aa4b2', highlight: '#5b62d6' },
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
        levelSeparation: 140,
        nodeSpacing: 220,
        treeSpacing: 220,
      },
    },
    physics: false,
    interaction: {
      hover: true,
      navigationButtons: true,
      keyboard: true,
      dragNodes: true,
    },
    nodes: {
      margin: { top: 12, bottom: 12, left: 18, right: 18 },
      borderWidth: 1.5,
      borderRadius: 16,
      shadow: {
        enabled: true,
        color: 'rgba(15, 23, 42, 0.12)',
        size: 16,
        x: 0,
        y: 8,
      },
    },
    edges: {
      smooth: {
        type: 'cubicBezier',
        forceDirection: 'horizontal',
        roundness: 0.6,
      },
      width: 1.6,
    },
  }

  if (network) {
    network.destroy()
  }

  network = new Network(networkContainer.value, { nodes, edges }, options)

  animateLayout()

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

function animateLayout() {
  if (!network) return

  network.setOptions({
    physics: {
      enabled: true,
      solver: 'hierarchicalRepulsion',
      hierarchicalRepulsion: {
        nodeDistance: 180,
        centralGravity: 0.1,
        springLength: 140,
        springConstant: 0.06,
      },
      stabilization: {
        iterations: 60,
      },
    },
  })

  network.stabilize(60)

  network.once('stabilized', () => {
    network.setOptions({
      physics: {
        enabled: false,
      },
    })
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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(236, 242, 255, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
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
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(226, 232, 255, 0.7), transparent 55%),
    radial-gradient(circle at bottom right, rgba(224, 242, 254, 0.6), transparent 45%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
}
</style>
