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
    
    // Hole 2 should have blow bends
    const hole2 = cHarmonica.holes[1]
    expect(hole2.blowBends).toBeDefined()
    expect(hole2.blowBends?.halfStepBend).toBeDefined()
    
    // Hole 5 should have draw bends
    const hole5 = cHarmonica.holes[4]
    expect(hole5.drawBends).toBeDefined()
    expect(hole5.drawBends?.wholeStepBend).toBeDefined()
  })

  it('should have overblows and overdraws', () => {
    const cHarmonica = harmonicas.C
    
    // Hole 1 should have overblow
    const hole1 = cHarmonica.holes[0]
    expect(hole1.overblow).toBeDefined()
    expect(hole1.overblow?.note).toBe('Eb4')
    
    // Hole 8 should have overdraw
    const hole8 = cHarmonica.holes[7]
    expect(hole8.overdraw).toBeDefined()
    expect(hole8.overdraw?.note).toBe('Db6')
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
    expect(harmonicas.D).toBeDefined()
    expect(harmonicas.E).toBeDefined()
    expect(harmonicas.F).toBeDefined()
    expect(harmonicas.G).toBeDefined()
    expect(harmonicas.A).toBeDefined()
    expect(harmonicas.B).toBeDefined()
  })
})
