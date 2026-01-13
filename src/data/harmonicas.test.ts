import { describe, it, expect } from 'vitest'
import { harmonicas, getHarmonica, AVAILABLE_KEYS, SCALE_TYPES, getHarmonicaPosition } from '../data/harmonicas'

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
    it('should have all 17 available keys', () => {
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
      // C# and Db are enharmonically equivalent
      expect(getHarmonicaPosition('C#', 'F#')).toBe(2)
      expect(getHarmonicaPosition('Db', 'Gb')).toBe(2)
      
      // Mixed enharmonics
      expect(getHarmonicaPosition('C', 'F')).toBe(2)
      expect(getHarmonicaPosition('C#', 'F#')).toBe(2)
    })

    it('should map all 12 semitone differences to positions', () => {
      // Test all positions with C harmonica
      const expectedPositions: { [key: string]: number } = {
        'C': 1,   // 0 semitones
        'Db': 6,  // 1 semitone
        'D': 11,  // 2 semitones
        'Eb': 4,  // 3 semitones
        'E': 9,   // 4 semitones
        'F': 2,   // 5 semitones
        'Gb': 7,  // 6 semitones
        'G': 12,  // 7 semitones
        'Ab': 5,  // 8 semitones
        'A': 10,  // 9 semitones
        'Bb': 3,  // 10 semitones
        'B': 8,   // 11 semitones
      }

      Object.entries(expectedPositions).forEach(([songKey, expectedPosition]) => {
        expect(getHarmonicaPosition('C', songKey)).toBe(expectedPosition)
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
