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
      expect(result.current).toHaveProperty('missingNotes')
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

  describe('Alternate Tunings', () => {
    it('accepts tuning parameter and returns correct harmonica', () => {
      const { result: richter } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'richter'))
      const { result: paddy } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'paddy-richter'))

      expect(richter.current.harmonica.holes[2].blow.note).toBe('G4')
      expect(paddy.current.harmonica.holes[2].blow.note).toBe('A4')
    })

    it('defaults to richter tuning when not specified', () => {
      const { result: withDefault } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      const { result: explicit } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'richter'))

      expect(withDefault.current.harmonica.holes[2].blow.note).toBe(
        explicit.current.harmonica.holes[2].blow.note
      )
    })

    it('calculates playable holes correctly for alternate tunings', () => {
      // With Paddy Richter, hole 3 blow is A instead of G
      // In C major scale, both G and A are in scale, so playability similar
      const { result: richter } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'richter'))
      const { result: paddy } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'paddy-richter'))

      // Both should have playable blow holes
      expect(richter.current.playableBlowHoles.length).toBeGreaterThan(0)
      expect(paddy.current.playableBlowHoles.length).toBeGreaterThan(0)
    })

    it('natural minor tuning works with minor scales', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'minor', 'natural-minor'))

      // Natural minor tuning should have Eb and Bb which are in C minor scale
      expect(result.current.harmonica.holes[1].blow.note).toBe('Eb4')
      expect(result.current.scaleNotes).toContain('Eb')
      expect(result.current.playableBlowHoles).toContain(2) // Hole 2 blow is Eb, in C minor
    })

    it('country tuning has different playable holes for major scale', () => {
      const { result: richter } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'richter'))
      const { result: country } = renderHook(() => useHarmonicaScale('C', 'C', 'major', 'country'))

      // Hole 5 draw: F in richter (in C major), F# in country (not in C major)
      // So richter should have hole 5 in playable draw, country should not
      expect(richter.current.playableDrawHoles).toContain(5)
      expect(country.current.playableDrawHoles).not.toContain(5)
    })

    it('works with all tuning types', () => {
      const tunings = ['richter', 'paddy-richter', 'natural-minor', 'country', 'melody-maker'] as const

      tunings.forEach((tuning) => {
        const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major', tuning))
        expect(result.current.harmonica).toBeDefined()
        expect(result.current.harmonica.holes).toHaveLength(10)
        expect(result.current.scaleNotes.length).toBe(7)
      })
    })
  })

  describe('Missing Notes', () => {
    it('returns empty array when all scale notes are available', () => {
      // C harmonica + C Major scale - all notes should be available
      const { result } = renderHook(() => useHarmonicaScale('C', 'C', 'major'))
      expect(result.current.missingNotes).toEqual([])
    })

    it('identifies missing notes correctly when scale requires unavailable notes', () => {
      // Test with a scale that might have missing notes
      // We'll verify the function works correctly regardless of whether notes are missing
      const { result } = renderHook(() => useHarmonicaScale('C', 'F#', 'major'))
      
      // F# major has C#, D#, E#, F#, G#, A#, B#
      // Verify missingNotes is an array and makes sense
      expect(Array.isArray(result.current.missingNotes)).toBe(true)
      
      // Each missing note should be in the scale notes
      result.current.missingNotes.forEach((note) => {
        expect(result.current.scaleNotes).toContain(note)
      })
    })

    it('missing notes are subset of scale notes', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'B', 'locrian'))
      result.current.missingNotes.forEach((note) => {
        expect(result.current.scaleNotes).toContain(note)
      })
    })

    it('missing notes do not include available notes', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'B', 'locrian'))
      const { harmonica, missingNotes, scaleNotes } = result.current
      
      // Collect all available notes
      const availableNotes = new Set<string>()
      harmonica.holes.forEach((hole) => {
        availableNotes.add(hole.blow.note)
        availableNotes.add(hole.draw.note)
        if (hole.blowBends?.halfStepBend) availableNotes.add(hole.blowBends.halfStepBend.note)
        if (hole.blowBends?.wholeStepBend) availableNotes.add(hole.blowBends.wholeStepBend.note)
        if (hole.drawBends?.halfStepBend) availableNotes.add(hole.drawBends.halfStepBend.note)
        if (hole.drawBends?.wholeStepBend) availableNotes.add(hole.drawBends.wholeStepBend.note)
        if (hole.drawBends?.minorThirdBend) availableNotes.add(hole.drawBends.minorThirdBend.note)
        if (hole.overblow) availableNotes.add(hole.overblow.note)
        if (hole.overdraw) availableNotes.add(hole.overdraw.note)
      })
      
      // Check that no missing note is actually available (considering enharmonics)
      missingNotes.forEach((missingNote) => {
        const isAvailable = Array.from(availableNotes).some((availNote) => {
          // Compare using chroma (pitch class) to handle enharmonics
          const missingChroma = missingNote.replace(/\d+$/, '')
          const availChroma = availNote.replace(/\d+$/, '')
          return scaleNotes.includes(missingChroma) && scaleNotes.includes(availChroma)
        })
        // The note should truly be missing
        expect(isAvailable).toBe(false)
      })
    })

    it('considers bends when determining missing notes', () => {
      // A scale that requires bends - checking if bends reduce missing notes
      const { result } = renderHook(() => useHarmonicaScale('C', 'F', 'major'))
      
      // F major has Bb which is available via bends
      // So Bb should NOT be in missing notes
      expect(result.current.missingNotes).not.toContain('Bb')
    })

    it('works correctly across different tunings', () => {
      // Natural minor tuning should have fewer missing notes for minor scales
      const { result: richter } = renderHook(() => useHarmonicaScale('C', 'C', 'minor', 'richter'))
      const { result: naturalMinor } = renderHook(() => useHarmonicaScale('C', 'C', 'minor', 'natural-minor'))
      
      // Natural minor tuning is optimized for minor scales
      expect(naturalMinor.current.missingNotes.length).toBeLessThanOrEqual(richter.current.missingNotes.length)
    })

    it('returns array of note names', () => {
      const { result } = renderHook(() => useHarmonicaScale('C', 'B', 'locrian'))
      
      expect(Array.isArray(result.current.missingNotes)).toBe(true)
      result.current.missingNotes.forEach((note) => {
        expect(typeof note).toBe('string')
        expect(note.length).toBeGreaterThan(0)
      })
    })
  })
})
