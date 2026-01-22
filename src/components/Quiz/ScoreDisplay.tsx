import styles from './QuizPage.module.css'

interface ScoreDisplayProps {
  correct: number
  total: number
}

export function ScoreDisplay({ correct, total }: ScoreDisplayProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className={styles.scoreSection} aria-live="polite">
      <span className={styles.sectionLabel}>Score</span>
      <div className={styles.scoreValue}>
        <span className={styles.scoreCheckmark} aria-hidden="true">&#10003;</span>
        <span className={styles.scoreNumbers}>
          {correct} / {total}
        </span>
        {total > 0 && (
          <span className={styles.scorePercentage}>({percentage}%)</span>
        )}
      </div>
    </div>
  )
}
