import type { QuizQuestion } from '../../data/progressions'
import styles from './QuizPage.module.css'

interface ResultFeedbackProps {
  isCorrect: boolean
  question: QuizQuestion
}

export function ResultFeedback({ isCorrect, question }: ResultFeedbackProps) {
  const modeLabel = question.mode.charAt(0).toUpperCase() + question.mode.slice(1)
  const progressionText = question.progression
    .map((chord) => `${chord.name} (${chord.romanNumeral})`)
    .join(' \u2192 ')

  return (
    <div
      className={`${styles.feedbackCard} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
      aria-live="assertive"
    >
      <div className={styles.feedbackHeader}>
        <span className={styles.feedbackIcon} aria-hidden="true">
          {isCorrect ? '\u2713' : '\u2717'}
        </span>
        <span className={styles.feedbackTitle}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </span>
      </div>
      <p className={styles.feedbackText}>
        The progression was in <strong>{question.key} {modeLabel}</strong>.
      </p>
      <p className={styles.feedbackChords}>
        Chords played: {progressionText}
      </p>
    </div>
  )
}
