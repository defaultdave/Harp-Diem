import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTouchGestures } from './useTouchGestures'
import { useRef } from 'react'

describe('useTouchGestures', () => {
  let mockElement: HTMLDivElement
  let addEventListenerSpy: ReturnType<typeof vi.fn>
  let removeEventListenerSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockElement = document.createElement('div')
    addEventListenerSpy = vi.fn()
    removeEventListenerSpy = vi.fn()
    // Use type assertions to work around strict typing
    mockElement.addEventListener = addEventListenerSpy as unknown as typeof mockElement.addEventListener
    mockElement.removeEventListener = removeEventListenerSpy as unknown as typeof mockElement.removeEventListener
  })

  it('should attach touch event listeners to element', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(mockElement)
      useTouchGestures(ref, {})
      return null
    }

    renderHook(() => TestComponent())

    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true })
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false })
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true })
  })

  it('should remove event listeners on unmount', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(mockElement)
      useTouchGestures(ref, {})
      return null
    }

    const { unmount } = renderHook(() => TestComponent())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
  })

  it('should not attach listeners if element ref is null', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null)
      useTouchGestures(ref, {})
      return null
    }

    renderHook(() => TestComponent())

    expect(addEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should handle swipe handlers being undefined', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(mockElement)
      useTouchGestures(ref, {})
      return null
    }

    expect(() => renderHook(() => TestComponent())).not.toThrow()
  })

  it('should handle pinch handler being undefined', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(mockElement)
      useTouchGestures(ref, {})
      return null
    }

    expect(() => renderHook(() => TestComponent())).not.toThrow()
  })

  it('should accept all gesture handlers', () => {
    const handlers = {
      onSwipeLeft: vi.fn(),
      onSwipeRight: vi.fn(),
      onSwipeUp: vi.fn(),
      onSwipeDown: vi.fn(),
    }

    const pinchHandler = {
      onPinch: vi.fn(),
    }

    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(mockElement)
      useTouchGestures(ref, handlers, pinchHandler)
      return null
    }

    expect(() => renderHook(() => TestComponent())).not.toThrow()
  })
})
