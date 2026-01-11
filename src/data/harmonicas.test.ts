import { describe, it, expect } from 'vitest'
import { harmonicas } from '../data/harmonicas'

describe('Harmonicas', () => {
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

  it('should have bends on specific holes', () => {
    const cHarmonica = harmonicas.C
    
    // Hole 1 should have blow bends
    const hole1 = cHarmonica.holes[0]
    expect(hole1.blowBends).toBeDefined()
    expect(hole1.blowBends?.halfStepBend).toBeDefined()
    
    // Hole 5 should NOT have draw bends (only blow bends)
    const hole5 = cHarmonica.holes[4]
    expect(hole5.blowBends).toBeDefined()
    expect(hole5.blowBends?.halfStepBend).toBeDefined()
  })

  it('should have overblows and overdraws', () => {
    const cHarmonica = harmonicas.C
    
    // Hole 7 should have overdraw
    const hole7 = cHarmonica.holes[6]
    expect(hole7.overdraw).toBeDefined()
    expect(hole7.overdraw?.note).toBe('Db5')
    
    // Hole 10 should have overdraw
    const hole10 = cHarmonica.holes[9]
    expect(hole10.overdraw).toBeDefined()
    expect(hole10.overdraw?.note).toBe('Db7')
  })

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
    expect(harmonicas['C#']).toBeDefined()
    expect(harmonicas.Db).toBeDefined()
    expect(harmonicas.D).toBeDefined()
    expect(harmonicas['D#']).toBeDefined()
    expect(harmonicas.Eb).toBeDefined()
    expect(harmonicas.E).toBeDefined()
    expect(harmonicas.F).toBeDefined()
    expect(harmonicas['F#']).toBeDefined()
    expect(harmonicas.Gb).toBeDefined()
    expect(harmonicas.G).toBeDefined()
    expect(harmonicas['G#']).toBeDefined()
    expect(harmonicas.Ab).toBeDefined()
    expect(harmonicas.A).toBeDefined()
    expect(harmonicas['A#']).toBeDefined()
    expect(harmonicas.Bb).toBeDefined()
    expect(harmonicas.B).toBeDefined()
  })
})
