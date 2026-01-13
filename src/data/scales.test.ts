import { describe, it, expect } from 'vitest'
import { getScaleNotes, isNoteInScale, getNoteOctave, getNoteDegree, degreeToRoman } from '../data/scales'

describe('Scales', () => {
  describe('getScaleNotes', () => {
    it('should get C major scale notes', () => {
      const notes = getScaleNotes('C', 'major')
      const noteNames = notes.map((n) => n.note.replace(/\d+$/, ''))
      expect(noteNames).toContain('C')
      expect(noteNames).toContain('D')
      expect(noteNames).toContain('E')
    })

    it('should get G minor scale notes', () => {
      const notes = getScaleNotes('G', 'minor')
      expect(notes.length).toBeGreaterThan(0)
      expect(notes).toEqual(
        expect.arrayContaining([expect.objectContaining({ frequency: expect.any(Number) })])
      )
    })

    it('should include frequency for each note', () => {
      const notes = getScaleNotes('C', 'major')
      expect(notes.length).toBe(7)
      notes.forEach((note) => {
        expect(note).toHaveProperty('note')
        expect(note).toHaveProperty('frequency')
        expect(typeof note.frequency).toBe('number')
      })
    })

    it('should handle invalid scale gracefully', () => {
      const notes = getScaleNotes('C', 'invalidscale' as never)
      expect(notes).toEqual([])
    })

    it('should return different notes for different scales', () => {
      const majorNotes = getScaleNotes('C', 'major')
      const minorNotes = getScaleNotes('C', 'minor')
      const majorNoteNames = majorNotes.map((n) => n.note.replace(/\d+$/, ''))
      const minorNoteNames = minorNotes.map((n) => n.note.replace(/\d+$/, ''))
      expect(majorNoteNames).not.toEqual(minorNoteNames)
    })
  })

  describe('isNoteInScale', () => {
    it('should identify if a note is in scale', () => {
      const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      expect(isNoteInScale('C4', scaleNotes)).toBe(true)
      expect(isNoteInScale('F#4', scaleNotes)).toBe(false)
    })

    it('should handle enharmonic equivalents correctly', () => {
      // C# and Db are the same pitch - both should match
      const sharpScale = ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C']
      expect(isNoteInScale('Db4', sharpScale)).toBe(true) // Db = C#
      expect(isNoteInScale('Eb4', sharpScale)).toBe(true) // Eb = D#
      expect(isNoteInScale('Gb4', sharpScale)).toBe(true) // Gb = F#

      const flatScale = ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']
      expect(isNoteInScale('C#4', flatScale)).toBe(true) // C# = Db
      expect(isNoteInScale('F#4', flatScale)).toBe(true) // F# = Gb
    })

    it('should return false for invalid notes', () => {
      const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      expect(isNoteInScale('invalid', scaleNotes)).toBe(false)
      expect(isNoteInScale('', scaleNotes)).toBe(false)
    })

    it('should return false for empty scale', () => {
      expect(isNoteInScale('C4', [])).toBe(false)
    })
  })

  describe('getNoteOctave', () => {
    it('should extract octave number from note string', () => {
      expect(getNoteOctave('C4')).toBe(4)
      expect(getNoteOctave('D5')).toBe(5)
      expect(getNoteOctave('G#3')).toBe(3)
      expect(getNoteOctave('Bb2')).toBe(2)
    })

    it('should return 4 as default for notes without octave', () => {
      expect(getNoteOctave('C')).toBe(4)
      expect(getNoteOctave('D#')).toBe(4)
      expect(getNoteOctave('Ab')).toBe(4)
    })

    it('should handle notes with accidentals', () => {
      expect(getNoteOctave('F##6')).toBe(6)
      expect(getNoteOctave('Bbb1')).toBe(1)
    })
  })

  describe('getNoteDegree', () => {
    it('should return the degree of a note in a scale', () => {
      const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      expect(getNoteDegree('C', scaleNotes)).toBe(1)
      expect(getNoteDegree('D', scaleNotes)).toBe(2)
      expect(getNoteDegree('E', scaleNotes)).toBe(3)
      expect(getNoteDegree('G', scaleNotes)).toBe(5)
      expect(getNoteDegree('B', scaleNotes)).toBe(7)
    })

    it('should handle enharmonic equivalents', () => {
      const scaleNotes = ['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C']
      expect(getNoteDegree('Db', scaleNotes)).toBe(1) // Db = C#
      expect(getNoteDegree('Eb4', scaleNotes)).toBe(2) // Eb = D#
      expect(getNoteDegree('Gb', scaleNotes)).toBe(4) // Gb = F#
    })

    it('should return undefined for note not in scale', () => {
      const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      expect(getNoteDegree('F#', scaleNotes)).toBeUndefined()
      expect(getNoteDegree('Gb', scaleNotes)).toBeUndefined()
    })

    it('should return undefined for invalid note', () => {
      const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      expect(getNoteDegree('invalid', scaleNotes)).toBeUndefined()
      expect(getNoteDegree('', scaleNotes)).toBeUndefined()
    })

    it('should return undefined for empty scale', () => {
      expect(getNoteDegree('C', [])).toBeUndefined()
    })
  })

  describe('degreeToRoman', () => {
    it('should convert degree numbers to roman numerals', () => {
      expect(degreeToRoman(1)).toBe('I')
      expect(degreeToRoman(2)).toBe('II')
      expect(degreeToRoman(3)).toBe('III')
      expect(degreeToRoman(4)).toBe('IV')
      expect(degreeToRoman(5)).toBe('V')
      expect(degreeToRoman(6)).toBe('VI')
      expect(degreeToRoman(7)).toBe('VII')
    })

    it('should return empty string for invalid degrees', () => {
      expect(degreeToRoman(0)).toBe('')
      expect(degreeToRoman(8)).toBe('')
      expect(degreeToRoman(-1)).toBe('')
      expect(degreeToRoman(100)).toBe('')
    })
  })
})
