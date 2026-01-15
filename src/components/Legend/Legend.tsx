import styles from './Legend.module.css'
import { useDisplaySettings } from '../../context'

export function Legend() {
  const { noteDisplay, showDegrees, setNoteDisplay, setShowDegrees } = useDisplaySettings()

  return (
    <div className={styles.legend} role="note" aria-label="Legend for scale visualization">
      <div className={styles.legendHeader}>
        <h3>Legend</h3>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleButton} ${noteDisplay === 'tab' ? styles.toggleActive : ''}`}
            onClick={() => setNoteDisplay(noteDisplay === 'notes' ? 'tab' : 'notes')}
            aria-pressed={noteDisplay === 'tab'}
          >
            {noteDisplay === 'notes' ? 'Show' : 'Hide'} Tab
          </button>
          <button
            className={`${styles.toggleButton} ${showDegrees ? styles.toggleActive : ''}`}
            onClick={() => setShowDegrees(!showDegrees)}
            aria-pressed={showDegrees}
          >
            {showDegrees ? 'Hide' : 'Show'} Degrees
          </button>
        </div>
      </div>
      <div className={styles.legendItems}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.legendColorPlayable}`} aria-hidden="true"></div>
          <span>In Scale</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.legendColorNotPlayable}`} aria-hidden="true"></div>
          <span>Not In Scale</span>
        </div>
      </div>
    </div>
  )
}
