import { computed } from 'vue'
import {
  buildChildrenByParentId,
  buildD3HierarchyInput,
  buildPersonById,
  buildRootIds,
} from '../utils/treeUtils.js'

export const NODE_W = 220
export const NODE_H = 90
export const GAP_X = 96
export const GAP_Y = 28
export const SCENE_PAD = 80

export function useTreeLayout(personsRef, collapsedNodeIdsRef, nodeSizesRef = null) {
  const personById = computed(() => buildPersonById(personsRef.value))
  const childrenByParentId = computed(() => buildChildrenByParentId(personsRef.value))
  const rootIds = computed(() => buildRootIds(personsRef.value, personById.value))

  const measuredSize = (id) => {
    const raw = nodeSizesRef?.value?.get(String(id))
    return {
      w: Math.max(Math.round(raw?.width ?? NODE_W), NODE_W),
      h: Math.max(Math.round(raw?.height ?? NODE_H), NODE_H),
    }
  }

  const layoutResult = computed(() => {
    if (personsRef.value.length === 0) return { nodes: [], edges: [] }

    const input = buildD3HierarchyInput(
      rootIds.value,
      personById.value,
      childrenByParentId.value,
      collapsedNodeIdsRef.value,
    )

    const nodesById = new Map()
    const edges = []
    const maxWidthByDepth = new Map()

    const collect = (node, depth, parentId = null) => {
      if (!node || node.id === 'VIRTUAL_ROOT') {
        for (const child of node?.children || []) collect(child, 0, null)
        return
      }

      const { w, h } = measuredSize(node.id)
      nodesById.set(node.id, {
        id: node.id,
        depth,
        parentId,
        person: node.person,
        hasChildren: (childrenByParentId.value.get(node.id) || []).length > 0,
        isCollapsed: collapsedNodeIdsRef.value.has(node.id),
        w,
        h,
        x: 0,
        y: 0,
      })

      const prevMaxW = maxWidthByDepth.get(depth) ?? NODE_W
      if (w > prevMaxW) maxWidthByDepth.set(depth, w)
      else if (!maxWidthByDepth.has(depth)) maxWidthByDepth.set(depth, prevMaxW)

      for (const child of node.children || []) {
        edges.push({ parentId: node.id, childId: child.id })
        collect(child, depth + 1, node.id)
      }
    }

    collect(input, 0, null)

    const depthX = new Map()
    const sortedDepths = [...maxWidthByDepth.keys()].sort((a, b) => a - b)
    let cursorX = SCENE_PAD
    for (const depth of sortedDepths) {
      depthX.set(depth, cursorX)
      cursorX += (maxWidthByDepth.get(depth) || NODE_W) + GAP_X
    }

    const cursorByDepth = new Map()
    const roots = (input.children || []).map((n) => n.id)

    const placeSubtree = (nodeId) => {
      const node = nodesById.get(nodeId)
      if (!node) return { center: SCENE_PAD, top: SCENE_PAD, bottom: SCENE_PAD }

      const childIds = edges.filter((e) => e.parentId === nodeId).map((e) => e.childId)
      const childBoxes = childIds.map((id) => placeSubtree(id))

      let desiredY
      if (childBoxes.length === 0) {
        desiredY = cursorByDepth.get(node.depth) ?? SCENE_PAD
      } else {
        const childrenCenter = childBoxes.reduce((sum, box) => sum + box.center, 0) / childBoxes.length
        desiredY = childrenCenter - node.h / 2
      }

      const minY = cursorByDepth.get(node.depth) ?? SCENE_PAD
      node.y = Math.max(minY, desiredY)
      node.x = depthX.get(node.depth) ?? SCENE_PAD
      cursorByDepth.set(node.depth, node.y + node.h + GAP_Y)

      const top = Math.min(node.y, ...childBoxes.map((b) => b.top))
      const bottom = Math.max(node.y + node.h, ...childBoxes.map((b) => b.bottom))
      return { center: node.y + node.h / 2, top, bottom }
    }

    for (const rootId of roots) placeSubtree(rootId)

    const nodes = [...nodesById.values()]
    const normalizedMinY = nodes.length > 0 ? Math.min(...nodes.map((n) => n.y)) : SCENE_PAD
    const yOffset = normalizedMinY < SCENE_PAD ? (SCENE_PAD - normalizedMinY) : 0
    if (yOffset) {
      nodes.forEach((n) => { n.y += yOffset })
    }

    const posById = new Map(nodes.map((n) => [n.id, n]))
    const layoutEdges = edges
      .map((edge) => {
        const parent = posById.get(edge.parentId)
        const child = posById.get(edge.childId)
        if (!parent || !child) return null
        return {
          id: `${edge.parentId}-${edge.childId}`,
          x1: parent.x + parent.w,
          y1: parent.y + parent.h / 2,
          x2: child.x,
          y2: child.y + child.h / 2,
        }
      })
      .filter(Boolean)

    return { nodes, edges: layoutEdges }
  })

  const layoutNodes = computed(() => layoutResult.value.nodes)
  const layoutEdges = computed(() => layoutResult.value.edges)

  const sceneBounds = computed(() => {
    const nds = layoutNodes.value
    if (nds.length === 0) return { width: 1600, height: 900 }

    let maxX = 0
    let maxY = 0
    for (const n of nds) {
      if (n.x + n.w > maxX) maxX = n.x + n.w
      if (n.y + n.h > maxY) maxY = n.y + n.h
    }

    return {
      width: Math.max(1600, maxX + SCENE_PAD),
      height: Math.max(900, maxY + SCENE_PAD),
    }
  })

  return {
    layoutNodes,
    layoutEdges,
    sceneBounds,
    personById,
    childrenByParentId,
    rootIds,
  }
}
