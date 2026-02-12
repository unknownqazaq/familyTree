<template>
  <div class="tree-view">
    <div ref="networkContainer" class="network-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

const props = defineProps({
  persons: { type: Array, default: () => [] },
})

const emit = defineEmits(['node-click'])

const networkContainer = ref(null)
let network = null

function buildGraph(persons) {
  const nodes = new DataSet(
    persons.map((p) => ({
      id: p.id,
      label: p.name,
      shape: 'box',
      color: {
        background: p.access === 'public' ? '#d5e8d4' : '#fff2cc',
        border: p.access === 'public' ? '#82b366' : '#d6b656',
        highlight: {
          background: '#dae8fc',
          border: '#6c8ebf',
        },
      },
      font: { size: 14 },
    }))
  )

  const edges = new DataSet(
    persons
      .filter((p) => p.parent_id != null)
      .map((p) => ({
        from: p.parent_id,
        to: p.id,
        arrows: 'to',
        color: { color: '#999' },
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
        direction: 'UD',
        sortMethod: 'directed',
        levelSeparation: 100,
        nodeSpacing: 150,
      },
    },
    physics: false,
    interaction: {
      hover: true,
      navigationButtons: true,
      keyboard: true,
    },
    nodes: {
      margin: { top: 10, bottom: 10, left: 15, right: 15 },
      borderWidth: 2,
    },
    edges: {
      smooth: {
        type: 'cubicBezier',
        forceDirection: 'vertical',
      },
    },
  }

  if (network) {
    network.destroy()
  }

  network = new Network(networkContainer.value, { nodes, edges }, options)

  network.on('click', (params) => {
    if (params.nodes.length > 0) {
      emit('node-click', params.nodes[0])
    }
  })
}

watch(() => props.persons, renderNetwork, { deep: true })

onMounted(() => {
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

.network-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}
</style>
