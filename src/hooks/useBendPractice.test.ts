import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useBendPractice,
  centsBetween,
  HOLD_DURATION_MS,
} from './useBendPractice'
import type { PitchResult } from '../utils/pitchDetection'
import type { BendExercise } from '../data'

// Controllable pitch-detection state shared with the mocked context.
const mockState = vi.hoisted(() => ({
  pitchResult: null as PitchResult | null,
  isListening: false,
  startListening: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../context', () => ({
  usePitchDetection: () => ({
    isListening: mockState.isListening,
    startListening: mockState.startListening,
    stopListening: vi.fn(),
    pitchResult: mockState.pitchResult,
    lastPitchResult: null,
    error: null,
    isSupported: true,
    setDebugMode: vi.fn(),
    referenceHz: 440,
    setReferenceHz: vi.fn(),
  }),
}))

vi.mock('../utils', () => ({
  playTone: vi.fn().mockResolvedValue(undefined),
}))

const EXERCISE: BendExercise = {
  hole: 4,
  bendType: 'draw-half',
  targetNote: 'A4',
  targetFrequency: 440,
  difficulty: 'beginner',
  description: 'test exercise',
}

const pitch = (frequency: number): PitchResult => ({
  frequency,
  note: 'A4',
  cents: 0,
  confidence: 1,
})

describe('centsBetween', () => {
  it('is zero when frequencies match', () => {
    expect(centsBetween(440, 440)).toBe(0)
  })

  it('is +1200 cents an octave up and -1200 an octave down', () => {
    expect(centsBetween(880, 440)).toBeCloseTo(1200, 5)
    expect(centsBetween(220, 440)).toBeCloseTo(-1200, 5)
  })
})

describe('useBendPractice', () => {
  let nowSpy: ReturnType<typeof vi.spyOn>
  let rafCallback: FrameRequestCallback | null

  beforeEach(() => {
    mockState.pitchResult = null
    mockState.isListening = false
    mockState.startListening = vi.fn().mockResolvedValue(undefined)
    nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0)
    rafCallback = null
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    nowSpy.mockRestore()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('starts idle', () => {
    const { result } = renderHook(() => useBendPractice(EXERCISE))
    expect(result.current.phase).toBe('idle')
    expect(result.current.passed).toBe(false)
    expect(result.current.holdProgress).toBe(0)
  })

  it('arms the listener after playing the target tone', async () => {
    const { result } = renderHook(() => useBendPractice(EXERCISE))
    await act(async () => {
      await result.current.playTarget()
    })
    expect(result.current.phase).toBe('userPlaying')
    expect(mockState.startListening).toHaveBeenCalled()
  })

  /**
   * Advances one animation frame: pushes a new pitch reading (synced into the
   * hook's ref via rerender) at the given time, then invokes the captured rAF
   * callback.
   */
  const stepFrame = (
    rerender: () => void,
    frequency: number | null,
    now: number
  ) => {
    mockState.pitchResult = frequency === null ? null : pitch(frequency)
    nowSpy.mockReturnValue(now)
    act(() => rerender())
    act(() => rafCallback?.(now))
  }

  it('accumulates hold progress and passes after the hold duration', async () => {
    const { result, rerender } = renderHook(() => useBendPractice(EXERCISE))
    await act(async () => {
      await result.current.playTarget()
    })

    // First on-target frame establishes the baseline timestamp.
    stepFrame(rerender, 440, 0)
    expect(result.current.holdProgress).toBe(0)

    // 1000ms later, still on target (441Hz is ~3.9 cents).
    stepFrame(rerender, 441, 1000)
    expect(result.current.holdProgress).toBeCloseTo(1000 / HOLD_DURATION_MS, 2)
    expect(result.current.passed).toBe(false)

    // Crossing the hold threshold passes the exercise.
    stepFrame(rerender, 440, 1600)
    expect(result.current.holdProgress).toBe(1)
    expect(result.current.passed).toBe(true)
    expect(result.current.phase).toBe('feedback')
  })

  it('resets hold progress when the pitch drifts out of tolerance', async () => {
    const { result, rerender } = renderHook(() => useBendPractice(EXERCISE))
    await act(async () => {
      await result.current.playTarget()
    })

    stepFrame(rerender, 440, 0)
    stepFrame(rerender, 440, 700)
    expect(result.current.holdProgress).toBeGreaterThan(0)

    // 466Hz is ~100 cents sharp — well outside the 15 cent window.
    stepFrame(rerender, 466, 900)
    expect(result.current.holdProgress).toBe(0)
    expect(result.current.passed).toBe(false)
    expect(result.current.currentCents).toBeCloseTo(centsBetween(466, 440), 5)
  })

  it('reset() returns the loop to idle', async () => {
    const { result, rerender } = renderHook(() => useBendPractice(EXERCISE))
    await act(async () => {
      await result.current.playTarget()
    })
    stepFrame(rerender, 440, 0)

    act(() => result.current.reset())
    expect(result.current.phase).toBe('idle')
    expect(result.current.currentCents).toBeNull()
    expect(result.current.holdProgress).toBe(0)
  })
})
