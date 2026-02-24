/**
 * useViewportGestures
 *
 * Encapsulates all viewport drag, touch pan/pinch, and wheel-zoom logic.
 * Pan model: CSS transform translate(panX, panY) scale(zoom) on a scene div.
 * The viewport itself has overflow: hidden — no scrollbars, true infinite canvas.
 */
import { reactive, ref } from 'vue'

// ─── Constants ────────────────────────────────────────────────────────────────
export const MIN_ZOOM_SCALE    = 0.3
export const MAX_ZOOM_SCALE    = 2.5
export const ZOOM_STEP         = 0.1   // kept for API-compat; wheel uses proportional delta
export const MOBILE_ZOOM_SCALE = 0.7
export const TABLET_ZOOM_SCALE = 0.85

// ─── Pure helpers (exported for unit tests) ───────────────────────────────────

export function clampZoomScale(value) {
  const clamped = Math.min(MAX_ZOOM_SCALE, Math.max(MIN_ZOOM_SCALE, value))
  return Math.round(clamped * 100) / 100
}

export function getTouchDistance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

export function getTouchCenter(a, b, rect) {
  return {
    x: (a.clientX + b.clientX) / 2 - rect.left,
    y: (a.clientY + b.clientY) / 2 - rect.top,
  }
}

/**
 * D3 — moved-threshold check extracted as a shared helper.
 * Mutates `state.moved` to true once the cumulative drag exceeds 2 px.
 */
export function markMovedIfThresholdExceeded(state, deltaX, deltaY) {
  if (!state.moved && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
    state.moved = true
  }
}

/**
 * D7 — zoom-anchor scroll math extracted as a pure function.
 * Returns the new {scrollLeft, scrollTop} after applying a zoom ratio.
 */
export function computeZoomAnchorScroll(anchorStageX, anchorStageY, anchorClientX, anchorClientY, ratio) {
  return {
    scrollLeft: Math.max(0, anchorStageX * ratio - anchorClientX),
    scrollTop: Math.max(0, anchorStageY * ratio - anchorClientY),
  }
}

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @param {{
 *   viewportRef: import('vue').Ref,
 *   isInteractionEnabled: () => boolean,
 * }} options
 */
export function useViewportGestures({ viewportRef, isInteractionEnabled }) {
  const suppressNodeClickUntil = ref(0)
  const zoomScale  = ref(1)
  const panX       = ref(0)
  const panY       = ref(0)
  const isDragging = ref(false)

  // ── Zoom-to-cursor helper ────────────────────────────────────────────────────
  // Keeps the scene point currently under (anchorX, anchorY) fixed after zoom.
  function applyZoomAtPoint(newScale, anchorX, anchorY) {
    const ratio = newScale / zoomScale.value
    panX.value  = anchorX - (anchorX - panX.value) * ratio
    panY.value  = anchorY - (anchorY - panY.value) * ratio
    zoomScale.value = newScale
  }

  const viewportDragState = reactive({
    active: false,
    moved:  false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  })

  const touchGestureState = reactive({
    mode: 'none',
    moved: false,
    panStartX: 0,
    panStartY: 0,
    startPanX: 0,
    startPanY: 0,
    pinchStartDistance: 0,
    pinchStartScale: 1,
    pinchAnchorX: 0,
    pinchAnchorY: 0,
  })

  // D4 — unified gesture-complete marker
  function markGestureComplete(delayMs) {
    suppressNodeClickUntil.value = Date.now() + delayMs
  }

  // ─── Mouse drag ─────────────────────────────────────────────────────────────

  function startViewportDrag(event) {
    if (event.button !== 0 || !viewportRef.value) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('.icon-btn')) return

    viewportDragState.active    = true
    viewportDragState.moved     = false
    viewportDragState.startX    = event.clientX
    viewportDragState.startY    = event.clientY
    viewportDragState.startPanX = panX.value
    viewportDragState.startPanY = panY.value

    isDragging.value = true
    document.body.style.userSelect = 'none'
    event.preventDefault()
  }

  function moveViewportDrag(event) {
    if (!viewportDragState.active) return

    const deltaX = event.clientX - viewportDragState.startX
    const deltaY = event.clientY - viewportDragState.startY
    markMovedIfThresholdExceeded(viewportDragState, deltaX, deltaY)

    panX.value = viewportDragState.startPanX + deltaX
    panY.value = viewportDragState.startPanY + deltaY
    event.preventDefault()
  }

  function stopViewportDrag() {
    if (!viewportDragState.active) return
    if (viewportDragState.moved) markGestureComplete(180)

    viewportDragState.active = false
    viewportDragState.moved  = false
    isDragging.value         = false
    document.body.style.userSelect = ''
  }

  // ─── Touch pan ──────────────────────────────────────────────────────────────

  function startTouchPan(touch) {
    touchGestureState.mode       = 'pan'
    touchGestureState.moved      = false
    touchGestureState.panStartX  = touch.clientX
    touchGestureState.panStartY  = touch.clientY
    touchGestureState.startPanX  = panX.value
    touchGestureState.startPanY  = panY.value
    isDragging.value             = true
  }

  function moveTouchPan(touch) {
    if (touchGestureState.mode !== 'pan') return false

    const deltaX = touch.clientX - touchGestureState.panStartX
    const deltaY = touch.clientY - touchGestureState.panStartY
    markMovedIfThresholdExceeded(touchGestureState, deltaX, deltaY)
    if (!touchGestureState.moved) return false

    panX.value = touchGestureState.startPanX + deltaX
    panY.value = touchGestureState.startPanY + deltaY
    return true
  }

  // ─── Touch pinch ────────────────────────────────────────────────────────────

  function startTouchPinch(firstTouch, secondTouch) {
    if (!viewportRef.value) return
    const rect   = viewportRef.value.getBoundingClientRect()
    const center = getTouchCenter(firstTouch, secondTouch, rect)

    touchGestureState.mode               = 'pinch'
    touchGestureState.moved              = true
    touchGestureState.pinchStartDistance = Math.max(1, getTouchDistance(firstTouch, secondTouch))
    touchGestureState.pinchStartScale    = zoomScale.value
    touchGestureState.pinchAnchorX       = center.x
    touchGestureState.pinchAnchorY       = center.y
  }

  function moveTouchPinch(firstTouch, secondTouch) {
    if (touchGestureState.mode !== 'pinch') return

    const currentDistance = Math.max(1, getTouchDistance(firstTouch, secondTouch))
    const rawScale        = touchGestureState.pinchStartScale * (currentDistance / touchGestureState.pinchStartDistance)
    const nextScale       = clampZoomScale(rawScale)
    if (nextScale === zoomScale.value) return

    applyZoomAtPoint(nextScale, touchGestureState.pinchAnchorX, touchGestureState.pinchAnchorY)
  }

  function stopTouchGesture() {
    if (touchGestureState.moved) markGestureComplete(220)
    touchGestureState.mode  = 'none'
    touchGestureState.moved = false
    isDragging.value        = false
  }

  // ─── Wheel zoom ─────────────────────────────────────────────────────────────

  function handleViewportWheel(event) {
    if (!isInteractionEnabled()) return
    event.preventDefault()

    const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX
    if (delta === 0) return

    // Proportional scaling for smooth trackpad support; clamped to ±0.15 per event
    const rawDelta    = Math.max(-0.15, Math.min(0.15, -delta * 0.001))
    const nextScale   = clampZoomScale(zoomScale.value + rawDelta)
    if (nextScale === zoomScale.value) return

    const viewport = viewportRef.value
    const rect     = viewport.getBoundingClientRect()
    const mouseX   = event.clientX - rect.left
    const mouseY   = event.clientY - rect.top

    applyZoomAtPoint(nextScale, mouseX, mouseY)
  }

  // ─── Event handler facades ───────────────────────────────────────────────────

  function handleViewportMouseDown(event) {
    startViewportDrag(event)
  }

  function handleWindowMouseMove(event) {
    moveViewportDrag(event)
  }

  function handleWindowMouseUp() {
    stopViewportDrag()
  }

  function handleViewportTouchStart(event) {
    if (!isInteractionEnabled()) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('.icon-btn')) return

    if (event.touches.length === 1) {
      startTouchPan(event.touches[0])
      return
    }
    if (event.touches.length >= 2) {
      startTouchPinch(event.touches[0], event.touches[1])
      event.preventDefault()
    }
  }

  function handleViewportTouchMove(event) {
    if (!isInteractionEnabled()) return

    if (event.touches.length >= 2) {
      if (touchGestureState.mode !== 'pinch') startTouchPinch(event.touches[0], event.touches[1])
      moveTouchPinch(event.touches[0], event.touches[1])
      event.preventDefault()
      return
    }

    if (event.touches.length === 1) {
      if (touchGestureState.mode !== 'pan') startTouchPan(event.touches[0])
      const didMove = moveTouchPan(event.touches[0])
      if (didMove) event.preventDefault()
    }
  }

  function handleViewportTouchEnd(event) {
    if (!viewportRef.value) return

    if (event.touches.length >= 2) {
      startTouchPinch(event.touches[0], event.touches[1])
      return
    }
    if (event.touches.length === 1) {
      startTouchPan(event.touches[0])
      return
    }
    stopTouchGesture()
  }

  return {
    zoomScale,
    panX,
    panY,
    isDragging,
    suppressNodeClickUntil,
    // mouse
    handleViewportMouseDown,
    handleWindowMouseMove,
    handleWindowMouseUp,
    // touch
    handleViewportTouchStart,
    handleViewportTouchMove,
    handleViewportTouchEnd,
    // wheel
    handleViewportWheel,
    // cleanup
    stopViewportDrag,
    stopTouchGesture,
  }
}
