import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { playChord } from './audioPlayer'

// Mock the Web Audio API at the module level
const createMockOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: { value: 0 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  disconnect: vi.fn(),
  onended: null as (() => void) | null,
})

const createMockGainNode = () => ({
  gain: {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
})

class MockAudioContext {
  state: AudioContextState = 'running'
  currentTime = 0
  destination = {}
  createOscillator = vi.fn(createMockOscillator)
  createGain = vi.fn(createMockGainNode)
  resume = vi.fn().mockResolvedValue(undefined)
}

vi.stubGlobal('AudioContext', MockAudioContext)

describe('playChord', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call onStart callback immediately', async () => {
    const onStart = vi.fn()
    const notes = ['C4', 'E4', 'G4']

    playChord(notes, { onStart })

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('should call onEnd callback after duration elapses', async () => {
    const onEnd = vi.fn()
    const notes = ['C4', 'E4', 'G4']

    const promise = playChord(notes, { onEnd })

    expect(onEnd).not.toHaveBeenCalled()

    // Fast-forward past chord duration (default 1.2s + arpeggio delays)
    await vi.advanceTimersByTimeAsync(1500)
    await promise

    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('should not call callbacks for empty notes array', async () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()

    await playChord([], { onStart, onEnd })

    expect(onStart).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('should not play notes with invalid frequencies', async () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()

    // 'invalid' is not a valid note and will be filtered out
    // All notes invalid means nothing plays
    await playChord(['invalid', 'alsoInvalid'], { onStart, onEnd })

    expect(onStart).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('should respect custom duration option', async () => {
    const onEnd = vi.fn()
    const notes = ['C4']
    const customDuration = 0.3

    const promise = playChord(notes, { duration: customDuration, onEnd })

    // onEnd should not be called before duration
    await vi.advanceTimersByTimeAsync(200)
    expect(onEnd).not.toHaveBeenCalled()

    // onEnd should be called after duration
    await vi.advanceTimersByTimeAsync(200)
    await promise

    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('should wait longer with arpeggiate enabled (default)', async () => {
    const onEnd = vi.fn()
    const notes = ['C4', 'E4', 'G4']
    const duration = 0.5

    const promise = playChord(notes, { duration, onEnd, arpeggiate: true })

    // With 3 notes and 30ms delay between each, total delay = 60ms
    // Plus 500ms duration = 560ms total
    await vi.advanceTimersByTimeAsync(400)
    expect(onEnd).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)
    await promise

    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('should finish faster without arpeggiation', async () => {
    const onEnd = vi.fn()
    const notes = ['C4', 'E4', 'G4']
    const duration = 0.5

    const promise = playChord(notes, { duration, onEnd, arpeggiate: false })

    // Without arpeggiation, should finish after just the duration (500ms)
    await vi.advanceTimersByTimeAsync(550)
    await promise

    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  describe('abort signal support', () => {
    it('should not start if signal is already aborted', async () => {
      const onStart = vi.fn()
      const onEnd = vi.fn()
      const abortController = new AbortController()
      abortController.abort()

      await playChord(['C4', 'E4', 'G4'], { onStart, onEnd, signal: abortController.signal })

      expect(onStart).not.toHaveBeenCalled()
      expect(onEnd).not.toHaveBeenCalled()
    })

    it('should call onEnd immediately when aborted during playback', async () => {
      const onStart = vi.fn()
      const onEnd = vi.fn()
      const abortController = new AbortController()
      const notes = ['C4', 'E4', 'G4']

      const promise = playChord(notes, { onStart, onEnd, signal: abortController.signal })

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onEnd).not.toHaveBeenCalled()

      // Abort after a short delay (before chord finishes)
      await vi.advanceTimersByTimeAsync(100)
      abortController.abort()

      // Allow abort handler to run
      await vi.advanceTimersByTimeAsync(0)
      await promise

      expect(onEnd).toHaveBeenCalledTimes(1)
    })

    it('should allow a new chord to interrupt the previous one', async () => {
      const onEnd1 = vi.fn()
      const onEnd2 = vi.fn()

      const abort1 = new AbortController()
      const abort2 = new AbortController()

      // Start first chord
      const promise1 = playChord(['C4', 'E4', 'G4'], { onEnd: onEnd1, signal: abort1.signal })

      await vi.advanceTimersByTimeAsync(100)
      expect(onEnd1).not.toHaveBeenCalled()

      // Interrupt with second chord
      abort1.abort()
      const promise2 = playChord(['D4', 'F4', 'A4'], { onEnd: onEnd2, signal: abort2.signal })

      // Allow abort handler to run
      await vi.advanceTimersByTimeAsync(0)
      await promise1

      // First chord should have ended immediately
      expect(onEnd1).toHaveBeenCalledTimes(1)
      expect(onEnd2).not.toHaveBeenCalled()

      // Let second chord finish
      await vi.advanceTimersByTimeAsync(1500)
      await promise2

      expect(onEnd2).toHaveBeenCalledTimes(1)
    })
  })
})
