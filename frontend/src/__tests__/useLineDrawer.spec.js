/**
 * Tests for useLineDrawer composable — line color caching.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useLineDrawer } from '../composables/useLineDrawer.js'

// ─── buildCurvePath ───────────────────────────────────────────────────────────

describe('buildCurvePath', () => {
  it('returns correct SVG cubic-bezier path string', () => {
    const refs = {
      linesRef: { value: null },
      stageRef: { value: null },
      mountRef: { value: null },
    }
    const { buildCurvePath } = useLineDrawer(refs)

    const path = buildCurvePath(0, 50, 100, 75)
    expect(path).toBe('M 0 50 C 50 50, 50 75, 100 75')
  })

  it('handles same start and end points', () => {
    const refs = {
      linesRef: { value: null },
      stageRef: { value: null },
      mountRef: { value: null },
    }
    const { buildCurvePath } = useLineDrawer(refs)

    const path = buildCurvePath(10, 20, 10, 20)
    expect(path).toBe('M 10 20 C 10 20, 10 20, 10 20')
  })
})

// ─── invalidateLineColor ──────────────────────────────────────────────────────

describe('invalidateLineColor', () => {
  it('is a function returned by useLineDrawer', () => {
    const refs = {
      linesRef: { value: null },
      stageRef: { value: null },
      mountRef: { value: null },
    }
    const { invalidateLineColor } = useLineDrawer(refs)
    expect(typeof invalidateLineColor).toBe('function')
  })

  it('can be called without error', () => {
    const refs = {
      linesRef: { value: null },
      stageRef: { value: null },
      mountRef: { value: null },
    }
    const { invalidateLineColor } = useLineDrawer(refs)
    expect(() => invalidateLineColor()).not.toThrow()
  })
})

// ─── drawLines early exit ─────────────────────────────────────────────────────

describe('drawLines', () => {
  it('returns early when linesRef is null', () => {
    const refs = {
      linesRef: { value: null },
      stageRef: { value: document.createElement('div') },
      mountRef: { value: document.createElement('div') },
    }
    const { drawLines } = useLineDrawer(refs)
    expect(() => drawLines()).not.toThrow()
  })

  it('returns early when stageRef is null', () => {
    const refs = {
      linesRef: { value: document.createElementNS('http://www.w3.org/2000/svg', 'svg') },
      stageRef: { value: null },
      mountRef: { value: document.createElement('div') },
    }
    const { drawLines } = useLineDrawer(refs)
    expect(() => drawLines()).not.toThrow()
  })

  it('returns early when mountRef is null', () => {
    const refs = {
      linesRef: { value: document.createElementNS('http://www.w3.org/2000/svg', 'svg') },
      stageRef: { value: document.createElement('div') },
      mountRef: { value: null },
    }
    const { drawLines } = useLineDrawer(refs)
    expect(() => drawLines()).not.toThrow()
  })
})
