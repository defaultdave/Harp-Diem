/**
 * Unit tests for useDeepLinking hook utilities.
 * Tests param parsing, validation, and URL building.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { parseHashQueryParams, parseDeepLinkParams, buildHashWithParams } from './useDeepLinking'
import type { DeepLinkParams } from './useDeepLinking'

// Helper to set window.location.hash without triggering navigation
function setHash(hash: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, hash },
    writable: true,
    configurable: true,
  })
}

describe('parseHashQueryParams', () => {
  it('returns empty params for a hash with no query string', () => {
    const params = parseHashQueryParams('#/')
    expect(params.get('harpKey')).toBeNull()
  })

  it('returns empty params for an empty string', () => {
    const params = parseHashQueryParams('')
    expect(params.get('harpKey')).toBeNull()
  })

  it('parses a single param', () => {
    const params = parseHashQueryParams('#/?harpKey=G')
    expect(params.get('harpKey')).toBe('G')
  })

  it('parses multiple params', () => {
    const params = parseHashQueryParams('#/?harpKey=G&songKey=D&scale=blues&tuning=country')
    expect(params.get('harpKey')).toBe('G')
    expect(params.get('songKey')).toBe('D')
    expect(params.get('scale')).toBe('blues')
    expect(params.get('tuning')).toBe('country')
  })

  it('handles quiz route with no params', () => {
    const params = parseHashQueryParams('#/quiz')
    expect(params.get('harpKey')).toBeNull()
  })
})

describe('parseDeepLinkParams', () => {
  const originalLocation = window.location

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  it('returns defaults when hash has no query params', () => {
    setHash('#/')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('C')
    expect(params.songKey).toBe('C')
    expect(params.scaleType).toBe('major')
    expect(params.tuning).toBe('richter')
  })

  it('parses valid harpKey from URL', () => {
    setHash('#/?harpKey=G')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('G')
  })

  it('parses valid songKey from URL', () => {
    setHash('#/?songKey=D')
    const params = parseDeepLinkParams()
    expect(params.songKey).toBe('D')
  })

  it('parses valid scale from URL', () => {
    setHash('#/?scale=blues')
    const params = parseDeepLinkParams()
    expect(params.scaleType).toBe('blues')
  })

  it('parses valid tuning from URL', () => {
    setHash('#/?tuning=country')
    const params = parseDeepLinkParams()
    expect(params.tuning).toBe('country')
  })

  it('parses all four params at once', () => {
    setHash('#/?harpKey=G&songKey=D&scale=blues&tuning=country')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('G')
    expect(params.songKey).toBe('D')
    expect(params.scaleType).toBe('blues')
    expect(params.tuning).toBe('country')
  })

  it('silently falls back to default for invalid harpKey', () => {
    setHash('#/?harpKey=INVALID')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('C')
  })

  it('silently falls back to default for invalid songKey', () => {
    setHash('#/?songKey=X')
    const params = parseDeepLinkParams()
    expect(params.songKey).toBe('C')
  })

  it('silently falls back to default for invalid scale', () => {
    setHash('#/?scale=not-a-scale')
    const params = parseDeepLinkParams()
    expect(params.scaleType).toBe('major')
  })

  it('silently falls back to default for invalid tuning', () => {
    setHash('#/?tuning=weird-tuning')
    const params = parseDeepLinkParams()
    expect(params.tuning).toBe('richter')
  })

  it('uses defaults for omitted params while applying valid ones', () => {
    setHash('#/?harpKey=A')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('A')
    expect(params.songKey).toBe('C')      // default
    expect(params.scaleType).toBe('major') // default
    expect(params.tuning).toBe('richter')  // default
  })

  it('handles flat key correctly (Bb)', () => {
    setHash('#/?harpKey=Bb&songKey=Eb')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('Bb')
    expect(params.songKey).toBe('Eb')
  })

  it('handles sharp key correctly (F#)', () => {
    setHash('#/?harpKey=F%23')
    const params = parseDeepLinkParams()
    expect(params.harpKey).toBe('F#')
  })

  it('handles multi-word scale types (harmonic minor)', () => {
    setHash('#/?scale=harmonic+minor')
    const params = parseDeepLinkParams()
    expect(params.scaleType).toBe('harmonic minor')
  })

  it('handles paddy-richter tuning', () => {
    setHash('#/?tuning=paddy-richter')
    const params = parseDeepLinkParams()
    expect(params.tuning).toBe('paddy-richter')
  })
})

describe('buildHashWithParams', () => {
  const originalLocation = window.location

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  it('builds a hash string with all four params', () => {
    setHash('#/')
    const params: DeepLinkParams = {
      harpKey: 'G',
      songKey: 'D',
      scaleType: 'blues',
      tuning: 'country',
    }
    const result = buildHashWithParams(params)
    expect(result).toContain('harpKey=G')
    expect(result).toContain('songKey=D')
    expect(result).toContain('scale=blues')
    expect(result).toContain('tuning=country')
    expect(result).toMatch(/^#\/\?/)
  })

  it('preserves path as root /', () => {
    setHash('#/')
    const params: DeepLinkParams = {
      harpKey: 'C',
      songKey: 'C',
      scaleType: 'major',
      tuning: 'richter',
    }
    const result = buildHashWithParams(params)
    expect(result).toMatch(/^#\/\?/)
  })

  it('replaces existing query params rather than appending', () => {
    setHash('#/?harpKey=A&songKey=E')
    const params: DeepLinkParams = {
      harpKey: 'G',
      songKey: 'D',
      scaleType: 'major',
      tuning: 'richter',
    }
    const result = buildHashWithParams(params)
    // Should only contain G, not A
    const searchStr = result.split('?')[1]
    const parsed = new URLSearchParams(searchStr)
    expect(parsed.get('harpKey')).toBe('G')
    expect(parsed.get('songKey')).toBe('D')
  })
})
