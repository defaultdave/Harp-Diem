import { describe, it, expect } from 'vitest'
import { getTabNotation, labelToNoteType } from './tabNotation'

describe('getTabNotation', () => {
  describe('blow notes', () => {
    it('returns +N for blow notes', () => {
      expect(getTabNotation(1, 'blow')).toBe('+1')
      expect(getTabNotation(4, 'blow')).toBe('+4')
      expect(getTabNotation(10, 'blow')).toBe('+10')
    })
  })

  describe('draw notes', () => {
    it('returns -N for draw notes', () => {
      expect(getTabNotation(1, 'draw')).toBe('-1')
      expect(getTabNotation(4, 'draw')).toBe('-4')
      expect(getTabNotation(10, 'draw')).toBe('-10')
    })
  })

  describe('draw bends', () => {
    it("returns -N' for half-step draw bends", () => {
      expect(getTabNotation(1, 'drawHalfBend')).toBe("-1'")
      expect(getTabNotation(4, 'drawHalfBend')).toBe("-4'")
    })

    it("returns -N'' for whole-step draw bends", () => {
      expect(getTabNotation(2, 'drawWholeBend')).toBe("-2''")
      expect(getTabNotation(3, 'drawWholeBend')).toBe("-3''")
    })

    it("returns -N''' for minor third draw bends", () => {
      expect(getTabNotation(2, 'drawMinorThirdBend')).toBe("-2'''")
      expect(getTabNotation(3, 'drawMinorThirdBend')).toBe("-3'''")
    })
  })

  describe('blow bends', () => {
    it("returns +N' for half-step blow bends", () => {
      expect(getTabNotation(8, 'blowHalfBend')).toBe("+8'")
      expect(getTabNotation(9, 'blowHalfBend')).toBe("+9'")
      expect(getTabNotation(10, 'blowHalfBend')).toBe("+10'")
    })

    it("returns +N'' for whole-step blow bends", () => {
      expect(getTabNotation(10, 'blowWholeBend')).toBe("+10''")
    })
  })

  describe('overblows and overdraws', () => {
    it('returns OBN for overblows', () => {
      expect(getTabNotation(1, 'overblow')).toBe('OB1')
      expect(getTabNotation(4, 'overblow')).toBe('OB4')
      expect(getTabNotation(6, 'overblow')).toBe('OB6')
    })

    it('returns ODN for overdraws', () => {
      expect(getTabNotation(7, 'overdraw')).toBe('OD7')
      expect(getTabNotation(9, 'overdraw')).toBe('OD9')
      expect(getTabNotation(10, 'overdraw')).toBe('OD10')
    })
  })
})

describe('labelToNoteType', () => {
  it('converts Blow label to blow type', () => {
    expect(labelToNoteType('Blow')).toBe('blow')
  })

  it('converts Draw label to draw type', () => {
    expect(labelToNoteType('Draw')).toBe('draw')
  })

  it('converts bend labels to correct types', () => {
    expect(labelToNoteType('↑1')).toBe('blowHalfBend')
    expect(labelToNoteType('↑2')).toBe('blowWholeBend')
    expect(labelToNoteType('↓1')).toBe('drawHalfBend')
    expect(labelToNoteType('↓2')).toBe('drawWholeBend')
    expect(labelToNoteType('↓3')).toBe('drawMinorThirdBend')
  })

  it('converts OB/OD labels to correct types', () => {
    expect(labelToNoteType('OB')).toBe('overblow')
    expect(labelToNoteType('OD')).toBe('overdraw')
  })
})
