/**
 * Practice state machine for the Bending Practice mode.
 *
 * Drives one bend exercise at a time through the phases
 * `idle → playingTarget → userPlaying → feedback`. It plays a reference tone
 * for the target, then measures the live microphone pitch against the target
 * in raw cents.
 *
 * Crucially, bends land *between* the chromatic notes, so the rounded note from
 * the pitch detector is useless here — we compute cents directly from the raw
 * detected frequency vs. the target frequency. Both are absolute Hz, so the A4
 * reference-pitch setting does not affect the comparison.
 * @packageDocumentation
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePitchDetection } from '../context'
import { playTone } from '../utils'
import type { BendExercise } from '../data'

/** Phases of a single bend exercise. */
export type BendPracticePhase = 'idle' | 'playingTarget' | 'userPlaying' | 'feedback'

/** Cents window within which the user's pitch counts as "on target". */
export const HOLD_TOLERANCE_CENTS = 15
/** Tighter window used for "laser accurate" UI feedback. */
export const LASER_TOLERANCE_CENTS = 5
/** How long the user must hold the target (ms) to pass the exercise. */
export const HOLD_DURATION_MS = 1500
/** Duration of the reference target tone (seconds). */
const TARGET_TONE_DURATION_S = 1.2

/**
 * Cents difference of a detected frequency from a target frequency.
 * Positive = sharp, negative = flat.
 */
export const centsBetween = (detectedFrequency: number, targetFrequency: number): number =>
  1200 * Math.log2(detectedFrequency / targetFrequency)

/** Stable identity for an exercise, used to detect when the target changes. */
const exerciseKeyOf = (exercise: BendExercise | null): string | null =>
  exercise ? `${exercise.hole}-${exercise.bendType}` : null

/** State and actions returned by {@link useBendPractice}. */
export interface UseBendPracticeResult {
  /** Current phase of the exercise. */
  phase: BendPracticePhase
  /** Live cents offset from the target, or null when there is no input signal. */
  currentCents: number | null
  /** Progress holding the target in the tolerance zone, 0-1. */
  holdProgress: number
  /** True once the user has held the target long enough to pass. */
  passed: boolean
  /** Plays the reference tone, then arms the listener for the user's attempt. */
  playTarget: () => Promise<void>
  /** Resets the exercise back to idle. */
  reset: () => void
}

/**
 * Runs the bend practice loop for a single exercise.
 * @param exercise - The active exercise, or null when none is selected.
 */
export function useBendPractice(exercise: BendExercise | null): UseBendPracticeResult {
  const { isListening, startListening, pitchResult } = usePitchDetection()

  const [phase, setPhase] = useState<BendPracticePhase>('idle')
  const [currentCents, setCurrentCents] = useState<number | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [passed, setPassed] = useState(false)

  // Latest pitch result, kept in a ref so the animation-frame loop always reads
  // the current value without re-subscribing every frame.
  const pitchRef = useRef(pitchResult)
  useEffect(() => {
    pitchRef.current = pitchResult
  }, [pitchResult])

  // Accumulated in-tolerance hold time and the timestamp of the previous
  // in-tolerance frame.
  const holdAccumRef = useRef(0)
  const lastTsRef = useRef<number | null>(null)

  const clearHold = useCallback(() => {
    holdAccumRef.current = 0
    lastTsRef.current = null
  }, [])

  const reset = useCallback(() => {
    setPhase('idle')
    setCurrentCents(null)
    setHoldProgress(0)
    setPassed(false)
    clearHold()
  }, [clearHold])

  const playTarget = useCallback(async () => {
    if (!exercise) return
    setPassed(false)
    setHoldProgress(0)
    setPhase('playingTarget')
    await playTone(exercise.targetFrequency, TARGET_TONE_DURATION_S)
    if (!isListening) {
      try {
        await startListening()
      } catch {
        /* mic permission denied — the meter simply stays idle */
      }
    }
    setPhase('userPlaying')
  }, [exercise, isListening, startListening])

  // Reset the loop whenever the target exercise changes. Uses the React
  // "adjust state while rendering" pattern (guarded setState during render)
  // rather than an effect, so the reset is applied before the next paint.
  const exerciseKey = exerciseKeyOf(exercise)
  const [prevExerciseKey, setPrevExerciseKey] = useState(exerciseKey)
  if (exerciseKey !== prevExerciseKey) {
    setPrevExerciseKey(exerciseKey)
    setPhase('idle')
    setCurrentCents(null)
    setHoldProgress(0)
    setPassed(false)
  }

  // While the user is playing, sample the latest pitch each animation frame and
  // accumulate hold time. setState lives inside the frame callback (an external
  // timer subscription), keeping it off the effect's synchronous path.
  useEffect(() => {
    if (phase !== 'userPlaying' || !exercise) return

    // Start each attempt with a clean hold streak.
    holdAccumRef.current = 0
    lastTsRef.current = null

    let frame = 0
    const tick = () => {
      const frequency = pitchRef.current?.frequency
      const now = performance.now()

      if (!frequency) {
        // Signal dropped — break the hold streak but keep accumulated progress.
        lastTsRef.current = null
        setCurrentCents(null)
        frame = requestAnimationFrame(tick)
        return
      }

      const cents = centsBetween(frequency, exercise.targetFrequency)
      setCurrentCents(cents)

      if (Math.abs(cents) <= HOLD_TOLERANCE_CENTS) {
        if (lastTsRef.current !== null) {
          holdAccumRef.current += now - lastTsRef.current
        }
        lastTsRef.current = now
        setHoldProgress(Math.min(1, holdAccumRef.current / HOLD_DURATION_MS))
        if (holdAccumRef.current >= HOLD_DURATION_MS) {
          setPassed(true)
          setPhase('feedback')
          return
        }
      } else {
        clearHold()
        setHoldProgress(0)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase, exercise, clearHold])

  return { phase, currentCents, holdProgress, passed, playTarget, reset }
}
