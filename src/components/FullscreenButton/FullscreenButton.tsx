import { useOrientationLock } from '../../hooks/useOrientationLock'
import styles from './FullscreenButton.module.css'

// TODO(refactor): Extract to separate constants file
const FULLSCREEN_ICON = '⛶'
const EXIT_ICON = '✕'

export function FullscreenButton() {
  const {
    isSupported,
    isFullscreen,
    isLocked,
    isMobile,
    isIOS,
    error,
    enterFullscreenAndLock,
    exitFullscreen,
  } = useOrientationLock()

  // Only show on mobile devices where the API is supported
  // Don't show on iOS since it doesn't support orientation lock
  if (!isMobile || !isSupported) {
    // TODO(refactor): Consider showing a tooltip or message explaining why button isn't shown
    console.log('FullscreenButton hidden:', { isMobile, isSupported, isIOS })
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
        aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen landscape mode'}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen + Lock landscape'}
      >
        <span className={styles.icon}>{isFullscreen ? EXIT_ICON : FULLSCREEN_ICON}</span>
        <span className={styles.label}>
          {isFullscreen ? 'Exit' : 'Landscape'}
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
