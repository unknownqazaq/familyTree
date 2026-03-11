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
export const GAP_Y = 40
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

    const roots = (input.children || []).map((n) => n.id)

    // Build children lookup from edges
    const childrenOf = new Map()
    for (const edge of edges) {
      if (!childrenOf.has(edge.parentId)) childrenOf.set(edge.parentId, [])
      childrenOf.get(edge.parentId).push(edge.childId)
    }

    // Phase 1: compute subtree height (bottom-up)
    const subtreeH = new Map()
    const computeHeight = (nodeId) => {
      const node = nodesById.get(nodeId)
      if (!node) return 0
      const kids = childrenOf.get(nodeId) || []
      if (kids.length === 0) {
        subtreeH.set(nodeId, node.h)
        return node.h
      }
      let totalChildH = 0
      for (let i = 0; i < kids.length; i++) {
        if (i > 0) totalChildH += GAP_Y
        totalChildH += computeHeight(kids[i])
      }
      const h = Math.max(node.h, totalChildH)
      subtreeH.set(nodeId, h)
      return h
    }

    // Phase 2: position nodes (top-down)
    const positionNode = (nodeId, topY) => {
      const node = nodesById.get(nodeId)
      if (!node) return
      node.x = depthX.get(node.depth) ?? SCENE_PAD
      const kids = childrenOf.get(nodeId) || []
      if (kids.length === 0) {
        node.y = topY
        return
      }
      // Place children sequentially within allocated space
      let cursor = topY
      const myH = subtreeH.get(nodeId) || node.h
      const totalChildH = kids.reduce((sum, kid) => sum + (subtreeH.get(kid) || 0), 0)
        + (kids.length - 1) * GAP_Y
      // Center children block within allocated space
      cursor = topY + Math.max(0, (myH - totalChildH) / 2)
      for (const kidId of kids) {
        const kidH = subtreeH.get(kidId) || 0
        positionNode(kidId, cursor)
        cursor += kidH + GAP_Y
      }
      // Center parent vertically between first and last child
      const firstChild = nodesById.get(kids[0])
      const lastChild = nodesById.get(kids[kids.length - 1])
      if (firstChild && lastChild) {
        const childrenMid = (firstChild.y + firstChild.h / 2 + lastChild.y + lastChild.h / 2) / 2
        node.y = childrenMid - node.h / 2
      } else {
        node.y = topY
      }
    }

    // Place roots sequentially
    for (const rootId of roots) computeHeight(rootId)
    let rootCursor = SCENE_PAD
    for (const rootId of roots) {
      positionNode(rootId, rootCursor)
      rootCursor += (subtreeH.get(rootId) || NODE_H) + GAP_Y
    }

    const nodes = [...nodesById.values()]
    const normalizedMinY = nodes.length > 0 ? Math.min(...nodes.map((n) => n.y)) : SCENE_PAD
    const yOffset = normalizedMinY < SCENE_PAD ? (SCENE_PAD - normalizedMinY) : 0
    if (yOffset) {
      nodes.forEach((n) => { n.y += yOffset })
    }

    const layoutEdges = edges
      .map((edge) => {
        const parent = nodesById.get(edge.parentId)
        const child = nodesById.get(edge.childId)
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
