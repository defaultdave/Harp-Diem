import { useState, useEffect } from 'react'
import styles from './GestureHints.module.css'

interface GestureHintsProps {
  onDismiss?: () => void
}

export const GestureHints = ({ onDismiss }: GestureHintsProps) => {
  const [isVisible, setIsVisible] = useState(false)
  
  // Check localStorage once on mount
  const getHintsShown = () => {
    try {
      return localStorage.getItem('gestureHintsShown') !== null
    } catch {
      return false
    }
  }
  
  const hasBeenShown = getHintsShown()

  useEffect(() => {
    if (!hasBeenShown) {
      // Show hints after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [hasBeenShown])

  const handleDismiss = () => {
    setIsVisible(false)
    try {
      localStorage.setItem('gestureHintsShown', 'true')
    } catch {
      // Silently fail if localStorage is unavailable
    }
    onDismiss?.()
  }

  const handleShowAgain = () => {
    setIsVisible(true)
  }

  if (!isVisible && hasBeenShown) {
    return (
      <button
        className={styles.showHintsButton}
        onClick={handleShowAgain}
        aria-label="Show gesture hints"
        title="Show gesture hints"
      >
        👆 Gestures
      </button>
    )
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={styles.overlay} onClick={handleDismiss} role="dialog" aria-label="Gesture hints dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleDismiss} aria-label="Close hints">
          ✕
        </button>
        <h3>Touch Gestures</h3>
        <div className={styles.hints}>
          <div className={styles.hint}>
            <span className={styles.icon}>👈👉</span>
            <div className={styles.description}>
              <strong>Swipe Left/Right</strong>
              <p>Change harmonica key</p>
            </div>
          </div>
          <div className={styles.hint}>
            <span className={styles.icon}>👆👇</span>
            <div className={styles.description}>
              <strong>Swipe Up/Down</strong>
              <p>Change scale type</p>
            </div>
          </div>
          <div className={styles.hint}>
            <span className={styles.icon}>🤏</span>
            <div className={styles.description}>
              <strong>Pinch</strong>
              <p>Zoom harmonica diagram</p>
            </div>
          </div>
          <div className={styles.hint}>
            <span className={styles.icon}>👆</span>
            <div className={styles.description}>
              <strong>Tap Note</strong>
              <p>Play sound</p>
            </div>
          </div>
        </div>
        <button className={styles.dismissButton} onClick={handleDismiss}>
          Got it!
        </button>
      </div>
    </div>
  )
}
