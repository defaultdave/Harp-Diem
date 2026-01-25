import type { Difficulty } from '../../data'
import { capitalize } from '../../utils'
import styles from './QuizPage.module.css'

interface DifficultySelectorProps {
  difficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
  disabled?: boolean
}

const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard']

export function DifficultySelector({
  difficulty,
  onDifficultyChange,
  disabled = false,
}: DifficultySelectorProps) {
  return (
    <div className={styles.difficultySection}>
      <span className={styles.sectionLabel}>Difficulty</span>
      <div className={styles.difficultyButtons} role="radiogroup" aria-label="Select difficulty">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option}
            className={`${styles.difficultyButton} ${difficulty === option ? styles.difficultyButtonActive : ''}`}
            onClick={() => onDifficultyChange(option)}
            disabled={disabled}
            role="radio"
            aria-checked={difficulty === option}
          >
            {capitalize(option)}
          </button>
        ))}
      </div>
    </div>
  )
}
