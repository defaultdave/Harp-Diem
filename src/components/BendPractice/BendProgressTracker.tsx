/**
 * Progress bar across the current exercise set. Each segment is a clickable
 * exercise; completed exercises are filled, the active one is highlighted.
 */
import type { BendExercise } from '../../data'
import styles from './BendProgressTracker.module.css'

interface BendProgressTrackerProps {
  /** All exercises in the current set. */
  exercises: BendExercise[]
  /** Index of the active exercise. */
  currentIndex: number
  /** Indices of exercises the user has passed. */
  completed: ReadonlySet<number>
  /** Selects an exercise by index. */
  onSelect: (index: number) => void
}

export function BendProgressTracker({
  exercises,
  currentIndex,
  completed,
  onSelect,
}: BendProgressTrackerProps) {
  if (exercises.length === 0) return null

  return (
    <div className={styles.tracker}>
      <div className={styles.header}>
        <span className={styles.label}>Progress</span>
        <span className={styles.count}>
          {completed.size} / {exercises.length}
        </span>
      </div>
      <ol className={styles.segments} aria-label="Exercise progress">
        {exercises.map((exercise, index) => {
          const isCompleted = completed.has(index)
          const isCurrent = index === currentIndex
          return (
            <li key={`${exercise.hole}-${exercise.bendType}`} className={styles.segmentItem}>
              <button
                type="button"
                className={`${styles.segment} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                onClick={() => onSelect(index)}
                aria-label={`${exercise.description}${isCompleted ? ' (completed)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
