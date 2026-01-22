import { ALL_KEYS, type Mode } from '../../data/progressions'
import styles from './QuizPage.module.css'

interface AnswerSelectorProps {
  selectedKey: string
  selectedMode: Mode
  onKeyChange: (key: string) => void
  onModeChange: (mode: Mode) => void
  disabled?: boolean
}

export function AnswerSelector({
  selectedKey,
  selectedMode,
  onKeyChange,
  onModeChange,
  disabled = false,
}: AnswerSelectorProps) {
  return (
    <div className={styles.answerSection}>
      <div className={styles.answerGroup}>
        <label htmlFor="key-select" className={styles.answerLabel}>Key:</label>
        <select
          id="key-select"
          className={styles.keySelect}
          value={selectedKey}
          onChange={(e) => onKeyChange(e.target.value)}
          disabled={disabled}
        >
          {ALL_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.answerGroup}>
        <span className={styles.answerLabel}>Mode:</span>
        <div className={styles.modeToggle} role="radiogroup" aria-label="Select mode">
          <button
            className={`${styles.modeButton} ${selectedMode === 'major' ? styles.modeButtonActive : ''}`}
            onClick={() => onModeChange('major')}
            disabled={disabled}
            role="radio"
            aria-checked={selectedMode === 'major'}
          >
            Major
          </button>
          <button
            className={`${styles.modeButton} ${selectedMode === 'minor' ? styles.modeButtonActive : ''}`}
            onClick={() => onModeChange('minor')}
            disabled={disabled}
            role="radio"
            aria-checked={selectedMode === 'minor'}
          >
            Minor
          </button>
        </div>
      </div>
    </div>
  )
}
