import { useOrientationLock } from '../../hooks/useOrientationLock'
import styles from './FullscreenButton.module.css'

// TODO(refactor): Extract to separate constants file
const FULLSCREEN_ICON = '⛶'
const EXIT_ICON = '✕'

export function FullscreenButton() {
  const {
    isFullscreen,
    isLocked,
    shouldShowButton,
    error,
    enterFullscreenAndLock,
    exitFullscreen,
  } = useOrientationLock()

  // Show on any narrow screen where fullscreen is supported
  if (!shouldShowButton) {
    return null
  }

  const handleClick = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreenAndLock()
    }
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${isFullscreen ? styles.active : ''}`}
        onClick={handleClick}
        aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        <span className={styles.icon}>{isFullscreen ? EXIT_ICON : FULLSCREEN_ICON}</span>
        <span className={styles.label}>
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </span>
      </button>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {isLocked && (
        <div className={styles.status}>
          Locked to landscape
        </div>
      )}
    </div>
  )
}
