import { describe, it, expect } from 'vitest'
import { harmonicas, getHarmonica, AVAILABLE_KEYS, SCALE_TYPES, TUNING_TYPES, getHarmonicaPosition } from '../data/harmonicas'
import type { HarmonicaKey } from '../data/harmonicas'

describe('Harmonicas', () => {
  describe('Basic Harmonica Structure', () => {
    it('should have C harmonica with 10 holes', () => {
      const cHarmonica = harmonicas.C
      expect(cHarmonica.holes).toHaveLength(10)
    })

    it('should have blow and draw notes for all holes', () => {
      const cHarmonica = harmonicas.C
      cHarmonica.holes.forEach((hole) => {
        expect(hole.blow).toBeDefined()
        expect(hole.blow.note).toBeTruthy()
        expect(hole.blow.frequency).toBeGreaterThan(0)
        
        expect(hole.draw).toBeDefined()
        expect(hole.draw.note).toBeTruthy()
        expect(hole.draw.frequency).toBeGreaterThan(0)
      })
    })

    it('should have correct hole numbers', () => {
      const cHarmonica = harmonicas.C
      cHarmonica.holes.forEach((hole, index) => {
        expect(hole.hole).toBe(index + 1)
      })
    })

    it('should have blow and draw notes in ascending order', () => {
      const cHarmonica = harmonicas.C
      for (let i = 0; i < cHarmonica.holes.length - 1; i++) {
        const currentHole = cHarmonica.holes[i]
        const nextHole = cHarmonica.holes[i + 1]
        expect(currentHole.blow.frequency).toBeLessThanOrEqual(nextHole.blow.frequency)
        expect(currentHole.draw.frequency).toBeLessThanOrEqual(nextHole.draw.frequency)
      }
    })
  })

  describe('Bends', () => {
    it('should have draw bends on holes with larger intervals', () => {
      const cHarmonica = harmonicas.C
      
      // Hole 2 (E4 blow, G4 draw) - major third interval
      const hole2 = cHarmonica.holes[1]
      expect(hole2.drawBends).toBeDefined()
      expect(hole2.drawBends?.halfStepBend).toBeDefined()

      // Hole 7 (C6 blow, B5 draw) - blow is higher, no draw bends
      const hole7 = cHarmonica.holes[6]
      expect(hole7.drawBends).toBeUndefined()
    })

    it('should have blow bends on holes where blow is higher', () => {
      const cHarmonica = harmonicas.C
      
      // Hole 8 (E6 blow, D6 draw) - blow is higher
      const hole8 = cHarmonica.holes[7]
      expect(hole8.blowBends).toBeDefined()
    })

    it('should have bend frequencies defined', () => {
      const cHarmonica = harmonicas.C
      const hole2 = cHarmonica.holes[1]
      
      if (hole2.drawBends?.halfStepBend) {
        expect(hole2.drawBends.halfStepBend.frequency).toBeGreaterThan(0)
        expect(hole2.drawBends.halfStepBend.note).toBeTruthy()
      }
    })
  })

  describe('Overblows and Overdraws', () => {
    it('should have overblow on specific holes', () => {
      const cHarmonica = harmonicas.C

      // Hole 1 should have overblow (D4 + semitone = D#4/Eb4)
      const hole1 = cHarmonica.holes[0]
      expect(hole1.overblow).toBeDefined()
      expect(hole1.overblow?.note).toBe('D#4')

      // Hole 5 should have overblow (F5 + semitone = F#5/Gb5)
      const hole5 = cHarmonica.holes[4]
      expect(hole5.overblow).toBeDefined()
      expect(hole5.overblow?.note).toBe('F#5')
    })

    it('should not have overblow on non-overblow holes', () => {
      const cHarmonica = harmonicas.C

      // Holes without overblows
      const hole2 = cHarmonica.holes[1]
      expect(hole2.overblow).toBeUndefined()
    })

    it('should have overdraw on specific holes', () => {
      const cHarmonica = harmonicas.C

      // Hole 7 should have overdraw (blow=C6 + semitone = C#6/Db6)
      const hole7 = cHarmonica.holes[6]
      expect(hole7.overdraw).toBeDefined()
      expect(hole7.overdraw?.note).toBe('C#6')

      // Hole 10 should have overdraw (blow=C7 + semitone = C#7/Db7)
      const hole10 = cHarmonica.holes[9]
      expect(hole10.overdraw).toBeDefined()
      expect(hole10.overdraw?.note).toBe('C#7')
    })

    it('should not have overdraw on non-overdraw holes', () => {
      const cHarmonica = harmonicas.C

      // Holes without overdraws
      const hole1 = cHarmonica.holes[0]
      expect(hole1.overdraw).toBeUndefined()
    })

    it('should have frequencies for overblows and overdraws', () => {
      const cHarmonica = harmonicas.C

      const hole1 = cHarmonica.holes[0]
      if (hole1.overblow) {
        expect(hole1.overblow.frequency).toBeGreaterThan(0)
      }

      const hole7 = cHarmonica.holes[6]
      if (hole7.overdraw) {
        expect(hole7.overdraw.frequency).toBeGreaterThan(0)
      }
    })
  })

  describe('Harmonica Keys', () => {
    it('should transpose harmonica key correctly', () => {
      const cHarmonica = harmonicas.C
      const dHarmonica = harmonicas.D

      // D harmonica should have different blow notes than C
      const cBlowNotes = cHarmonica.holes.map((h) => h.blow.note)
      const dBlowNotes = dHarmonica.holes.map((h) => h.blow.note)

      expect(cBlowNotes).not.toEqual(dBlowNotes)
      
      // First hole of C should be C, first hole of D should be D
      expect(cBlowNotes[0]).toMatch(/C\d/)
      expect(dBlowNotes[0]).toMatch(/D\d/)
    })

    it('should have all available harmonica keys', () => {
      expect(harmonicas.C).toBeDefined()
      expect(harmonicas.Db).toBeDefined()
      expect(harmonicas.D).toBeDefined()
      expect(harmonicas.Eb).toBeDefined()
      expect(harmonicas.E).toBeDefined()
      expect(harmonicas.F).toBeDefined()
      expect(harmonicas['F#']).toBeDefined()
      expect(harmonicas.G).toBeDefined()
      expect(harmonicas.Ab).toBeDefined()
      expect(harmonicas.A).toBeDefined()
      expect(harmonicas.Bb).toBeDefined()
      expect(harmonicas.B).toBeDefined()
    })

    it('should handle enharmonic equivalents', () => {
      // Db harmonica should be accessible
      const dbHarmonica = harmonicas.Db
      expect(dbHarmonica.key).toBe('Db')
      expect(dbHarmonica.holes).toHaveLength(10)

      // F# harmonica should be accessible
      const fSharpHarmonica = harmonicas['F#']
      expect(fSharpHarmonica.key).toBe('F#')
      expect(fSharpHarmonica.holes).toHaveLength(10)
    })

    it('should have consistent octave ranges for different keys', () => {
      const gHarmonica = harmonicas.G
      const cHarmonica = harmonicas.C

      // G harmonica (starts at octave 3) should have different octave range
      const gOctaves = gHarmonica.holes.map((h) => h.blow.note.match(/\d+/)?.[0]).filter(Boolean)
      const cOctaves = cHarmonica.holes.map((h) => h.blow.note.match(/\d+/)?.[0]).filter(Boolean)

      // First hole should indicate different starting octaves
      expect(gOctaves[0]).toBeTruthy()
      expect(cOctaves[0]).toBeTruthy()
    })
  })

  describe('getHarmonica Function', () => {
    it('should return harmonica by key', () => {
      const harmonica = getHarmonica('C')
      expect(harmonica.key).toBe('C')
      expect(harmonica.holes).toHaveLength(10)
    })

    it('should cache harmonicas for performance', () => {
      const harmonica1 = getHarmonica('D')
      const harmonica2 = getHarmonica('D')
      expect(harmonica1).toBe(harmonica2) // Same reference
    })

    it('should work with all available keys', () => {
      AVAILABLE_KEYS.forEach((key) => {
        const harmonica = getHarmonica(key)
        expect(harmonica).toBeDefined()
        expect(harmonica.holes).toHaveLength(10)
        expect(harmonica.holes.every((h) => h.blow && h.draw)).toBe(true)
      })
    })
  })

  describe('Constants', () => {
    it('should have all 12 available keys', () => {
      expect(AVAILABLE_KEYS).toHaveLength(12)
      expect(AVAILABLE_KEYS).toContain('C')
      expect(AVAILABLE_KEYS).toContain('A')
      expect(AVAILABLE_KEYS).toContain('B')
    })

    it('should have scale types defined', () => {
      expect(SCALE_TYPES).toContain('major')
      expect(SCALE_TYPES).toContain('minor')
      expect(SCALE_TYPES).toContain('blues')
      expect(SCALE_TYPES.length).toBeGreaterThan(0)
    })

    it('should have all 5 tuning types defined', () => {
      expect(TUNING_TYPES).toHaveLength(5)
      expect(TUNING_TYPES).toContain('richter')
      expect(TUNING_TYPES).toContain('paddy-richter')
      expect(TUNING_TYPES).toContain('natural-minor')
      expect(TUNING_TYPES).toContain('country')
      expect(TUNING_TYPES).toContain('melody-maker')
    })
  })

  describe('Alternate Tunings', () => {
    it('should return different harmonicas for different tunings', () => {
      const richter = getHarmonica('C', 'richter')
      const paddyRichter = getHarmonica('C', 'paddy-richter')
      const naturalMinor = getHarmonica('C', 'natural-minor')
      const country = getHarmonica('C', 'country')
      const melodyMaker = getHarmonica('C', 'melody-maker')

      // All should have 10 holes
      expect(richter.holes).toHaveLength(10)
      expect(paddyRichter.holes).toHaveLength(10)
      expect(naturalMinor.holes).toHaveLength(10)
      expect(country.holes).toHaveLength(10)
      expect(melodyMaker.holes).toHaveLength(10)

      // They should have different note configurations
      expect(richter.holes[2].blow.note).not.toBe(paddyRichter.holes[2].blow.note)
      expect(richter.holes[4].draw.note).not.toBe(country.holes[4].draw.note)
    })

    it('Paddy Richter should have A instead of G on hole 3 blow', () => {
      const richter = getHarmonica('C', 'richter')
      const paddyRichter = getHarmonica('C', 'paddy-richter')

      expect(richter.holes[2].blow.note).toBe('G4')
      expect(paddyRichter.holes[2].blow.note).toBe('A4')
    })

    it('Natural Minor should have minor 3rds and 7ths', () => {
      const naturalMinor = getHarmonica('C', 'natural-minor')

      // Hole 2 blow should be Eb (minor 3rd) instead of E
      expect(naturalMinor.holes[1].blow.note).toBe('Eb4')
      // Hole 3 draw should be Bb (minor 7th) instead of B
      expect(naturalMinor.holes[2].draw.note).toBe('Bb4')
    })

    it('Country should have raised hole 5 draw', () => {
      const richter = getHarmonica('C', 'richter')
      const country = getHarmonica('C', 'country')

      expect(richter.holes[4].draw.note).toBe('F5')
      expect(country.holes[4].draw.note).toBe('F#5')
    })

    it('Melody Maker should have raised hole 3 blow and holes 5, 9 draw', () => {
      const richter = getHarmonica('C', 'richter')
      const melodyMaker = getHarmonica('C', 'melody-maker')

      // Hole 3 blow: G -> A
      expect(richter.holes[2].blow.note).toBe('G4')
      expect(melodyMaker.holes[2].blow.note).toBe('A4')

      // Hole 5 draw: F -> F#
      expect(richter.holes[4].draw.note).toBe('F5')
      expect(melodyMaker.holes[4].draw.note).toBe('F#5')

      // Hole 9 draw: F -> F#
      expect(richter.holes[8].draw.note).toBe('F6')
      expect(melodyMaker.holes[8].draw.note).toBe('F#6')
    })

    it('should cache tuned harmonicas correctly', () => {
      const paddy1 = getHarmonica('C', 'paddy-richter')
      const paddy2 = getHarmonica('C', 'paddy-richter')
      expect(paddy1).toBe(paddy2) // Same reference

      const richter = getHarmonica('C', 'richter')
      expect(paddy1).not.toBe(richter) // Different reference
    })

    it('should transpose alternate tunings to other keys', () => {
      const cPaddy = getHarmonica('C', 'paddy-richter')
      const dPaddy = getHarmonica('D', 'paddy-richter')

      // D Paddy Richter hole 3 blow should be B (A transposed up a whole step)
      expect(cPaddy.holes[2].blow.note).toBe('A4')
      expect(dPaddy.holes[2].blow.note).toBe('B4')
    })

    it('should work with all tuning types for all keys', () => {
      TUNING_TYPES.forEach((tuning) => {
        AVAILABLE_KEYS.forEach((key) => {
          const harmonica = getHarmonica(key, tuning)
          expect(harmonica).toBeDefined()
          expect(harmonica.holes).toHaveLength(10)
          expect(harmonica.holes.every((h) => h.blow && h.draw)).toBe(true)
        })
      })
    })

    it('should calculate bends correctly for alternate tunings', () => {
      const country = getHarmonica('C', 'country')

      // Hole 5: E5 blow, F#5 draw - interval is 2 semitones, should have half step bend
      const hole5 = country.holes[4]
      expect(hole5.drawBends?.halfStepBend).toBeDefined()
      expect(hole5.drawBends?.halfStepBend?.note).toBe('F5') // F#5 bent down a half step

      // Natural minor hole 3: G4 blow, Bb4 draw - interval is 3 semitones
      const naturalMinor = getHarmonica('C', 'natural-minor')
      const nmHole3 = naturalMinor.holes[2]
      expect(nmHole3.drawBends?.halfStepBend).toBeDefined()
      expect(nmHole3.drawBends?.wholeStepBend).toBeDefined()
    })

    it('defaults to richter tuning when not specified', () => {
      const defaultTuning = getHarmonica('C')
      const explicitRichter = getHarmonica('C', 'richter')

      expect(defaultTuning.holes[2].blow.note).toBe(explicitRichter.holes[2].blow.note)
      expect(defaultTuning.holes[4].draw.note).toBe(explicitRichter.holes[4].draw.note)
    })
  })

  describe('Proxy Behavior', () => {
    it('should allow access via harmonicas proxy', () => {
      const harmonica = harmonicas.C
      expect(harmonica).toBeDefined()
      expect(harmonica.key).toBe('C')
    })

    it('should return consistent data via proxy and getHarmonica', () => {
      const viaProxy = harmonicas.D
      const viaFunction = getHarmonica('D')
      
      expect(viaProxy.key).toBe(viaFunction.key)
      expect(viaProxy.holes.length).toBe(viaFunction.holes.length)
    })
  })

  describe('getHarmonicaPosition', () => {
    it('should return 1st position when harmonica key equals song key', () => {
      expect(getHarmonicaPosition('C', 'C')).toBe(1)
      expect(getHarmonicaPosition('G', 'G')).toBe(1)
      expect(getHarmonicaPosition('D', 'D')).toBe(1)
    })

    it('should return 2nd position when song key is a perfect 4th above harmonica key', () => {
      expect(getHarmonicaPosition('C', 'F')).toBe(2)
      expect(getHarmonicaPosition('G', 'C')).toBe(2)
      expect(getHarmonicaPosition('D', 'G')).toBe(2)
    })

    it('should return 3rd position when song key is a minor 7th above harmonica key', () => {
      expect(getHarmonicaPosition('C', 'Bb')).toBe(3)
      expect(getHarmonicaPosition('G', 'F')).toBe(3)
    })

    it('should handle enharmonic equivalents correctly', () => {
      // Db/F# gives same position as C/F (2nd position, cross harp)
      expect(getHarmonicaPosition('Db', 'F#')).toBe(2)

      // Standard 2nd position examples
      expect(getHarmonicaPosition('C', 'F')).toBe(2)
      expect(getHarmonicaPosition('G', 'C')).toBe(2)
    })

    it('should map all 12 semitone differences to positions', () => {
      // Test all positions with C harmonica using valid HarmonicaKey values
      const expectedPositions: Record<HarmonicaKey, number> = {
        'C': 1,   // 0 semitones (1st position)
        'F': 2,   // 5 semitones (2nd position)
        'Bb': 3,  // 10 semitones (3rd position)
        'Eb': 4,  // 3 semitones (4th position)
        'Ab': 5,  // 8 semitones (5th position)
        'Db': 6,  // 1 semitone (6th position)
        'F#': 7,  // 6 semitones (7th position)
        'B': 8,   // 11 semitones (8th position)
        'E': 9,   // 4 semitones (9th position)
        'A': 10,  // 9 semitones (10th position)
        'D': 11,  // 2 semitones (11th position)
        'G': 12,  // 7 semitones (12th position)
      }

      Object.entries(expectedPositions).forEach(([songKey, expectedPosition]) => {
        expect(getHarmonicaPosition('C', songKey as HarmonicaKey)).toBe(expectedPosition)
      })
    })

    it('should work with all available harmonica keys', () => {
      AVAILABLE_KEYS.forEach((key) => {
        // Each key with itself should be 1st position
        expect(getHarmonicaPosition(key, key)).toBe(1)
      })
    })

    it('should return a valid position number between 1 and 12', () => {
      AVAILABLE_KEYS.forEach((harmonicaKey) => {
        AVAILABLE_KEYS.forEach((songKey) => {
          const position = getHarmonicaPosition(harmonicaKey, songKey)
          expect(position).toBeGreaterThanOrEqual(1)
          expect(position).toBeLessThanOrEqual(12)
        })
      })
    })
  })
})
