/**
 * Target note display with a concentric ring that fills as the user holds the
 * pitch within the tolerance zone.
 */
import type { BendExercise } from '../../data'
import styles from './BendTargetDisplay.module.css'

interface BendTargetDisplayProps {
  /** The active exercise, or null when none is selected. */
  exercise: BendExercise | null
  /** Hold progress 0-1, drives the ring fill. */
  holdProgress: number
  /** Whether the user has passed the current exercise. */
  passed: boolean
}

const RING_RADIUS = 52
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function BendTargetDisplay({ exercise, holdProgress, passed }: BendTargetDisplayProps) {
  if (!exercise) {
    return (
      <div className={styles.target}>
        <p className={styles.empty}>No bends available for this selection.</p>
      </div>
    )
  }

  const dashOffset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, holdProgress)))

  return (
    <div className={styles.target}>
      <div className={styles.ringWrap}>
        <svg className={styles.ring} viewBox="0 0 120 120" role="img" aria-label={`Hold progress ${Math.round(holdProgress * 100)}%`}>
          <circle className={styles.ringTrack} cx="60" cy="60" r={RING_RADIUS} />
          <circle
            className={`${styles.ringFill} ${passed ? styles.ringPassed : ''}`}
            cx="60"
            cy="60"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className={styles.center}>
          <span className={styles.note}>{exercise.targetNote}</span>
          <span className={styles.freq}>{exercise.targetFrequency.toFixed(1)} Hz</span>
        </div>
      </div>
      <p className={styles.description}>{passed ? '✓ Nailed it!' : exercise.description}</p>
    </div>
  )
}
