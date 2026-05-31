/**
 * Custom React hooks for harmonica state, theming, routing, and device detection.
 * @packageDocumentation
 */
export { useHarmonicaScale, type UseHarmonicaScaleResult } from './useHarmonicaScale'
export { useTheme } from './useTheme'
export { useHashRouter, type Route } from './useHashRouter'
export { useMobileDetection } from './useMobileDetection'
export { useMicrophone, type UseMicrophoneResult } from './useMicrophone'
export { useDeepLinking, parseDeepLinkParams, parseHashQueryParams, buildHashWithParams, type DeepLinkParams } from './useDeepLinking'
export {
  useBendPractice,
  centsBetween,
  HOLD_TOLERANCE_CENTS,
  LASER_TOLERANCE_CENTS,
  HOLD_DURATION_MS,
  type BendPracticePhase,
  type UseBendPracticeResult,
} from './useBendPractice'
