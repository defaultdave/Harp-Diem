/**
 * @packageDocumentation
 * Theme management hook for light/dark mode switching.
 *
 * @category Hooks
 */
import { useState, useEffect } from 'react'

/**
 * Available theme options.
 */
type Theme = 'light' | 'dark'

/** localStorage key for persisting theme preference */
const THEME_STORAGE_KEY = 'harp-diem-theme'

/**
 * Gets the system's preferred color scheme.
 * @returns The system theme preference, or 'light' if unavailable
 * @internal
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Gets the initial theme from localStorage or system preference.
 * @returns The initial theme to use
 * @internal
 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  // Fall back to system preference
  return getSystemTheme()
}

/**
 * Hook for managing the application's color theme (light/dark mode).
 *
 * @remarks
 * This hook handles:
 * - Initial theme detection from localStorage or system preference
 * - Persisting theme changes to localStorage
 * - Applying the theme via the `data-theme` attribute on `<html>`
 * - Listening for system theme changes (only if no manual preference set)
 *
 * The theme is applied by setting `data-theme="light"` or `data-theme="dark"`
 * on the document root. CSS custom properties in `variables.css` respond to
 * this attribute to apply the appropriate colors.
 *
 * @returns Object with current theme and toggle function
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, toggleTheme } = useTheme()
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current: {theme}
 *     </button>
 *   )
 * }
 * ```
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme)
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only sync if user hasn't manually set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
