/**
 * @packageDocumentation
 * Hooks barrel file - exports all custom React hooks.
 *
 * Available hooks:
 * - **useHarmonicaScale**: Combines harmonica data with scale selection
 * - **useTheme**: Manages light/dark theme switching
 * - **useHashRouter**: Simple hash-based client-side routing
 * - **useMobileDetection**: Detects mobile devices for rotate overlay
 *
 * @category Hooks
 */
export { useHarmonicaScale, type UseHarmonicaScaleResult } from './useHarmonicaScale'
export { useTheme } from './useTheme'
export { useHashRouter, type Route } from './useHashRouter'
export { useMobileDetection } from './useMobileDetection'
