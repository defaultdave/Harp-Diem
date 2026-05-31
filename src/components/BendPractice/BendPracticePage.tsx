/**
 * Bending Practice page (route `/practice`). Lets the user pick a harmonica
 * key, tuning, and difficulty, choose a target bend, hear a reference tone, and
 * get real-time cents-accuracy feedback with hold detection.
 */
import { useMemo, useState } from 'react'
import {
  AVAILABLE_KEYS,
  TUNING_TYPES,
  BEND_DIFFICULTIES,
  getBendExercises,
  type HarmonicaKey,
  type TuningType,
  type BendDifficulty,
} from '../../data'
import { useBendPractice } from '../../hooks'
import { usePitchDetection } from '../../context'
import { capitalizeWords } from '../../utils'
import { BendTargetDisplay } from './BendTargetDisplay'
import { BendAccuracyMeter } from './BendAccuracyMeter'
import { BendProgressTracker } from './BendProgressTracker'
import styles from './BendPracticePage.module.css'

export function BendPracticePage() {
  const [harmonicaKey, setHarmonicaKey] = useState<HarmonicaKey>('C')
  const [tuning, setTuning] = useState<TuningType>('richter')
  const [difficulty, setDifficulty] = useState<BendDifficulty>('beginner')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const { isListening, startListening, stopListening, isSupported, error } = usePitchDetection()

  const exercises = useMemo(
    () => getBendExercises(harmonicaKey, tuning, difficulty),
    [harmonicaKey, tuning, difficulty]
  )
  const currentExercise = exercises[exerciseIndex] ?? null

  const { phase, currentCents, holdProgress, passed, playTarget } = useBendPractice(currentExercise)

  // Reset the set when the key / tuning / difficulty changes. Uses the React
  // "adjust state while rendering" pattern (guarded setState during render).
  const selectionKey = `${harmonicaKey}|${tuning}|${difficulty}`
  const [prevSelectionKey, setPrevSelectionKey] = useState(selectionKey)
  if (selectionKey !== prevSelectionKey) {
    setPrevSelectionKey(selectionKey)
    setExerciseIndex(0)
    setCompleted(new Set())
  }

  // Record a pass for the active exercise. Guarded so it settles in one extra
  // render rather than looping.
  if (passed && !completed.has(exerciseIndex)) {
    setCompleted((prev) => {
      if (prev.has(exerciseIndex)) return prev
      const next = new Set(prev)
      next.add(exerciseIndex)
      return next
    })
  }

  const handleToggleMic = async () => {
    if (isListening) {
      stopListening()
    } else {
      try {
        await startListening()
      } catch (err) {
        console.error('Failed to start microphone:', err)
      }
    }
  }

  const hasNext = exerciseIndex < exercises.length - 1

  if (!isSupported) {
    return (
      <div className={styles.page}>
        <header className={styles.headerCard}>
          <h2 className={styles.title}>Bending Practice</h2>
          <p className={styles.description}>
            Pitch detection is not supported in this browser, so bending practice is unavailable.
          </p>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerCard}>
        <h2 className={styles.title}>Bending Practice</h2>
        <p className={styles.description}>
          Play the target bend and hold it steady. The meter shows how flat or sharp you are in cents.
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="practice-key">Harmonica Key:</label>
          <select
            id="practice-key"
            value={harmonicaKey}
            onChange={(e) => setHarmonicaKey(e.target.value as HarmonicaKey)}
          >
            {AVAILABLE_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="practice-tuning">Tuning:</label>
          <select
            id="practice-tuning"
            value={tuning}
            onChange={(e) => setTuning(e.target.value as TuningType)}
          >
            {TUNING_TYPES.map((t) => (
              <option key={t} value={t}>
                {capitalizeWords(t)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="practice-difficulty">Difficulty:</label>
          <select
            id="practice-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as BendDifficulty)}
          >
            {BEND_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {capitalizeWords(d)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className={styles.card}>
          <p className={styles.empty}>
            No {difficulty} bends are available for a {harmonicaKey} {capitalizeWords(tuning)} harmonica.
            Try a different difficulty or tuning.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.card}>
            <BendProgressTracker
              exercises={exercises}
              currentIndex={exerciseIndex}
              completed={completed}
              onSelect={setExerciseIndex}
            />
          </div>

          <div className={styles.practiceCard}>
            <BendTargetDisplay exercise={currentExercise} holdProgress={holdProgress} passed={passed} />

            <BendAccuracyMeter cents={phase === 'userPlaying' || phase === 'feedback' ? currentCents : null} />

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
                onClick={handleToggleMic}
                aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
              >
                {isListening ? '⏹ Mic' : '🎤 Mic'}
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={playTarget}
                disabled={phase === 'playingTarget'}
              >
                {phase === 'playingTarget' ? 'Playing…' : '▶ Play target'}
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setExerciseIndex((i) => i + 1)}
                disabled={!hasNext}
              >
                Next ›
              </button>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
