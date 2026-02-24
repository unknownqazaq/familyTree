/**
 * useNodeDomBuilder
 *
 * Encapsulates all imperative DOM construction for the mind-map tree.
 * Splits createNodeRow (CC 19) into three focused helpers (≤6 each).
 * Accepts `t` as a parameter and groups i18n key constants at the top (D6).
 */
export function useNodeDomBuilder({
  mountRef,
  selectedNodeId,
  collapsedNodeIds,
  personById,
  childrenByParentId,
  rootIds,
  canManage,
  canSeeNodeMeta,
  suppressNodeClickUntil,
  t,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onToggleNode,
  onSelectNode,
  onUpdateStageBounds,
  onScheduleDrawLines,
  onFlushPendingFocus,
}) {
  // D6 — i18n key constants: single source of truth for all JS-side translations
  const I18N = {
    addChild: 'treeMap.addChild',
    editNode: 'treeMap.editNode',
    deleteNode: 'treeMap.deleteNode',
    expand: 'treeMap.expand',
    collapse: 'treeMap.collapse',
    meta: 'treeMap.meta',
    public: 'common.public',
    private: 'common.private',
  }

  // ─── Icon button factory ─────────────────────────────────────────────────────

  function createIconButton({ title, text, className, onClick }) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `icon-btn ${className || ''}`.trim()
    btn.title = title
    btn.textContent = text
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick()
    })
    return btn
  }

  // ─── Node card sub-builders ──────────────────────────────────────────────────

  /**
   * Builds the action-buttons container for a node.
   * CC ≤ 5 (was part of createNodeRow's 19-point blob).
   */
  function buildNodeActions(nodeId, hasChildren, isCollapsed) {
    const actions = document.createElement('div')
    actions.className = 'node-actions'

    if (canManage.value) {
      actions.appendChild(
        createIconButton({ title: t(I18N.addChild), text: '+', className: 'add-btn', onClick: () => onOpenAddModal(nodeId) }),
      )
      actions.appendChild(
        createIconButton({ title: t(I18N.editNode), text: '\u270E', className: 'edit-btn', onClick: () => onOpenEditModal(nodeId) }),
      )
      actions.appendChild(
        createIconButton({ title: t(I18N.deleteNode), text: '\u2715', className: 'danger-btn', onClick: () => onOpenDeleteModal(nodeId) }),
      )
    }

    if (hasChildren) {
      actions.appendChild(
        createIconButton({
          title: isCollapsed ? t(I18N.expand) : t(I18N.collapse),
          text: isCollapsed ? '\u25B8' : '\u25BE',
          className: 'toggle-btn',
          onClick: () => onToggleNode(nodeId),
        }),
      )
    }

    return actions
  }

  /**
   * Builds the visual card element for a node (without children subtree).
   * CC ≤ 6.
   */
  function buildNodeCard(person, nodeId, isRoot, isCollapsed, hasChildren) {
    const card = document.createElement('div')
    card.className = [
      'tree-node',
      isRoot ? 'root-node' : '',
      selectedNodeId.value === nodeId ? 'selected-node' : '',
    ]
      .filter(Boolean)
      .join(' ')
    card.dataset.nodeId = String(nodeId)

    // Top row: dot + label + actions
    const top = document.createElement('div')
    top.className = 'node-top'

    const labelLine = document.createElement('div')
    labelLine.className = 'label-line'

    const dot = document.createElement('div')
    dot.className = 'node-dot'

    const label = document.createElement('div')
    label.className = 'node-label'
    label.textContent = person.name

    labelLine.appendChild(dot)
    labelLine.appendChild(label)
    top.appendChild(labelLine)
    top.appendChild(buildNodeActions(nodeId, hasChildren, isCollapsed))
    card.appendChild(top)

    // Optional designation
    if (person.designation) {
      const desig = document.createElement('div')
      desig.className = 'node-designation'
      desig.textContent = person.designation
      card.appendChild(desig)
    }

    // Admin-only meta line
    if (canSeeNodeMeta.value) {
      const childIds = childrenByParentId.value.get(nodeId) || []
      const meta = document.createElement('div')
      meta.className = 'node-meta'
      meta.textContent = t(I18N.meta, { id: person.id, count: childIds.length })
      card.appendChild(meta)
    }

    // Access badge
    const badge = document.createElement('span')
    badge.className = `access-badge ${person.access === 'public' ? 'is-public' : 'is-private'}`
    badge.textContent = person.access === 'public' ? t(I18N.public) : t(I18N.private)
    card.appendChild(badge)

    card.addEventListener('click', (e) => {
      if (e.target.closest('.icon-btn')) return
      if (Date.now() < suppressNodeClickUntil.value) return
      onSelectNode(nodeId)
    })

    return card
  }

  /**
   * Builds the children subtree container for a node.
   * CC = 2.
   */
  function buildChildrenContainer(childIds, path) {
    const wrap = document.createElement('div')
    wrap.className = 'tree-children'
    childIds.forEach((childId) => {
      const childRow = createNodeRow(childId, false, path)
      if (childRow) wrap.appendChild(childRow)
    })
    return wrap
  }

  // ─── Main row builder ────────────────────────────────────────────────────────

  /**
   * createNodeRow — CC reduced from 19 to ≤ 6 by delegating to sub-builders.
   */
  function createNodeRow(nodeId, isRoot = false, path = new Set()) {
    if (path.has(nodeId)) return null

    const person = personById.value.get(nodeId)
    if (!person) return null

    const nextPath = new Set(path)
    nextPath.add(nodeId)

    const childIds = childrenByParentId.value.get(nodeId) || []
    const hasChildren = childIds.length > 0
    const isCollapsed = collapsedNodeIds.value.has(nodeId)

    const row = document.createElement('div')
    row.className = 'tree-row'
    row.dataset.nodeId = String(nodeId)
    if (isCollapsed) row.classList.add('collapsed')

    row.appendChild(buildNodeCard(person, nodeId, isRoot, isCollapsed, hasChildren))
    row.appendChild(buildChildrenContainer(childIds, nextPath))

    return row
  }

  // ─── Sync helpers ────────────────────────────────────────────────────────────

  function syncSelectedNodeClass() {
    if (!mountRef.value) return
    mountRef.value.querySelectorAll('.tree-node.selected-node').forEach((el) => el.classList.remove('selected-node'))
    if (selectedNodeId.value == null) return
    const target = mountRef.value.querySelector(`.tree-node[data-node-id="${selectedNodeId.value}"]`)
    if (target) target.classList.add('selected-node')
  }

  function updateRowToggleControl(row, isCollapsed) {
    const btn = row.querySelector(':scope > .tree-node .icon-btn.toggle-btn')
    if (!btn) return
    btn.textContent = isCollapsed ? '\u25B8' : '\u25BE'
    btn.title = isCollapsed ? t(I18N.expand) : t(I18N.collapse)
  }

  function animateLinesDuringTransition(duration = 340) {
    const startedAt = performance.now()
    const tick = (now) => {
      onScheduleDrawLines()
      if (now - startedAt < duration) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // ─── Full re-render ──────────────────────────────────────────────────────────

  function renderMindMap() {
    if (!mountRef.value) return
    mountRef.value.innerHTML = ''
    rootIds.value.forEach((rootId) => {
      const row = createNodeRow(rootId, true, new Set())
      if (row) mountRef.value.appendChild(row)
    })
    onUpdateStageBounds()
    syncSelectedNodeClass()
    onScheduleDrawLines()
    onFlushPendingFocus()
  }

  return {
    createIconButton,
    createNodeRow,
    renderMindMap,
    syncSelectedNodeClass,
    updateRowToggleControl,
    animateLinesDuringTransition,
  }
}
