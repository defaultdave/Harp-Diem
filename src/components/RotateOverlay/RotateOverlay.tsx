import { useEffect, useRef, useState, useCallback } from 'react'
import { useMobileDetection } from '../../hooks/useMobileDetection'
import styles from './RotateOverlay.module.css'

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="92"
        rx="8"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <rect x="20" y="12" width="24" height="60" fill="currentColor" opacity="0.2" />
      <circle cx="32" cy="86" r="4" fill="currentColor" />
    </svg>
  )
}

function RotationArrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 8C12.268 8 6 14.268 6 22c0 3.866 1.575 7.37 4.12 9.88"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 28l4.12 3.88L10 28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 32c7.732 0 14-6.268 14-14 0-3.866-1.575-7.37-4.12-9.88"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M38 12l-4.12-3.88L30 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RotateOverlay() {
  const { shouldShowOverlay, dismissOverlay } = useMobileDetection()
  const [isExiting, setIsExiting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    // Wait for exit animation to complete
    setTimeout(() => {
      dismissOverlay()
      setIsExiting(false)
    }, 200)
  }, [dismissOverlay])

  // Derive visibility from props + exit state
  const isVisible = shouldShowOverlay || isExiting

  // Focus management - move focus to continue button when overlay opens
  useEffect(() => {
    if (shouldShowOverlay && !isExiting) {
      // Save previously focused element
      previousActiveElement.current = document.activeElement
      // Focus the continue button on open
      continueButtonRef.current?.focus()
    }
  }, [shouldShowOverlay, isExiting])

  // Restore focus when overlay closes
  useEffect(() => {
    if (!isVisible && previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [isVisible])

  // Escape key handler
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDismiss()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, handleDismiss])

  // Focus trap - keep Tab cycling within the overlay
  useEffect(() => {
    if (!isVisible) return

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey) {
        // Shift + Tab - go backwards
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab - go forwards
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isVisible])

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isVisible) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isExiting ? styles.overlayExiting : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotate-overlay-heading"
      onClick={(e) => {
        // Dismiss when clicking backdrop (not card)
        if (e.target === overlayRef.current) {
          handleDismiss()
        }
      }}
    >
      <div className={styles.card}>
        <button
          className={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <div className={styles.iconContainer}>
          <PhoneIcon className={styles.phoneIcon} />
          <RotationArrow className={styles.rotationArrow} />
        </div>

        <h2 id="rotate-overlay-heading" className={styles.heading}>
          Rotate Your Phone
        </h2>

        <p className={styles.body}>
          For the best experience, please rotate your device to landscape orientation.
        </p>

        <button
          ref={continueButtonRef}
          className={styles.continueButton}
          onClick={handleDismiss}
        >
          Continue Anyway
        </button>
      </div>
    </div>
  )
}
