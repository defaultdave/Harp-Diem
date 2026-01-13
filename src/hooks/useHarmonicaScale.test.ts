import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHarmonicaScale } from './useHarmonicaScale'

describe('useHarmonicaScale', () => {
  describe('Hook Structure', () => {
    it('returns correct structure with all expected properties', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

      expect(result.current).toHaveProperty('harmonica')
      expect(result.current).toHaveProperty('scaleNotes')
      expect(result.current).toHaveProperty('playableHoles')
      expect(result.current).toHaveProperty('playableBlowHoles')
      expect(result.current).toHaveProperty('playableDrawHoles')
      expect(result.current).toHaveProperty('allHoles')
    })
  })

  describe('Harmonica Selection', () => {
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

    it('works with enharmonic equivalent keys', () => {
      const { result: dbResult } = renderHook(() => useHarmonicaScale('Db', 'Db', 'major'))
      const { result: fSharpResult } = renderHook(() => useHarmonicaScale('F#', 'F#', 'major'))

      expect(dbResult.current.harmonica).toBeDefined()
      expect(fSharpResult.current.harmonica).toBeDefined()
      expect(dbResult.current.harmonica.holes).toHaveLength(10)
      expect(fSharpResult.current.harmonica.holes).toHaveLength(10)
    })

    it('returns harmonicas with 10 holes for all keys', () => {
      const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Db', 'Eb', 'F#', 'Ab', 'Bb'] as const

      keys.forEach((key) => {
        const { result } = renderHook(() => useHarmonicaScale(key, 'C', 'major'))
        expect(result.current.harmonica.holes).toHaveLength(10)
      })
    })
  })

  describe('Scale Notes', () => {
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
      expect(result.current.scaleNotes).toHaveLength(7)
    })

    it('returns different scale notes for different scale types', () => {
      const { result: majorResult } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { result: minorResult } = renderHook(() => useHarmonicaScale('C', 'C', 'minor'))
      const { result: bluesResult } = renderHook(() => useHarmonicaScale('C', 'C', 'blues'))

      expect(majorResult.current.scaleNotes).not.toEqual(minorResult.current.scaleNotes)
      expect(majorResult.current.scaleNotes).not.toEqual(bluesResult.current.scaleNotes)
      expect(bluesResult.current.scaleNotes.length).toBeLessThan(majorResult.current.scaleNotes.length)
    })

    it('returns different scale notes for different song keys', () => {
      const { result: cMajor } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { result: gMajor } = renderHook(() => useHarmonicaScale('C', 'G', 'major'))

      expect(cMajor.current.scaleNotes).not.toEqual(gMajor.current.scaleNotes)
      expect(gMajor.current.scaleNotes).toContain('G')
      expect(gMajor.current.scaleNotes).toContain('F#')
    })

    it('scale notes are not duplicated', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const uniqueNotes = new Set(result.current.scaleNotes)
      expect(uniqueNotes.size).toBe(result.current.scaleNotes.length)
    })
  })

  describe('Playable Blow Holes', () => {
    it('correctly identifies playable blow holes', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

      expect(result.current.playableBlowHoles.length).toBeGreaterThan(0)
      result.current.playableBlowHoles.forEach((hole) => {
        expect(hole).toBeGreaterThanOrEqual(1)
        expect(hole).toBeLessThanOrEqual(10)
      })
    })

    it('all playable blow holes have notes in scale', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { harmonica, scaleNotes } = result.current

      result.current.playableBlowHoles.forEach((holeNum) => {
        const hole = harmonica.holes.find((h) => h.hole === holeNum)
        expect(hole).toBeDefined()
        // The blow note (without octave) should match a scale note
        const blowNoteBase = hole!.blow.note.replace(/\d+$/, '')
        const isInScale = scaleNotes.some((n) => n.startsWith(blowNoteBase))
        expect(isInScale).toBe(true)
      })
    })

    it('playable blow holes are sorted', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { playableBlowHoles } = result.current

      for (let i = 0; i < playableBlowHoles.length - 1; i++) {
        expect(playableBlowHoles[i]).toBeLessThanOrEqual(playableBlowHoles[i + 1])
      }
    })
  })

  describe('Playable Draw Holes', () => {
    it('correctly identifies playable draw holes', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

      expect(result.current.playableDrawHoles.length).toBeGreaterThan(0)
      result.current.playableDrawHoles.forEach((hole) => {
        expect(hole).toBeGreaterThanOrEqual(1)
        expect(hole).toBeLessThanOrEqual(10)
      })
    })

    it('all playable draw holes have notes in scale', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { harmonica, scaleNotes } = result.current

      result.current.playableDrawHoles.forEach((holeNum) => {
        const hole = harmonica.holes.find((h) => h.hole === holeNum)
        expect(hole).toBeDefined()
        // The draw note (without octave) should match a scale note
        const drawNoteBase = hole!.draw.note.replace(/\d+$/, '')
        const isInScale = scaleNotes.some((n) => n.startsWith(drawNoteBase))
        expect(isInScale).toBe(true)
      })
    })

    it('playable draw holes are sorted', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { playableDrawHoles } = result.current

      for (let i = 0; i < playableDrawHoles.length - 1; i++) {
        expect(playableDrawHoles[i]).toBeLessThanOrEqual(playableDrawHoles[i + 1])
      }
    })
  })

  describe('All Playable Holes', () => {
    it('playable holes is union of blow and draw holes without duplicates', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

      const { playableHoles, playableBlowHoles, playableDrawHoles } = result.current

      playableBlowHoles.forEach((hole) => {
        expect(playableHoles).toContain(hole)
      })

      playableDrawHoles.forEach((hole) => {
        expect(playableHoles).toContain(hole)
      })

      const uniqueHoles = new Set(playableHoles)
      expect(uniqueHoles.size).toBe(playableHoles.length)
    })

    it('playable holes are sorted', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { playableHoles } = result.current

      for (let i = 0; i < playableHoles.length - 1; i++) {
        expect(playableHoles[i]).toBeLessThanOrEqual(playableHoles[i + 1])
      }
    })

    it('playable holes contain only valid hole numbers', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

      result.current.playableHoles.forEach((hole) => {
        expect(hole).toBeGreaterThanOrEqual(1)
        expect(hole).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('All Holes', () => {
    it('allHoles contains all 10 holes', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))

      expect(result.current.allHoles).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('allHoles is consistent across different hooks', () => {
      const { result: result1 } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { result: result2 } = renderHook(() => useHarmonicaScale('D', 'G', 'blues'))

      expect(result1.current.allHoles).toEqual(result2.current.allHoles)
    })
  })

  describe('Scale Type Variations', () => {
    it('handles major scale', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      expect(result.current.scaleNotes.length).toBe(7)
    })

    it('handles minor scale', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'minor'))
      expect(result.current.scaleNotes.length).toBe(7)
    })

    it('handles pentatonic scales', () => {
      const { result: majorPent } = renderHook(() => useHarmonicaScale('C', 'C', 'major pentatonic'))
      const { result: minorPent } = renderHook(() => useHarmonicaScale('C', 'C', 'minor pentatonic'))

      expect(majorPent.current.scaleNotes.length).toBe(5)
      expect(minorPent.current.scaleNotes.length).toBe(5)
      expect(majorPent.current.scaleNotes).not.toEqual(minorPent.current.scaleNotes)
    })

    it('handles blues scale', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'blues'))
      expect(result.current.scaleNotes.length).toBeGreaterThan(0)
    })

    it('handles modal scales', () => {
      const modes = ['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'] as const

      modes.forEach((mode) => {
        const { result } = renderHook(() => useHarmonicaScale('C', 'C', mode))
        expect(result.current.scaleNotes.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Integration Tests', () => {
    it('different harmonicas with same song key may produce different playable holes', () => {
      const { result: cHarm } = renderHook(() => useHarmonicaScale('C', 'F', 'major'))
      const { result: gHarm } = renderHook(() => useHarmonicaScale('G', 'F', 'major'))

      // Different harmonicas with same song key - both should have playable holes but configuration differs
      expect(cHarm.current.playableHoles.length).toBeGreaterThan(0)
      expect(gHarm.current.playableHoles.length).toBeGreaterThan(0)
    })

    it('same harmonica with different song keys produces different playable holes', () => {
      const { result: cSong } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { result: dSong } = renderHook(() => useHarmonicaScale('C', 'D', 'major'))

      expect(cSong.current.playableHoles).not.toEqual(dSong.current.playableHoles)
    })

    it('same harmonica and key with different scales produces different playable holes', () => {
      const { result: major } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { result: minor } = renderHook(() => useHarmonicaScale('C', 'C', 'minor'))

      expect(major.current.playableHoles).not.toEqual(minor.current.playableHoles)
    })
  })

  describe('Edge Cases', () => {
    it('handles song key with sharps correctly', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'D', 'major'))
      expect(result.current.scaleNotes).toContain('D')
      expect(result.current.scaleNotes).toContain('F#')
    })

    it('handles song key with flats correctly', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'F', 'major'))
      expect(result.current.scaleNotes).toContain('F')
      expect(result.current.scaleNotes).toContain('Bb')
    })

    it('playable holes may overlap between blow and draw', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { playableBlowHoles, playableDrawHoles, playableHoles } = result.current

      // Check if there's overlap
      const overlap = playableBlowHoles.filter((h) => playableDrawHoles.includes(h))
      const totalUnique = new Set([...playableBlowHoles, ...playableDrawHoles]).size

      // playableHoles should equal the total unique holes
      expect(playableHoles.length).toBe(totalUnique)

      // If there's overlap, total should be less than sum
      if (overlap.length > 0) {
        expect(totalUnique).toBeLessThan(playableBlowHoles.length + playableDrawHoles.length)
      }
    })
  })
})
