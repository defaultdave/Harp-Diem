import { describe, it, expect } from 'vitest'
import {
  getHarmonicaChords,
  getCommonChords,
  getChordsByPosition,
  findChordVoicings,
  getChordByName,
  getAllChords,
} from './chords'
import type { ChordVoicing } from './chords'

describe('Chords', () => {
  describe('getHarmonicaChords', () => {
    it('should return an array of chord voicings for C harmonica', () => {
      const chords = getHarmonicaChords('C')
      expect(chords).toBeInstanceOf(Array)
      expect(chords.length).toBeGreaterThan(0)
    })

    it('should have valid chord structure', () => {
      const chords = getHarmonicaChords('C')
      chords.forEach((chord: ChordVoicing) => {
        expect(chord.name).toBeTruthy()
        expect(chord.shortName).toBeTruthy()
        expect(chord.quality).toBeTruthy()
        expect(chord.holes).toBeInstanceOf(Array)
        expect(chord.holes.length).toBeGreaterThan(0)
        expect(['blow', 'draw']).toContain(chord.breath)
        expect(chord.notes).toBeInstanceOf(Array)
        expect(chord.notes.length).toBe(chord.holes.length)
        expect(chord.position).toBeGreaterThanOrEqual(1)
        expect(chord.position).toBeLessThanOrEqual(12)
        expect(chord.romanNumeral).toBeTruthy()
        // New fields
        expect(typeof chord.isConsecutive).toBe('boolean')
        expect(chord.tuning).toBeTruthy()
      })
    })

    it('should have holes within valid range (1-10)', () => {
      const chords = getHarmonicaChords('C')
      chords.forEach((chord) => {
        chord.holes.forEach((hole) => {
          expect(hole).toBeGreaterThanOrEqual(1)
          expect(hole).toBeLessThanOrEqual(10)
        })
      })
    })

    it('should transpose chords correctly for different keys', () => {
      const cChords = getHarmonicaChords('C')
      const gChords = getHarmonicaChords('G')

      expect(cChords.length).toBe(gChords.length)

      // Same hole patterns should exist
      const cHolePatterns = cChords.map((c) => `${c.holes.join(',')}-${c.breath}`)
      const gHolePatterns = gChords.map((c) => `${c.holes.join(',')}-${c.breath}`)
      expect(cHolePatterns).toEqual(gHolePatterns)
    })

    it('should correctly identify consecutive holes', () => {
      const chords = getHarmonicaChords('C')
      const chord123 = chords.find(
        (c) => c.holes.length === 3 && c.holes[0] === 1 && c.holes[2] === 3 && c.breath === 'blow'
      )
      expect(chord123).toBeDefined()
      expect(chord123?.isConsecutive).toBe(true)

      const chord234 = chords.find(
        (c) => c.holes.length === 3 && c.holes[0] === 2 && c.holes[2] === 4 && c.breath === 'draw'
      )
      expect(chord234).toBeDefined()
      expect(chord234?.isConsecutive).toBe(true)
    })

    it('should include tuning in chord voicings', () => {
      const chords = getHarmonicaChords('C', 'richter')
      chords.forEach((chord) => {
        expect(chord.tuning).toBe('richter')
      })
    })
  })

  describe('getCommonChords', () => {
    it('should return unique chords without duplicates', () => {
      const chords = getCommonChords('C')
      const patterns = chords.map((c) => `${c.holes.join(',')}-${c.breath}`)
      const uniquePatterns = new Set(patterns)
      expect(patterns.length).toBe(uniquePatterns.size)
    })

    it('should sort chords by breath direction and hole number', () => {
      const chords = getCommonChords('C')

      // Check that blow chords come before draw chords (in general)
      const blowChords = chords.filter((c) => c.breath === 'blow')
      const drawChords = chords.filter((c) => c.breath === 'draw')

      expect(blowChords.length).toBeGreaterThan(0)
      expect(drawChords.length).toBeGreaterThan(0)

      // Within blow chords, should be sorted by first hole
      for (let i = 0; i < blowChords.length - 1; i++) {
        expect(blowChords[i].holes[0]).toBeLessThanOrEqual(blowChords[i + 1].holes[0])
      }

      // Within draw chords, should be sorted by first hole
      for (let i = 0; i < drawChords.length - 1; i++) {
        expect(drawChords[i].holes[0]).toBeLessThanOrEqual(drawChords[i + 1].holes[0])
      }
    })
  })

  describe('getChordsByPosition', () => {
    it('should filter chords by position', () => {
      const position1Chords = getChordsByPosition('C', 1)
      const position2Chords = getChordsByPosition('C', 2)

      expect(position1Chords.length).toBeGreaterThan(0)
      expect(position2Chords.length).toBeGreaterThan(0)

      position1Chords.forEach((chord) => {
        expect(chord.position).toBe(1)
      })

      position2Chords.forEach((chord) => {
        expect(chord.position).toBe(2)
      })
    })

    it('should return empty array for positions with no chords', () => {
      const position12Chords = getChordsByPosition('C', 12)
      expect(position12Chords).toBeInstanceOf(Array)
      // May or may not have chords at position 12, just checking it doesn't error
    })
  })

  describe('Chord Quality', () => {
    it('should have major chords', () => {
      const chords = getCommonChords('C')
      const majorChords = chords.filter((c) => c.quality === 'major')
      expect(majorChords.length).toBeGreaterThan(0)
    })

    it('should have minor chords', () => {
      const chords = getCommonChords('C')
      const minorChords = chords.filter((c) => c.quality === 'minor')
      expect(minorChords.length).toBeGreaterThan(0)
    })

    it('should include common blow chord (1-2-3)', () => {
      const chords = getCommonChords('C')
      const chord123 = chords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 1 &&
          c.holes[1] === 2 &&
          c.holes[2] === 3 &&
          c.breath === 'blow'
      )
      expect(chord123).toBeDefined()
      expect(chord123?.quality).toBe('major')
    })

    it('should include common blow chord (4-5-6)', () => {
      const chords = getCommonChords('C')
      const chord456 = chords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 4 &&
          c.holes[1] === 5 &&
          c.holes[2] === 6 &&
          c.breath === 'blow'
      )
      expect(chord456).toBeDefined()
      expect(chord456?.quality).toBe('major')
    })

    it('should include G7 chord (2-3-4-5 draw)', () => {
      const chords = getCommonChords('C')
      const g7Chord = chords.find(
        (c) =>
          c.holes.length === 4 &&
          c.holes[0] === 2 &&
          c.holes[1] === 3 &&
          c.holes[2] === 4 &&
          c.holes[3] === 5 &&
          c.breath === 'draw'
      )
      expect(g7Chord).toBeDefined()
      expect(g7Chord?.quality).toBe('dominant7')
      expect(g7Chord?.shortName).toBe('G7')
    })
  })

  describe('Curated Voicings', () => {
    it('should have correct notes for C major blow chord', () => {
      const chords = getHarmonicaChords('C')
      const cMajor123 = chords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 1 &&
          c.holes[1] === 2 &&
          c.holes[2] === 3 &&
          c.breath === 'blow'
      )
      expect(cMajor123).toBeDefined()
      expect(cMajor123?.notes).toEqual(['C4', 'E4', 'G4'])
      expect(cMajor123?.shortName).toBe('C')
    })

    it('should have correct notes for G7 draw chord', () => {
      const chords = getHarmonicaChords('C')
      const g7 = chords.find(
        (c) =>
          c.holes.length === 4 &&
          c.holes[0] === 2 &&
          c.holes[3] === 5 &&
          c.breath === 'draw' &&
          c.quality === 'dominant7'
      )
      expect(g7).toBeDefined()
      expect(g7?.notes).toEqual(['G4', 'B4', 'D5', 'F5'])
      expect(g7?.shortName).toBe('G7')
    })

    it('should transpose correctly to G harmonica', () => {
      const gChords = getHarmonicaChords('G')
      const gMajor123 = gChords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 1 &&
          c.holes[1] === 2 &&
          c.holes[2] === 3 &&
          c.breath === 'blow'
      )
      expect(gMajor123).toBeDefined()
      expect(gMajor123?.notes).toEqual(['G3', 'B3', 'D4'])
      expect(gMajor123?.shortName).toBe('G')
    })
  })

  describe('New API Functions', () => {
    describe('getAllChords', () => {
      it('should return all chords for a key', () => {
        const chords = getAllChords('C')
        expect(chords).toBeInstanceOf(Array)
        expect(chords.length).toBeGreaterThan(0)
      })

      it('should be equivalent to getHarmonicaChords', () => {
        const chords1 = getAllChords('C')
        const chords2 = getHarmonicaChords('C')
        expect(chords1).toEqual(chords2)
      })
    })

    describe('findChordVoicings', () => {
      it('should find all voicings for C major', () => {
        const voicings = findChordVoicings('C', 'C')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('C')
          expect(v.quality).toBe('major')
        })
      })

      it('should find all voicings for Dm', () => {
        const voicings = findChordVoicings('Dm', 'C')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('Dm')
          expect(v.quality).toBe('minor')
        })
      })

      it('should find G7 voicing', () => {
        const voicings = findChordVoicings('G7', 'C')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('G7')
          expect(v.quality).toBe('dominant7')
        })
      })

      it('should return empty array for non-existent chord', () => {
        const voicings = findChordVoicings('XYZ', 'C')
        expect(voicings).toEqual([])
      })

      it('should work with transposed keys', () => {
        const voicings = findChordVoicings('G', 'G')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('G')
        })
      })
    })

    describe('getChordByName', () => {
      it('should return a single voicing for C major', () => {
        const chord = getChordByName('C', 'C')
        expect(chord).toBeDefined()
        expect(chord?.shortName).toBe('C')
        expect(chord?.quality).toBe('major')
      })

      it('should prefer consecutive holes', () => {
        const chord = getChordByName('C', 'C')
        expect(chord).toBeDefined()
        expect(chord?.isConsecutive).toBe(true)
      })

      it('should return undefined for non-existent chord', () => {
        const chord = getChordByName('XYZ', 'C')
        expect(chord).toBeUndefined()
      })

      it('should work with minor chords', () => {
        const chord = getChordByName('Dm', 'C')
        expect(chord).toBeDefined()
        expect(chord?.shortName).toBe('Dm')
        expect(chord?.quality).toBe('minor')
      })

      it('should work with dominant 7th chords', () => {
        const chord = getChordByName('G7', 'C')
        expect(chord).toBeDefined()
        expect(chord?.shortName).toBe('G7')
        expect(chord?.quality).toBe('dominant7')
      })
    })
  })

  describe('isConsecutive Field', () => {
    it('should mark 3-hole consecutive chords correctly', () => {
      const chords = getHarmonicaChords('C')
      const consecutiveChords = chords.filter((c) => c.holes.length === 3 && c.isConsecutive)
      expect(consecutiveChords.length).toBeGreaterThan(0)

      consecutiveChords.forEach((chord) => {
        const holes = [...chord.holes].sort((a, b) => a - b)
        for (let i = 1; i < holes.length; i++) {
          expect(holes[i] - holes[i - 1]).toBe(1)
        }
      })
    })

    it('should mark 4-hole consecutive chords correctly', () => {
      const chords = getHarmonicaChords('C')
      const consecutiveChords = chords.filter((c) => c.holes.length === 4 && c.isConsecutive)
      expect(consecutiveChords.length).toBeGreaterThan(0)

      consecutiveChords.forEach((chord) => {
        const holes = [...chord.holes].sort((a, b) => a - b)
        for (let i = 1; i < holes.length; i++) {
          expect(holes[i] - holes[i - 1]).toBe(1)
        }
      })
    })
  })
})
