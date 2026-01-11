import { describe, it, expect } from 'vitest'
import { getScaleNotes, isNoteInScale } from '../data/scales'

describe('Scales', () => {
  it('should get C major scale notes', () => {
    const notes = getScaleNotes('C', 'major')
    const noteNames = notes.map((n) => n.note.replace(/\d+$/, ''))
    expect(noteNames).toContain('C')
    expect(noteNames).toContain('D')
    expect(noteNames).toContain('E')
  })

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

  it('should get G minor scale notes', () => {
    const notes = getScaleNotes('G', 'minor')
    expect(notes.length).toBeGreaterThan(0)
    expect(notes).toEqual(
      expect.arrayContaining([expect.objectContaining({ frequency: expect.any(Number) })])
    )
  })
})
