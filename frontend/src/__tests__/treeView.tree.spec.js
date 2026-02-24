/**
 * Phase 1C — Tree data / computed logic tests
 * Tests pure functions in src/utils/treeUtils.js
 */
import { describe, expect, it } from 'vitest'
import {
  buildAncestorIds,
  buildChildrenByParentId,
  buildD3HierarchyInput,
  buildPersonById,
  buildRootIds,
  collectDescendantIds,
  computeNextCollapsedState,
} from '../utils/treeUtils.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const alice = { id: 1, name: 'Alice', parent_id: null }
const bob   = { id: 2, name: 'Bob',   parent_id: 1 }
const carol = { id: 3, name: 'Carol', parent_id: 2 }
const dave  = { id: 4, name: 'Dave',  parent_id: 2 }
const orphan = { id: 5, name: 'Orphan', parent_id: 99 } // parent not in list

const allPersons = [alice, bob, carol, dave]

// ─── buildPersonById ─────────────────────────────────────────────────────────

describe('buildPersonById', () => {
  it('builds a map keyed by person id', () => {
    const map = buildPersonById(allPersons)
    expect(map.size).toBe(4)
    expect(map.get(1)).toBe(alice)
    expect(map.get(3)).toBe(carol)
  })

  it('returns empty map for empty list', () => {
    expect(buildPersonById([]).size).toBe(0)
  })
})

// ─── buildChildrenByParentId ─────────────────────────────────────────────────

describe('buildChildrenByParentId', () => {
  it('maps each parent to its children ids', () => {
    const map = buildChildrenByParentId(allPersons)
    expect(map.get(1)).toEqual([2])          // alice → bob
    expect(map.get(2).sort()).toEqual([3, 4]) // bob → carol, dave
    expect(map.get(3)).toEqual([])            // carol → none
    expect(map.get(4)).toEqual([])            // dave → none
  })

  it('ignores parent_id that is not in the list', () => {
    const map = buildChildrenByParentId([...allPersons, orphan])
    // orphan's parent 99 is not a key
    expect(map.has(99)).toBe(false)
    expect(map.get(5)).toEqual([]) // orphan itself has no children
  })
})

// ─── buildRootIds ─────────────────────────────────────────────────────────────

describe('buildRootIds', () => {
  it('returns nodes whose parent is null', () => {
    const pById = buildPersonById(allPersons)
    const roots = buildRootIds(allPersons, pById)
    expect(roots).toEqual([1])
  })

  it('returns nodes whose parent is not in the list (orphan)', () => {
    const persons = [orphan, carol] // carol.parent_id=2 not in list
    const pById = buildPersonById(persons)
    const roots = buildRootIds(persons, pById)
    expect(roots.sort()).toEqual([3, 5])
  })

  it('falls back to first person when no roots found (edge case: cycle)', () => {
    // Circular: each points to the other
    const a = { id: 10, name: 'A', parent_id: 11 }
    const b = { id: 11, name: 'B', parent_id: 10 }
    const pById = buildPersonById([a, b])
    // neither qualifies as root, falls back to first
    const roots = buildRootIds([a, b], pById)
    expect(roots).toEqual([10])
  })

  it('returns empty array for empty list', () => {
    expect(buildRootIds([], new Map())).toEqual([])
  })
})

// ─── collectDescendantIds ─────────────────────────────────────────────────────

describe('collectDescendantIds', () => {
  it('collects all descendants recursively', () => {
    const map = buildChildrenByParentId(allPersons)
    const descendants = collectDescendantIds(1, map)
    expect([...descendants].sort()).toEqual([2, 3, 4])
  })

  it('returns empty set for leaf node', () => {
    const map = buildChildrenByParentId(allPersons)
    const descendants = collectDescendantIds(3, map)
    expect(descendants.size).toBe(0)
  })

  it('guards against infinite cycles', () => {
    // Manually build a cyclic map
    const cycleMap = new Map([
      [10, [11]],
      [11, [10]], // ← cycle
    ])
    // Should not throw or hang
    const result = collectDescendantIds(10, cycleMap)
    expect([...result].sort()).toEqual([10, 11])
  })
})

// ─── computeNextCollapsedState ────────────────────────────────────────────────

describe('computeNextCollapsedState', () => {
  it('preserves collapsed state for previously known nodes', () => {
    const byParent = buildChildrenByParentId(allPersons)
    const roots = [1]
    // bob (id=2) was previously collapsed
    const prevCollapsed = new Set([2])
    const prevKnown = new Set([1, 2, 3, 4])
    const { nextCollapsed } = computeNextCollapsedState(allPersons, byParent, roots, prevCollapsed, prevKnown)
    expect(nextCollapsed.has(2)).toBe(true)
  })

  it('preserves uncollapsed state for previously known nodes', () => {
    const byParent = buildChildrenByParentId(allPersons)
    const roots = [1]
    const prevCollapsed = new Set()       // nothing collapsed
    const prevKnown = new Set([1, 2, 3, 4])
    const { nextCollapsed } = computeNextCollapsedState(allPersons, byParent, roots, prevCollapsed, prevKnown)
    expect(nextCollapsed.has(2)).toBe(false)
  })

  it('auto-collapses new non-root nodes that have children', () => {
    const byParent = buildChildrenByParentId(allPersons)
    const roots = [1]
    const prevCollapsed = new Set()
    const prevKnown = new Set([1]) // only alice was known; bob/carol/dave are new
    const { nextCollapsed } = computeNextCollapsedState(allPersons, byParent, roots, prevCollapsed, prevKnown)
    // bob (id=2) is non-root and has children → auto-collapsed
    expect(nextCollapsed.has(2)).toBe(true)
    // alice is root → never auto-collapsed
    expect(nextCollapsed.has(1)).toBe(false)
    // carol/dave are leaf → not in collapsed set
    expect(nextCollapsed.has(3)).toBe(false)
    expect(nextCollapsed.has(4)).toBe(false)
  })

  it('updates nextKnown to include all current persons', () => {
    const byParent = buildChildrenByParentId(allPersons)
    const { nextKnown } = computeNextCollapsedState(
      allPersons, byParent, [1], new Set(), new Set(),
    )
    expect([...nextKnown].sort()).toEqual([1, 2, 3, 4])
  })
})

// ─── buildAncestorIds ─────────────────────────────────────────────────────────

describe('buildAncestorIds', () => {
  it('returns all ancestors from leaf to root', () => {
    const pById = buildPersonById(allPersons)
    // carol (3) → bob (2) → alice (1)
    const ancestors = buildAncestorIds(3, pById)
    expect([...ancestors].sort()).toEqual([1, 2])
  })

  it('returns one ancestor for a direct child', () => {
    const pById = buildPersonById(allPersons)
    const ancestors = buildAncestorIds(2, pById)
    expect([...ancestors]).toEqual([1])
  })

  it('returns empty set for root node', () => {
    const pById = buildPersonById(allPersons)
    const ancestors = buildAncestorIds(1, pById)
    expect(ancestors.size).toBe(0)
  })

  it('returns empty set for unknown node', () => {
    const pById = buildPersonById(allPersons)
    const ancestors = buildAncestorIds(999, pById)
    expect(ancestors.size).toBe(0)
  })

  it('guards against cycles', () => {
    const cycle = [
      { id: 10, name: 'A', parent_id: 11 },
      { id: 11, name: 'B', parent_id: 10 },
    ]
    const pById = buildPersonById(cycle)
    // Should not hang or throw
    const ancestors = buildAncestorIds(10, pById)
    expect(ancestors.size).toBeLessThanOrEqual(2)
  })
})

// ─── buildD3HierarchyInput ────────────────────────────────────────────────────

describe('buildD3HierarchyInput', () => {
  it('builds a nested tree with VIRTUAL_ROOT at top', () => {
    const pById      = buildPersonById(allPersons)
    const byParent   = buildChildrenByParentId(allPersons)
    const rootIds    = buildRootIds(allPersons, pById)
    const collapsed  = new Set()

    const result = buildD3HierarchyInput(rootIds, pById, byParent, collapsed)
    expect(result.id).toBe('VIRTUAL_ROOT')
    expect(result.children).toHaveLength(1) // only alice is root
    expect(result.children[0].id).toBe(1)
  })

  it('includes children when node is not collapsed', () => {
    const pById    = buildPersonById(allPersons)
    const byParent = buildChildrenByParentId(allPersons)
    const collapsed = new Set() // nothing collapsed → all children visible

    const result = buildD3HierarchyInput([1], pById, byParent, collapsed)
    const aliceNode = result.children[0]
    expect(aliceNode.children).toHaveLength(1) // bob
    expect(aliceNode.children[0].id).toBe(2)
    expect(aliceNode.children[0].children).toHaveLength(2) // carol, dave
  })

  it('omits children when node is collapsed', () => {
    const pById    = buildPersonById(allPersons)
    const byParent = buildChildrenByParentId(allPersons)
    const collapsed = new Set([2]) // bob is collapsed

    const result = buildD3HierarchyInput([1], pById, byParent, collapsed)
    const bobNode = result.children[0].children[0]
    expect(bobNode.id).toBe(2)
    expect(bobNode.children).toHaveLength(0)
  })

  it('handles multiple root nodes', () => {
    const persons  = [alice, carol] // alice (root) + carol whose parent (2) is missing → also root
    const pById    = buildPersonById(persons)
    const byParent = buildChildrenByParentId(persons)
    const roots    = buildRootIds(persons, pById)
    const collapsed = new Set()

    const result = buildD3HierarchyInput(roots, pById, byParent, collapsed)
    expect(result.children).toHaveLength(2)
  })

  it('guards against cycles', () => {
    const cycle = [
      { id: 10, name: 'A', parent_id: 11 },
      { id: 11, name: 'B', parent_id: 10 },
    ]
    const pById    = buildPersonById(cycle)
    const byParent = new Map([[10, [11]], [11, [10]]])
    const collapsed = new Set()
    // Should not throw or hang
    expect(() => buildD3HierarchyInput([10], pById, byParent, collapsed)).not.toThrow()
  })
})
