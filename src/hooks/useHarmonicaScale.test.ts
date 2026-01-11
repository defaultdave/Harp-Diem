import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHarmonicaScale } from './useHarmonicaScale'

describe('useHarmonicaScale', () => {
  it('returns correct structure with all expected properties', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    expect(result.current).toHaveProperty('harmonica')
    expect(result.current).toHaveProperty('scaleNotes')
    expect(result.current).toHaveProperty('playableHoles')
    expect(result.current).toHaveProperty('playableBlowHoles')
    expect(result.current).toHaveProperty('playableDrawHoles')
    expect(result.current).toHaveProperty('allHoles')
  })

  it('returns correct harmonica for given key', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    expect(result.current.harmonica.key).toBe('C')
    expect(result.current.harmonica.holes).toHaveLength(10)
  })

  it('returns different harmonica when key changes', () => {
    const { result: resultC } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
    const { result: resultG } = renderHook(() => useHarmonicaScale('G', 'C', 'major'))

    expect(resultC.current.harmonica.key).toBe('C')
    expect(resultG.current.harmonica.key).toBe('G')
    expect(resultC.current.harmonica.holes[0].blow.note).not.toBe(
      resultG.current.harmonica.holes[0].blow.note
    )
  })

  it('returns correct scale notes for key and scale type', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    // C major scale should contain C, D, E, F, G, A, B
    expect(result.current.scaleNotes).toContain('C')
    expect(result.current.scaleNotes).toContain('D')
    expect(result.current.scaleNotes).toContain('E')
    expect(result.current.scaleNotes).toContain('F')
    expect(result.current.scaleNotes).toContain('G')
    expect(result.current.scaleNotes).toContain('A')
    expect(result.current.scaleNotes).toContain('B')
  })

  it('correctly identifies playable blow holes', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    // On a C harmonica, blow notes are C, E, G (holes 1,4,7,10 for C; 2,5,8 for E; 3,6,9 for G)
    // All blow notes on C harmonica are in C major scale
    expect(result.current.playableBlowHoles.length).toBeGreaterThan(0)
    result.current.playableBlowHoles.forEach((hole) => {
      expect(hole).toBeGreaterThanOrEqual(1)
      expect(hole).toBeLessThanOrEqual(10)
    })
  })

  it('correctly identifies playable draw holes', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    // On a C harmonica, draw notes are D, G, B, D, F, A, B, D, F, A
    // D, G, B, F, A are all in C major
    expect(result.current.playableDrawHoles.length).toBeGreaterThan(0)
    result.current.playableDrawHoles.forEach((hole) => {
      expect(hole).toBeGreaterThanOrEqual(1)
      expect(hole).toBeLessThanOrEqual(10)
    })
  })

  it('playable holes is union of blow and draw holes without duplicates', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    const { playableHoles, playableBlowHoles, playableDrawHoles } = result.current

    // All blow holes should be in playable holes
    playableBlowHoles.forEach((hole) => {
      expect(playableHoles).toContain(hole)
    })

    // All draw holes should be in playable holes
    playableDrawHoles.forEach((hole) => {
      expect(playableHoles).toContain(hole)
    })

    // No duplicates
    const uniqueHoles = new Set(playableHoles)
    expect(uniqueHoles.size).toBe(playableHoles.length)
  })

  it('allHoles contains all 10 holes', () => {
    const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

    expect(result.current.allHoles).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('handles different scale types', () => {
    const { result: majorResult } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
    const { result: minorResult } = renderHook(() => useHarmonicaScale('C', 'C', 'minor'))
    const { result: bluesResult } = renderHook(() => useHarmonicaScale('C', 'C', 'blues'))

    // Different scales should have different notes
    expect(majorResult.current.scaleNotes).not.toEqual(minorResult.current.scaleNotes)
    expect(majorResult.current.scaleNotes).not.toEqual(bluesResult.current.scaleNotes)

    // Blues scale has fewer notes than major
    expect(bluesResult.current.scaleNotes.length).toBeLessThan(
      majorResult.current.scaleNotes.length
    )
  })

  it('handles different song keys', () => {
    const { result: cMajor } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
    const { result: gMajor } = renderHook(() => useHarmonicaScale('C', 'G', 'major'))

    // Same harmonica, different song key = different scale notes
    expect(cMajor.current.scaleNotes).not.toEqual(gMajor.current.scaleNotes)
    expect(gMajor.current.scaleNotes).toContain('G')
    expect(gMajor.current.scaleNotes).toContain('F#')
  })
})
