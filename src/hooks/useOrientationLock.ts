import { useState, useCallback, useEffect } from 'react'

// TODO(refactor): Extract types to separate file
// Extend ScreenOrientation to include lock method (not in all TypeScript libs)
type OrientationLockTypeCustom = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'

interface ScreenOrientationWithLock extends ScreenOrientation {
  lock(orientation: OrientationLockTypeCustom): Promise<void>
}

// Webkit-prefixed fullscreen methods
interface WebkitElement extends Element {
  webkitRequestFullscreen?: () => Promise<void>
}

interface WebkitDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>
}

interface OrientationLockState {
  isFullscreen: boolean
  isLocked: boolean
  isSupported: boolean
  error: string | null
}

// TODO(refactor): Add proper platform detection utility
function detectSupport(): { fullscreen: boolean; orientationLock: boolean } {
  // Check if we're in a browser environment
  if (typeof document === 'undefined' || typeof screen === 'undefined') {
    return { fullscreen: false, orientationLock: false }
  }

  const fullscreen =
    'requestFullscreen' in document.documentElement ||
    'webkitRequestFullscreen' in document.documentElement

  // Screen Orientation API - check if lock method exists
  // Note: iOS Safari does NOT support screen.orientation.lock
  const orientationLock =
    'orientation' in screen &&
    screen.orientation !== null &&
    'lock' in screen.orientation

  return { fullscreen, orientationLock }
}

// TODO(refactor): Add proper mobile detection utility
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  // Quick and dirty mobile detection - check touch support and screen size
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isNarrow = window.innerWidth < 768

  // Also check user agent for mobile keywords
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  return (hasTouch && isNarrow) || mobileUA
}

// TODO(refactor): Add proper iOS detection
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function useOrientationLock() {
  const [state, setState] = useState<OrientationLockState>(() => {
    const support = detectSupport()
    return {
      isFullscreen: false,
      isLocked: false,
      isSupported: support.fullscreen && support.orientationLock && !isIOS(),
      error: null,
    }
  })

  // Check if currently in fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement
      setState((prev) => ({
        ...prev,
        isFullscreen,
        // If exiting fullscreen, orientation lock is also released
        isLocked: isFullscreen ? prev.isLocked : false,
      }))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const enterFullscreenAndLock = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null }))

    // TODO(refactor): Better error handling with typed errors
    try {
      // Step 1: Request fullscreen (required before orientation lock)
      const elem = document.documentElement as WebkitElement
      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen()
      } else {
        throw new Error('Fullscreen API not supported')
      }

      // Step 2: Lock orientation to landscape
      // Small delay needed for fullscreen to complete on some devices
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as ScreenOrientationWithLock).lock('landscape')
        setState((prev) => ({ ...prev, isFullscreen: true, isLocked: true }))
        console.log('Orientation locked to landscape')
      } else {
        throw new Error('Orientation lock not supported')
      }
    } catch (err) {
      console.error('Orientation lock failed:', err)
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      const doc = document as WebkitDocument
      if (doc.exitFullscreen) {
        await doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      }
      // Orientation lock is automatically released when exiting fullscreen
      setState((prev) => ({ ...prev, isFullscreen: false, isLocked: false, error: null }))
    } catch (err) {
      console.error('Exit fullscreen failed:', err)
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [])

  // TODO(refactor): Consider adding unlock-only function for finer control

  return {
    ...state,
    isMobile: isMobileDevice(),
    isIOS: isIOS(),
    enterFullscreenAndLock,
    exitFullscreen,
  }
}
