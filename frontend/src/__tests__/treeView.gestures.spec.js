/**
 * Phase 1B — Pure function / gesture logic tests
 * Tests pure helpers exported from src/composables/useViewportGestures.js
 */
import { describe, expect, it } from 'vitest'
import {
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  clampZoomScale,
  computeZoomAnchorScroll,
  getTouchCenter,
  getTouchDistance,
  markMovedIfThresholdExceeded,
} from '../composables/useViewportGestures.js'

// ─── clampZoomScale ───────────────────────────────────────────────────────────

describe('clampZoomScale', () => {
  it('returns value within [MIN, MAX] unchanged', () => {
    expect(clampZoomScale(1.0)).toBe(1.0)
    expect(clampZoomScale(MIN_ZOOM_SCALE)).toBe(MIN_ZOOM_SCALE)
    expect(clampZoomScale(MAX_ZOOM_SCALE)).toBe(MAX_ZOOM_SCALE)
  })

  it('clamps below MIN to MIN', () => {
    expect(clampZoomScale(0)).toBe(MIN_ZOOM_SCALE)
    expect(clampZoomScale(-5)).toBe(MIN_ZOOM_SCALE)
    expect(clampZoomScale(0.1)).toBe(MIN_ZOOM_SCALE)
  })

  it('clamps above MAX to MAX', () => {
    expect(clampZoomScale(99)).toBe(MAX_ZOOM_SCALE)
    expect(clampZoomScale(MAX_ZOOM_SCALE + 0.01)).toBe(MAX_ZOOM_SCALE)
  })

  it('rounds to 2 decimal places', () => {
    const result = clampZoomScale(1.005)
    expect(result).toBe(Math.round(1.005 * 100) / 100)
  })
})

// ─── getTouchDistance ─────────────────────────────────────────────────────────

describe('getTouchDistance', () => {
  it('computes Euclidean distance between two touch points', () => {
    const a = { clientX: 0, clientY: 0 }
    const b = { clientX: 3, clientY: 4 }
    expect(getTouchDistance(a, b)).toBeCloseTo(5)
  })

  it('returns 0 for identical points', () => {
    const p = { clientX: 10, clientY: 10 }
    expect(getTouchDistance(p, p)).toBe(0)
  })

  it('handles negative coordinates', () => {
    const a = { clientX: -3, clientY: -4 }
    const b = { clientX: 0, clientY: 0 }
    expect(getTouchDistance(a, b)).toBeCloseTo(5)
  })
})

// ─── getTouchCenter ───────────────────────────────────────────────────────────

describe('getTouchCenter', () => {
  it('returns midpoint relative to viewport rect', () => {
    const a = { clientX: 100, clientY: 100 }
    const b = { clientX: 200, clientY: 200 }
    const rect = { left: 50, top: 50 }
    const center = getTouchCenter(a, b, rect)
    expect(center.x).toBeCloseTo(100) // (100+200)/2 - 50
    expect(center.y).toBeCloseTo(100)
  })

  it('when rect origin is 0, returns raw midpoint', () => {
    const a = { clientX: 0, clientY: 0 }
    const b = { clientX: 40, clientY: 60 }
    const rect = { left: 0, top: 0 }
    const center = getTouchCenter(a, b, rect)
    expect(center.x).toBeCloseTo(20)
    expect(center.y).toBeCloseTo(30)
  })
})

// ─── markMovedIfThresholdExceeded ─────────────────────────────────────────────

describe('markMovedIfThresholdExceeded', () => {
  it('sets state.moved to true when delta exceeds 2 px', () => {
    const state = { moved: false }
    markMovedIfThresholdExceeded(state, 3, 0)
    expect(state.moved).toBe(true)
  })

  it('does not set moved when delta is exactly 2 px', () => {
    const state = { moved: false }
    markMovedIfThresholdExceeded(state, 2, 0)
    expect(state.moved).toBe(false)

    const state2 = { moved: false }
    markMovedIfThresholdExceeded(state2, 0, 2)
    expect(state2.moved).toBe(false)
  })

  it('does not reset moved from true to false', () => {
    const state = { moved: true }
    markMovedIfThresholdExceeded(state, 0, 0)
    expect(state.moved).toBe(true)
  })

  it('triggers on Y axis alone', () => {
    const state = { moved: false }
    markMovedIfThresholdExceeded(state, 0, 5)
    expect(state.moved).toBe(true)
  })
})

// ─── computeZoomAnchorScroll ──────────────────────────────────────────────────

describe('computeZoomAnchorScroll', () => {
  it('scales stage anchor position and subtracts client offset', () => {
    // Zoom in 2×: anchorStage doubles, subtract client offset
    const result = computeZoomAnchorScroll(100, 200, 50, 80, 2)
    expect(result.scrollLeft).toBe(150) // 100*2 - 50
    expect(result.scrollTop).toBe(320)  // 200*2 - 80
  })

  it('clamps scroll to 0 minimum', () => {
    // Zooming out: anchor * ratio < client offset → negative → clamp to 0
    const result = computeZoomAnchorScroll(10, 20, 200, 300, 0.5)
    expect(result.scrollLeft).toBe(0) // 10*0.5 - 200 = -195 → 0
    expect(result.scrollTop).toBe(0)  // 20*0.5 - 300 = -290 → 0
  })

  it('returns precise values for 1:1 ratio', () => {
    const result = computeZoomAnchorScroll(300, 400, 100, 150, 1)
    expect(result.scrollLeft).toBe(200)
    expect(result.scrollTop).toBe(250)
  })
})
