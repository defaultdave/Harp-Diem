import { useState, useCallback, useMemo, useSyncExternalStore } from 'react'

const BREAKPOINT_WIDTH = 525
const SESSION_STORAGE_KEY = 'rotateOverlayDismissed'

interface NavigatorUAData {
  mobile?: boolean
}

declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData
  }
}

/**
 * Detects if the current device is a mobile device using
 * modern User-Agent Client Hints API with fallback to UA string
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  // Modern approach using User-Agent Client Hints
  if (navigator.userAgentData?.mobile) return true

  // Fallback to user agent string
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

function getSessionDismissed(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function setSessionDismissed(): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
  } catch {
    // Ignore storage errors (e.g., private browsing mode)
  }
}

// Viewport state store for useSyncExternalStore
function subscribeToViewport(callback: () => void) {
  window.addEventListener('resize', callback)
  window.addEventListener('orientationchange', callback)
  return () => {
    window.removeEventListener('resize', callback)
    window.removeEventListener('orientationchange', callback)
  }
}

function getViewportSnapshot() {
  return {
    isPortrait: window.innerHeight > window.innerWidth,
    isNarrow: window.innerWidth < BREAKPOINT_WIDTH,
  }
}

function getServerSnapshot() {
  return {
    isPortrait: false,
    isNarrow: false,
  }
}

// Cache to ensure stable reference for useSyncExternalStore
let cachedSnapshot = getViewportSnapshot()
let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0
let lastHeight = typeof window !== 'undefined' ? window.innerHeight : 0

function getStableViewportSnapshot() {
  const currentWidth = window.innerWidth
  const currentHeight = window.innerHeight

  // Only create new object if dimensions changed
  if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
    lastWidth = currentWidth
    lastHeight = currentHeight
    cachedSnapshot = getViewportSnapshot()
  }

  return cachedSnapshot
}

export interface UseMobileDetectionResult {
  /** Whether the rotate overlay should be shown */
  shouldShowOverlay: boolean
  /** Dismiss the overlay (persists in sessionStorage) */
  dismissOverlay: () => void
  /** Whether the device is detected as mobile */
  isMobile: boolean
  /** Whether the device is in portrait orientation */
  isPortrait: boolean
}

/**
 * Hook to detect mobile devices in portrait orientation with narrow viewports.
 * Used to show a rotate phone overlay prompting landscape orientation.
 */
export function useMobileDetection(): UseMobileDetectionResult {
  const [isDismissed, setIsDismissed] = useState(getSessionDismissed)

  // Mobile detection is stable - only computed once
  const isMobile = useMemo(() => isMobileDevice(), [])

  // Subscribe to viewport changes using React 18's useSyncExternalStore
  const { isPortrait, isNarrow } = useSyncExternalStore(
    subscribeToViewport,
    getStableViewportSnapshot,
    getServerSnapshot
  )

  const dismissOverlay = useCallback(() => {
    setIsDismissed(true)
    setSessionDismissed()
  }, [])

  const shouldShowOverlay = isMobile && isNarrow && isPortrait && !isDismissed

  return {
    shouldShowOverlay,
    dismissOverlay,
    isMobile,
    isPortrait,
  }
}
