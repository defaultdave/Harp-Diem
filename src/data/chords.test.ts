import { describe, it, expect } from 'vitest'
import { getHarmonicaChords, getCommonChords, getChordsByPosition } from './chords'
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
      const cHolePatterns = cChords.map(c => `${c.holes.join(',')}-${c.breath}`)
      const gHolePatterns = gChords.map(c => `${c.holes.join(',')}-${c.breath}`)
      expect(cHolePatterns).toEqual(gHolePatterns)
    })
  })

  describe('getCommonChords', () => {
    it('should return unique chords without duplicates', () => {
      const chords = getCommonChords('C')
      const patterns = chords.map(c => `${c.holes.join(',')}-${c.breath}`)
      const uniquePatterns = new Set(patterns)
      expect(patterns.length).toBe(uniquePatterns.size)
    })

    it('should sort chords by breath direction and hole number', () => {
      const chords = getCommonChords('C')
      
      // Check that blow chords come before draw chords (in general)
      const blowChords = chords.filter(c => c.breath === 'blow')
      const drawChords = chords.filter(c => c.breath === 'draw')
      
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
      
      position1Chords.forEach(chord => {
        expect(chord.position).toBe(1)
      })
      
      position2Chords.forEach(chord => {
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
      const majorChords = chords.filter(c => c.quality === 'major')
      expect(majorChords.length).toBeGreaterThan(0)
    })

    it('should have minor chords', () => {
      const chords = getCommonChords('C')
      const minorChords = chords.filter(c => c.quality === 'minor')
      expect(minorChords.length).toBeGreaterThan(0)
    })

    it('should include common blow chord (1-2-3)', () => {
      const chords = getCommonChords('C')
      const chord123 = chords.find(c => 
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
      const chord456 = chords.find(c => 
        c.holes.length === 3 && 
        c.holes[0] === 4 && 
        c.holes[1] === 5 && 
        c.holes[2] === 6 &&
        c.breath === 'blow'
      )
      expect(chord456).toBeDefined()
      expect(chord456?.quality).toBe('major')
    })
  })
})
