/**
 * Tests for useTreeLayout composable — layout computation.
 */
import { describe, expect, it } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useTreeLayout, NODE_W, NODE_H, SCENE_PAD } from '../composables/useTreeLayout.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const alice = { id: 1, name: 'Alice', parent_id: null }
const bob   = { id: 2, name: 'Bob',   parent_id: 1 }
const carol = { id: 3, name: 'Carol', parent_id: 2 }
const dave  = { id: 4, name: 'Dave',  parent_id: 2 }

// ─── useTreeLayout ──────────────────────────────────────────────────────────

describe('useTreeLayout', () => {
  it('returns empty layout for empty persons list', () => {
    const persons = ref([])
    const collapsed = ref(new Set())
    const { layoutNodes, layoutEdges } = useTreeLayout(persons, collapsed)

    expect(layoutNodes.value).toEqual([])
    expect(layoutEdges.value).toEqual([])
  })

  it('computes nodes for a simple tree', () => {
    const persons = ref([alice, bob, carol, dave])
    const collapsed = ref(new Set())
    const { layoutNodes, layoutEdges } = useTreeLayout(persons, collapsed)

    expect(layoutNodes.value).toHaveLength(4)
    expect(layoutEdges.value).toHaveLength(3)
  })

  it('nodes have correct properties', () => {
    const persons = ref([alice, bob])
    const collapsed = ref(new Set())
    const { layoutNodes } = useTreeLayout(persons, collapsed)

    const aliceNode = layoutNodes.value.find(n => n.id === 1)
    expect(aliceNode).toBeDefined()
    expect(aliceNode.person).toEqual(alice)
    expect(aliceNode.w).toBeGreaterThanOrEqual(NODE_W)
    expect(aliceNode.h).toBeGreaterThanOrEqual(NODE_H)
    expect(typeof aliceNode.x).toBe('number')
    expect(typeof aliceNode.y).toBe('number')
  })

  it('edges connect parents to children with correct structure', () => {
    const persons = ref([alice, bob])
    const collapsed = ref(new Set())
    const { layoutEdges } = useTreeLayout(persons, collapsed)

    expect(layoutEdges.value).toHaveLength(1)
    const edge = layoutEdges.value[0]
    expect(edge.id).toBe('1-2')
    expect(typeof edge.x1).toBe('number')
    expect(typeof edge.y1).toBe('number')
    expect(typeof edge.x2).toBe('number')
    expect(typeof edge.y2).toBe('number')
  })

  it('collapsed nodes exclude children from layout', () => {
    const persons = ref([alice, bob, carol, dave])
    const collapsed = ref(new Set([2])) // bob is collapsed
    const { layoutNodes, layoutEdges } = useTreeLayout(persons, collapsed)

    // Only alice and bob should be in the layout (carol and dave are collapsed)
    expect(layoutNodes.value).toHaveLength(2)
    expect(layoutEdges.value).toHaveLength(1)
  })

  it('sceneBounds returns valid dimensions', () => {
    const persons = ref([alice, bob])
    const collapsed = ref(new Set())
    const { sceneBounds } = useTreeLayout(persons, collapsed)

    expect(sceneBounds.value.width).toBeGreaterThanOrEqual(1600)
    expect(sceneBounds.value.height).toBeGreaterThanOrEqual(900)
  })

  it('sceneBounds returns defaults for empty tree', () => {
    const persons = ref([])
    const collapsed = ref(new Set())
    const { sceneBounds } = useTreeLayout(persons, collapsed)

    expect(sceneBounds.value).toEqual({ width: 1600, height: 900 })
  })

  it('exposes personById, childrenByParentId, and rootIds', () => {
    const persons = ref([alice, bob])
    const collapsed = ref(new Set())
    const { personById, childrenByParentId, rootIds } = useTreeLayout(persons, collapsed)

    expect(personById.value.get(1)).toEqual(alice)
    expect(childrenByParentId.value.get(1)).toEqual([2])
    expect(rootIds.value).toEqual([1])
  })

  it('positions nodes with x >= SCENE_PAD', () => {
    const persons = ref([alice, bob, carol, dave])
    const collapsed = ref(new Set())
    const { layoutNodes } = useTreeLayout(persons, collapsed)

    for (const node of layoutNodes.value) {
      expect(node.x).toBeGreaterThanOrEqual(SCENE_PAD)
    }
  })

  it('parent x is always less than child x', () => {
    const persons = ref([alice, bob, carol, dave])
    const collapsed = ref(new Set())
    const { layoutNodes } = useTreeLayout(persons, collapsed)

    const aliceNode = layoutNodes.value.find(n => n.id === 1)
    const bobNode = layoutNodes.value.find(n => n.id === 2)
    const carolNode = layoutNodes.value.find(n => n.id === 3)

    expect(aliceNode.x).toBeLessThan(bobNode.x)
    expect(bobNode.x).toBeLessThan(carolNode.x)
  })
})
