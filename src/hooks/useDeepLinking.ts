/**
 * Deep linking hook for URL query param sync with harmonica state.
 * Reads and writes harpKey, songKey, scale, and tuning as query params
 * on the hash URL (e.g. /#/?harpKey=G&songKey=D&scale=blues).
 * @packageDocumentation
 */
import { useCallback } from 'react'
import type { HarmonicaKey, ScaleType, TuningType } from '../data'
import { AVAILABLE_KEYS, SCALE_TYPES, TUNING_TYPES } from '../data'

export interface DeepLinkParams {
  harpKey: HarmonicaKey
  songKey: HarmonicaKey
  scaleType: ScaleType
  tuning: TuningType
}

const DEFAULTS: DeepLinkParams = {
  harpKey: 'C',
  songKey: 'C',
  scaleType: 'major',
  tuning: 'richter',
}

/**
 * Parses query params from a hash URL string.
 * Hash URLs look like: #/path?key=value&key2=value2
 * The query portion comes after the '?' in the hash.
 */
export function parseHashQueryParams(hash: string): URLSearchParams {
  const questionIdx = hash.indexOf('?')
  if (questionIdx === -1) return new URLSearchParams()
  return new URLSearchParams(hash.slice(questionIdx + 1))
}

/**
 * Validates and returns a HarmonicaKey, falling back to default if invalid.
 */
function validateHarmonicaKey(value: string | null, defaultVal: HarmonicaKey): HarmonicaKey {
  if (value && (AVAILABLE_KEYS as readonly string[]).includes(value)) {
    return value as HarmonicaKey
  }
  return defaultVal
}

/**
 * Validates and returns a ScaleType, falling back to default if invalid.
 */
function validateScaleType(value: string | null, defaultVal: ScaleType): ScaleType {
  if (value && (SCALE_TYPES as readonly string[]).includes(value)) {
    return value as ScaleType
  }
  return defaultVal
}

/**
 * Validates and returns a TuningType, falling back to default if invalid.
 */
function validateTuningType(value: string | null, defaultVal: TuningType): TuningType {
  if (value && (TUNING_TYPES as readonly string[]).includes(value)) {
    return value as TuningType
  }
  return defaultVal
}

/**
 * Parses and validates deep link params from the current hash URL.
 * Invalid or missing params silently fall back to defaults.
 */
export function parseDeepLinkParams(): DeepLinkParams {
  const params = parseHashQueryParams(window.location.hash)

  return {
    harpKey: validateHarmonicaKey(params.get('harpKey'), DEFAULTS.harpKey),
    songKey: validateHarmonicaKey(params.get('songKey'), DEFAULTS.songKey),
    scaleType: validateScaleType(params.get('scale'), DEFAULTS.scaleType),
    tuning: validateTuningType(params.get('tuning'), DEFAULTS.tuning),
  }
}

/**
 * Builds an updated hash string preserving the path portion while replacing query params.
 * e.g. '#/' + '?harpKey=G&songKey=D' → '#/?harpKey=G&songKey=D'
 */
export function buildHashWithParams(params: DeepLinkParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('harpKey', params.harpKey)
  searchParams.set('songKey', params.songKey)
  searchParams.set('scale', params.scaleType)
  searchParams.set('tuning', params.tuning)

  // Preserve path (e.g. '/'), strip existing query
  const hash = window.location.hash || '#/'
  const pathPart = hash.slice(1).split('?')[0] || '/'
  return `#${pathPart}?${searchParams.toString()}`
}

/**
 * Hook providing deep link param parsing (initial values) and URL update function.
 *
 * Usage:
 * ```tsx
 * const { initialParams, updateURL } = useDeepLinking()
 * const [harpKey, setHarpKey] = useState(initialParams.harpKey)
 * // on change:
 * updateURL({ harpKey, songKey, scaleType, tuning })
 * ```
 */
export function useDeepLinking() {
  const updateURL = useCallback((params: DeepLinkParams) => {
    const newHash = buildHashWithParams(params)
    // Use replaceState to avoid polluting browser history on every keystroke
    const newURL = window.location.pathname + window.location.search + newHash
    window.history.replaceState(null, '', newURL)
  }, [])

  return {
    initialParams: parseDeepLinkParams(),
    updateURL,
  }
}
