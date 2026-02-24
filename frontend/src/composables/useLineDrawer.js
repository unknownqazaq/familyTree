/**
 * useLineDrawer
 *
 * Encapsulates all SVG connector-line rendering logic.
 * CC before: drawLines = 12. CC after: drawLines ≈ 5, buildCurvePath = 1.
 */
export function useLineDrawer({ linesRef, stageRef, mountRef }) {
  let lineFrameId = null

  // ─── Pure helpers ───────────────────────────────────────────────────────────

  /**
   * Build an SVG cubic-bezier path string connecting a parent midpoint to a
   * child midpoint.
   * @param {number} px  Parent right-edge X
   * @param {number} py  Parent centre Y
   * @param {number} cx  Child left-edge X
   * @param {number} cy  Child centre Y
   * @returns {string}
   */
  function buildCurvePath(px, py, cx, cy) {
    const midX = (px + cx) / 2
    return `M ${px} ${py} C ${midX} ${py}, ${midX} ${cy}, ${cx} ${cy}`
  }

  // ─── Draw ────────────────────────────────────────────────────────────────────

  function drawLines() {
    if (!linesRef.value || !stageRef.value || !mountRef.value) return

    linesRef.value.innerHTML = ''

    const stageRect = stageRef.value.getBoundingClientRect()
    const lineColor =
      getComputedStyle(stageRef.value).getPropertyValue('--line-color').trim() ||
      'rgba(148, 163, 184, 0.4)'

    mountRef.value.querySelectorAll('.tree-row').forEach((row) => {
      if (row.classList.contains('collapsed')) return

      const parentCard = row.querySelector(':scope > .tree-node')
      const childrenCol = row.querySelector(':scope > .tree-children')
      if (!parentCard || !childrenCol) return

      const childRows = childrenCol.querySelectorAll(':scope > .tree-row')
      if (!childRows.length) return

      const parentRect = parentCard.getBoundingClientRect()
      const px = parentRect.right - stageRect.left
      const py = (parentRect.top + parentRect.bottom) / 2 - stageRect.top

      childRows.forEach((childRow) => {
        const childCard = childRow.querySelector(':scope > .tree-node')
        if (!childCard) return

        const childRect = childCard.getBoundingClientRect()
        const cx = childRect.left - stageRect.left
        const cy = (childRect.top + childRect.bottom) / 2 - stageRect.top

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', buildCurvePath(px, py, cx, cy))
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke', lineColor)
        path.setAttribute('stroke-width', '2')
        path.setAttribute('stroke-linecap', 'round')
        linesRef.value.appendChild(path)

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        dot.setAttribute('cx', cx)
        dot.setAttribute('cy', cy)
        dot.setAttribute('r', '3')
        dot.setAttribute('fill', 'rgba(14, 165, 233, 0.56)')
        linesRef.value.appendChild(dot)
      })
    })
  }

  function scheduleDrawLines() {
    if (lineFrameId != null) cancelAnimationFrame(lineFrameId)
    lineFrameId = requestAnimationFrame(() => {
      lineFrameId = null
      drawLines()
    })
  }

  function cancelScheduled() {
    if (lineFrameId != null) {
      cancelAnimationFrame(lineFrameId)
      lineFrameId = null
    }
  }

  return { drawLines, scheduleDrawLines, cancelScheduled, buildCurvePath }
}
