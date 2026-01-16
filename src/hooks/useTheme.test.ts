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
})
