import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('Initial Theme', () => {
    it('defaults to light theme when no preference is stored', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })

    it('uses stored theme from localStorage', () => {
      localStorage.setItem('harp-diem-theme', 'dark')
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')
    })

    it('respects system dark mode preference when no stored preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')
    })

    it('prefers stored theme over system preference', () => {
      localStorage.setItem('harp-diem-theme', 'light')
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')
    })
  })

  describe('Theme Toggle', () => {
    it('toggles from light to dark', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
    })

    it('toggles from dark to light', () => {
      localStorage.setItem('harp-diem-theme', 'dark')
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
    })

    it('toggles multiple times correctly', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')
    })
  })

  describe('DOM Updates', () => {
    it('sets data-theme attribute on document root', () => {
      renderHook(() => useTheme())
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('updates data-theme attribute when theme changes', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('LocalStorage Persistence', () => {
    it('saves theme to localStorage', () => {
      renderHook(() => useTheme())
      expect(localStorage.getItem('harp-diem-theme')).toBe('light')
    })

    it('updates localStorage when theme changes', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })

      expect(localStorage.getItem('harp-diem-theme')).toBe('dark')
    })

    it('persists theme across hook instances', () => {
      const { result: firstInstance } = renderHook(() => useTheme())
      
      act(() => {
        firstInstance.current.toggleTheme()
      })

      // Create a new instance
      const { result: secondInstance } = renderHook(() => useTheme())
      expect(secondInstance.current.theme).toBe('dark')
    })
  })

  describe('Return Value', () => {
    it('returns current theme and toggle function', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current).toHaveProperty('theme')
      expect(result.current).toHaveProperty('toggleTheme')
      expect(typeof result.current.toggleTheme).toBe('function')
    })
  })

  describe('System Preference Sync', () => {
    it('syncs theme when system preference changes and no stored preference', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((event, handler) => {
            if (event === 'change') {
              changeHandler = handler
            }
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')

      // Clear localStorage to simulate no stored preference
      localStorage.clear()

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent)
        }
      })

      expect(result.current.theme).toBe('dark')
    })

    it('does not sync theme when system preference changes but stored preference exists', () => {
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((event, handler) => {
            if (event === 'change') {
              changeHandler = handler
            }
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('light')

      // localStorage should have 'light' stored from the initial render
      expect(localStorage.getItem('harp-diem-theme')).toBe('light')

      // Simulate system preference change to dark
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent)
        }
      })

      // Theme should remain light because stored preference exists
      expect(result.current.theme).toBe('light')
    })

    it('cleans up event listener on unmount', () => {
      const removeEventListenerMock = vi.fn()

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: removeEventListenerMock,
          dispatchEvent: vi.fn(),
        })),
      })

      const { unmount } = renderHook(() => useTheme())
      unmount()

      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
