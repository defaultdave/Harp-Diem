import { Scale, Note } from 'tonal'
import type { HarmonicaKey, ScaleType } from './harmonicas'
import type { MusicalNote, NoteNames } from '../types'

export const getScaleNotes = (rootKey: HarmonicaKey, scaleType: ScaleType): MusicalNote[] => {
  const notes = Scale.get(`${rootKey} ${scaleType}`)?.notes || []

  return notes.map((note) => ({
    note,
    frequency: Note.freq(note) || 0,
  }))
}

export const getNoteOctave = (note: string): number => {
  const match = note.match(/\d+$/)
  return match ? parseInt(match[0]) : 4
}

export const isNoteInScale = (note: string, scaleNotes: NoteNames): boolean => {
  // Use chroma (0-11 pitch class) for enharmonic-safe comparison
  // C# and Db both have chroma 1, so they'll match correctly
  const noteChroma = Note.chroma(note)
  if (noteChroma === undefined) return false

  return scaleNotes.some((n) => Note.chroma(n) === noteChroma)
}

export const getNoteDegree = (note: string, scaleNotes: NoteNames): number | undefined => {
  const noteChroma = Note.chroma(note)
  if (noteChroma === undefined) return undefined

  const index = scaleNotes.findIndex((n) => Note.chroma(n) === noteChroma)
  return index >= 0 ? index + 1 : undefined
}

export const degreeToRoman = (degree: number): string => {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  return numerals[degree - 1] || ''
}
