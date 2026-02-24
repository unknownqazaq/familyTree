/**
 * useTreeLayout
 *
 * Pure-computed layout engine built on top of d3-hierarchy.
 * Replaces the CSS-flexbox approach with absolute positions so nodes
 * never overlap and parents are centered over their children.
 *
 * Layout orientation: LEFT-TO-RIGHT (depth grows on the X axis, siblings
 * are spread on the Y axis).
 *
 * All raw d3 coordinates are normalized so the top-left node starts at
 * (SCENE_PAD, SCENE_PAD) – no negative positions.
 */
import { hierarchy, tree } from 'd3-hierarchy'
import { computed } from 'vue'
import {
  buildChildrenByParentId,
  buildD3HierarchyInput,
  buildPersonById,
  buildRootIds,
} from '../utils/treeUtils.js'

// ─── Layout constants (exported so TreeView / TreeNode can read them) ─────────
export const NODE_W    = 220   // card width  (px)
export const NODE_H    = 90    // card height (px)
export const GAP_X     = 80    // horizontal gap between depth levels
export const GAP_Y     = 20    // vertical   gap between siblings
export const SCENE_PAD = 80    // padding around the whole scene

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @param {import('vue').Ref<Array>} personsRef
 * @param {import('vue').Ref<Set>}   collapsedNodeIdsRef
 */
export function useTreeLayout(personsRef, collapsedNodeIdsRef) {
  const personById         = computed(() => buildPersonById(personsRef.value))
  const childrenByParentId = computed(() => buildChildrenByParentId(personsRef.value))
  const rootIds            = computed(() => buildRootIds(personsRef.value, personById.value))

  // ── Core layout computation ─────────────────────────────────────────────────
  const layoutResult = computed(() => {
    if (personsRef.value.length === 0) return { nodes: [], edges: [] }

    const input = buildD3HierarchyInput(
      rootIds.value,
      personById.value,
      childrenByParentId.value,
      collapsedNodeIdsRef.value,
    )

    // Build hierarchy and run the d3 tree layout.
    // nodeSize([dx, dy]):
    //   dx = spacing between siblings on d3's x-axis  → becomes screen Y
    //   dy = spacing between depth levels on d3's y-axis → becomes screen X
    const root       = hierarchy(input, (d) => d.children)
    const treeLayout = tree().nodeSize([NODE_H + GAP_Y, NODE_W + GAP_X])
    treeLayout(root)

    // Find the bounding box of all real nodes (excluding VIRTUAL_ROOT)
    let rawMinX = Infinity
    let rawMinY = Infinity
    root.each((node) => {
      if (node.data.id === 'VIRTUAL_ROOT') return
      // Swap: d3.y → screenX, d3.x → screenY
      if (node.y < rawMinX) rawMinX = node.y
      if (node.x < rawMinY) rawMinY = node.x
    })

    const offsetX = -rawMinX + SCENE_PAD
    const offsetY = -rawMinY + SCENE_PAD

    // Build a fast map from d3 data id → normalized screen {x, y}
    const posMap = new Map()
    root.each((node) => {
      if (node.data.id === 'VIRTUAL_ROOT') return
      posMap.set(node.data.id, {
        x: node.y + offsetX,
        y: node.x + offsetY,
      })
    })

    const nodes = []
    const edges = []

    root.each((node) => {
      if (node.data.id === 'VIRTUAL_ROOT') return

      const pos = posMap.get(node.data.id)
      nodes.push({
        id:          node.data.id,
        x:           pos.x,
        y:           pos.y,
        depth:       node.depth - 1, // subtract 1 because VIRTUAL_ROOT is depth 0
        person:      node.data.person,
        hasChildren: (childrenByParentId.value.get(node.data.id) || []).length > 0,
        isCollapsed: collapsedNodeIdsRef.value.has(node.data.id),
      })

      // Draw an edge from this node to its parent (skip VIRTUAL_ROOT → real-root edges)
      if (node.parent && node.parent.data.id !== 'VIRTUAL_ROOT') {
        const pPos = posMap.get(node.parent.data.id)
        edges.push({
          id: `${node.parent.data.id}-${node.data.id}`,
          x1: pPos.x + NODE_W,        // parent right-center
          y1: pPos.y + NODE_H / 2,
          x2: pos.x,                  // child left-center
          y2: pos.y + NODE_H / 2,
        })
      }
    })

    return { nodes, edges }
  })

  const layoutNodes = computed(() => layoutResult.value.nodes)
  const layoutEdges = computed(() => layoutResult.value.edges)

  const sceneBounds = computed(() => {
    const nds = layoutNodes.value
    if (nds.length === 0) return { width: 1600, height: 900 }

    let maxX = 0
    let maxY = 0
    for (const n of nds) {
      if (n.x + NODE_W > maxX) maxX = n.x + NODE_W
      if (n.y + NODE_H > maxY) maxY = n.y + NODE_H
    }
    return {
      width:  Math.max(1600, maxX + SCENE_PAD),
      height: Math.max(900,  maxY + SCENE_PAD),
    }
  })

  return {
    layoutNodes,
    layoutEdges,
    sceneBounds,
    // Re-export for convenience (TreeView needs them for modal, focus, etc.)
    personById,
    childrenByParentId,
    rootIds,
  }
}
