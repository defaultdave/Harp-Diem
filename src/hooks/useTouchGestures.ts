import { useEffect, useRef, useCallback } from 'react'

export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export interface PinchHandler {
  onPinch?: (scale: number) => void
}

interface TouchPoint {
  x: number
  y: number
}

const SWIPE_THRESHOLD = 50 // Minimum distance for swipe
const SWIPE_VELOCITY = 0.3 // Minimum velocity for swipe
const VERTICAL_THRESHOLD = 30 // Max vertical movement for horizontal swipe
const HORIZONTAL_THRESHOLD = 30 // Max horizontal movement for vertical swipe

export const useTouchGestures = (
  elementRef: React.RefObject<HTMLElement | null>,
  swipeHandlers: SwipeHandlers,
  pinchHandler?: PinchHandler
) => {
  const touchStart = useRef<TouchPoint | null>(null)
  const touchEnd = useRef<TouchPoint | null>(null)
  const touchStartTime = useRef<number>(0)
  const initialPinchDistance = useRef<number>(0)
  const currentScale = useRef<number>(1)

  const getTouchPoint = useCallback((touch: Touch): TouchPoint => {
    return { x: touch.clientX, y: touch.clientY }
  }, [])

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = getTouchPoint(e.touches[0])
        touchEnd.current = null
        touchStartTime.current = Date.now()
      } else if (e.touches.length === 2 && pinchHandler) {
        // Pinch start
        initialPinchDistance.current = getDistance(e.touches[0], e.touches[1])
      }
    },
    [getTouchPoint, getDistance, pinchHandler]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchEnd.current = getTouchPoint(e.touches[0])
      } else if (e.touches.length === 2 && pinchHandler && initialPinchDistance.current > 0) {
        // Pinch zoom
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / initialPinchDistance.current
        currentScale.current = scale
        pinchHandler.onPinch?.(scale)
        
        // Prevent default to stop scrolling during pinch
        e.preventDefault()
      }
    },
    [getTouchPoint, getDistance, pinchHandler]
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) {
      // Reset pinch
      initialPinchDistance.current = 0
      currentScale.current = 1
      return
    }

    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    const deltaTime = Date.now() - touchStartTime.current
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const velocity = Math.max(absX, absY) / deltaTime

    // Determine if it's a horizontal or vertical swipe
    if (absX > absY) {
      // Horizontal swipe
      if (absX > SWIPE_THRESHOLD && absY < VERTICAL_THRESHOLD && velocity > SWIPE_VELOCITY) {
        if (deltaX > 0) {
          swipeHandlers.onSwipeRight?.()
        } else {
          swipeHandlers.onSwipeLeft?.()
        }
      }
    } else {
      // Vertical swipe
      if (absY > SWIPE_THRESHOLD && absX < HORIZONTAL_THRESHOLD && velocity > SWIPE_VELOCITY) {
        if (deltaY > 0) {
          swipeHandlers.onSwipeDown?.()
        } else {
          swipeHandlers.onSwipeUp?.()
        }
      }
    }

    // Reset
    touchStart.current = null
    touchEnd.current = null
    initialPinchDistance.current = 0
    currentScale.current = 1
  }, [swipeHandlers])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd])
}
