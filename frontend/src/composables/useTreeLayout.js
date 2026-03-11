import { computed } from 'vue'
import { hierarchy, tree } from 'd3-hierarchy'
import {
  buildChildrenByParentId,
  buildD3HierarchyInput,
  buildPersonById,
  buildRootIds,
} from '../utils/treeUtils.js'

export const NODE_W = 220
export const NODE_H = 130
export const GAP_X = 60
export const GAP_Y = 40
export const SCENE_PAD = 80

export function useTreeLayout(personsRef, collapsedNodeIdsRef, nodeSizesRef = null) {
  void nodeSizesRef // kept for API compatibility; d3-hierarchy uses fixed NODE_W/NODE_H
  const personById = computed(() => buildPersonById(personsRef.value))
  const childrenByParentId = computed(() => buildChildrenByParentId(personsRef.value))
  const rootIds = computed(() => buildRootIds(personsRef.value, personById.value))

  const layoutResult = computed(() => {
    if (!personsRef.value.length) return { nodes: [], edges: [] }

    // 1. Build input tree (buildD3HierarchyInput already handles collapsed nodes)
    const input = buildD3HierarchyInput(
      rootIds.value,
      personById.value,
      childrenByParentId.value,
      collapsedNodeIdsRef.value,
    )

    // 2. d3 hierarchy + tree layout
    const root = hierarchy(input, d => d.id === 'VIRTUAL_ROOT' ? d.children : (d.children || null))

    tree()
      .nodeSize([NODE_H + GAP_Y, NODE_W + GAP_X])
      .separation(() => 1)(root)

    // 3. Collect nodes, skipping VIRTUAL_ROOT
    const allNodes = root.descendants().filter(d => d.data.id !== 'VIRTUAL_ROOT')

    // 4. Normalize Y so minimum is SCENE_PAD
    const minY = Math.min(...allNodes.map(d => d.x))
    const yOffset = minY < SCENE_PAD ? SCENE_PAD - minY : 0

    // 5. Build layoutNodes
    const nodes = allNodes.map(d => {
      const depth = d.depth - 1 // -1 because VIRTUAL_ROOT adds a level
      return {
        id:          d.data.id,
        depth,
        parentId:    d.parent?.data.id === 'VIRTUAL_ROOT' ? null : (d.parent?.data.id ?? null),
        person:      d.data.person,
        hasChildren: d.data.person?.has_children === true || (childrenByParentId.value.get(d.data.id) || []).length > 0,
        isCollapsed: collapsedNodeIdsRef.value.has(d.data.id),
        w: NODE_W,
        h: NODE_H,
        x: SCENE_PAD + depth * (NODE_W + GAP_X), // strict column per depth
        y: d.x + yOffset,                         // d3 computes vertical axis via node.x
      }
    })

    // 6. Build layoutEdges
    const posById = new Map(nodes.map(n => [n.id, n]))
    const edges = root.links()
      .filter(l => l.source.data.id !== 'VIRTUAL_ROOT')
      .map(l => {
        const p = posById.get(l.source.data.id)
        const c = posById.get(l.target.data.id)
        if (!p || !c) return null
        return {
          id: `${p.id}-${c.id}`,
          x1: p.x + NODE_W,
          y1: p.y + NODE_H / 2,
          x2: c.x,
          y2: c.y + NODE_H / 2,
        }
      })
      .filter(Boolean)

    return { nodes, edges }
  })

  const layoutNodes = computed(() => layoutResult.value.nodes)
  const layoutEdges = computed(() => layoutResult.value.edges)

  const sceneBounds = computed(() => {
    const nds = layoutNodes.value
    if (!nds.length) return { width: 1600, height: 900 }
    const maxX = Math.max(...nds.map(n => n.x + n.w))
    const maxY = Math.max(...nds.map(n => n.y + n.h))
    return {
      width: Math.max(1600, maxX + SCENE_PAD),
      height: Math.max(900, maxY + SCENE_PAD),
    }
  })

  return { layoutNodes, layoutEdges, sceneBounds, personById, childrenByParentId, rootIds }
}
