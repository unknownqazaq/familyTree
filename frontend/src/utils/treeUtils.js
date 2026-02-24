/**
 * treeUtils.js
 *
 * Pure utility functions for tree data structure transformations.
 * Extracted from TreeView.vue so they can be unit-tested without DOM/Vue.
 */

/**
 * Build a Map<id, person> for O(1) lookups.
 * @param {Array} persons
 * @returns {Map}
 */
export function buildPersonById(persons) {
  const map = new Map()
  persons.forEach((p) => map.set(p.id, p))
  return map
}

/**
 * Build a Map<parentId, childId[]> from a flat person list.
 * @param {Array} persons
 * @returns {Map}
 */
export function buildChildrenByParentId(persons) {
  const map = new Map()
  persons.forEach((p) => map.set(p.id, []))
  persons.forEach((p) => {
    if (p.parent_id != null && map.has(p.parent_id)) {
      map.get(p.parent_id).push(p.id)
    }
  })
  return map
}

/**
 * Derive root node IDs (nodes with no parent that exists in the list).
 * Falls back to the first person's id if the list is non-empty but no root found.
 * @param {Array} persons
 * @param {Map} personById
 * @returns {number[]}
 */
export function buildRootIds(persons, personById) {
  const roots = persons
    .filter((p) => p.parent_id == null || !personById.has(p.parent_id))
    .map((p) => p.id)
  if (roots.length === 0 && persons.length > 0) roots.push(persons[0].id)
  return roots
}

/**
 * Recursively collect all descendant IDs of a given node.
 * Guards against cycles using the `collected` set.
 * @param {number} nodeId
 * @param {Map} childrenByParentId
 * @param {Set} [collected]
 * @returns {Set}
 */
export function collectDescendantIds(nodeId, childrenByParentId, collected = new Set()) {
  const children = childrenByParentId.get(nodeId) || []
  children.forEach((childId) => {
    if (collected.has(childId)) return
    collected.add(childId)
    collectDescendantIds(childId, childrenByParentId, collected)
  })
  return collected
}

/**
 * Compute the next collapsed-node set and known-node set when the persons
 * array changes.
 *
 * Rules:
 *  - Nodes already known: preserve their collapsed state.
 *  - New nodes that are not root: auto-collapse if they have children.
 *  - Root nodes are never auto-collapsed.
 *
 * @param {Array} persons
 * @param {Map} childrenByParentId
 * @param {number[]} rootIds
 * @param {Set} previousCollapsed
 * @param {Set} previousKnown
 * @returns {{ nextCollapsed: Set, nextKnown: Set }}
 */
export function computeNextCollapsedState(persons, childrenByParentId, rootIds, previousCollapsed, previousKnown) {
  const nextCollapsed = new Set()
  const roots = new Set(rootIds)

  persons.forEach((person) => {
    const hasChildren = (childrenByParentId.get(person.id) || []).length > 0
    if (!hasChildren) return

    if (previousKnown.has(person.id)) {
      if (previousCollapsed.has(person.id)) nextCollapsed.add(person.id)
      return
    }

    if (!roots.has(person.id)) nextCollapsed.add(person.id)
  })

  return {
    nextCollapsed,
    nextKnown: new Set(persons.map((p) => p.id)),
  }
}

/**
 * Collect all ancestor IDs of a given node (parent, grandparent, …).
 * Guards against cycles using a visited set.
 * @param {number} nodeId
 * @param {Map} personById
 * @returns {Set<number>}
 */
export function buildAncestorIds(nodeId, personById) {
  const ancestors = new Set()
  const visited   = new Set()
  let current = personById.get(nodeId)
  while (current && current.parent_id != null) {
    if (visited.has(current.parent_id)) break
    visited.add(current.parent_id)
    ancestors.add(current.parent_id)
    current = personById.get(current.parent_id)
  }
  return ancestors
}

/**
 * Build a nested tree object suitable for d3.hierarchy().
 * Collapsed nodes are included (they need to be in the layout for focus),
 * but their children are omitted so the layout doesn't expand them.
 *
 * @param {number[]} rootIds
 * @param {Map} personById
 * @param {Map} childrenByParentId
 * @param {Set} collapsedNodeIds
 * @returns {{ id: 'VIRTUAL_ROOT', children: Object[] }}
 */
export function buildD3HierarchyInput(rootIds, personById, childrenByParentId, collapsedNodeIds) {
  const CYCLE_GUARD = new Set()

  function buildNode(id) {
    if (CYCLE_GUARD.has(id)) return null
    CYCLE_GUARD.add(id)
    const person   = personById.get(id)
    const childIds = childrenByParentId.get(id) || []
    const node = {
      id,
      person,
      children: collapsedNodeIds.has(id)
        ? []
        : childIds.map(buildNode).filter(Boolean),
    }
    CYCLE_GUARD.delete(id)
    return node
  }

  return {
    id: 'VIRTUAL_ROOT',
    person: null,
    children: rootIds.map(buildNode).filter(Boolean),
  }
}
