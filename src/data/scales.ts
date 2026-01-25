/**
 * Scale utilities for harmonica note matching and music theory.
 * @packageDocumentation
 */
import { Scale, Note, Interval } from 'tonal'
import type { HarmonicaKey, ScaleType } from './harmonicas'
import type { MusicalNote, NoteNames } from '../types'

/** Gets all notes in a scale for a given root key and scale type. */
export const getScaleNotes = (rootKey: HarmonicaKey, scaleType: ScaleType): MusicalNote[] => {
  const notes = Scale.get(`${rootKey} ${scaleType}`)?.notes || []

  return notes.map((note) => ({
    note,
    frequency: Note.freq(note) || 0,
  }))
}

/** Extracts the octave number from a note string, defaulting to 4. */
export const getNoteOctave = (note: string): number => {
  const match = note.match(/\d+$/)
  return match ? parseInt(match[0]) : 4
}

/**
 * Checks if a note belongs to a given scale using pitch class comparison.
 * Handles enharmonic equivalents (C# matches Db).
 */
export const isNoteInScale = (note: string, scaleNotes: NoteNames): boolean => {
  const noteChroma = Note.chroma(note)
  if (noteChroma === undefined) return false

  return scaleNotes.some((n) => Note.chroma(n) === noteChroma)
}

/** Gets the scale degree (1-7) of a note within a scale. */
export const getNoteDegree = (note: string, scaleNotes: NoteNames): number | undefined => {
  const noteChroma = Note.chroma(note)
  if (noteChroma === undefined) return undefined

  const index = scaleNotes.findIndex((n) => Note.chroma(n) === noteChroma)
  return index >= 0 ? index + 1 : undefined
}

/** Converts a scale degree (1-7) to Roman numeral notation. */
export const degreeToRoman = (degree: number): string => {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  return numerals[degree - 1] || ''
}

/** Gets the interval type between two notes: "W" (whole), "H" (half), or "" (other). */
export const getIntervalBetweenNotes = (note1: string, note2: string): 'W' | 'H' | '' => {
  const intervalDistance = Interval.distance(note1, note2)
  const distance = Interval.semitones(intervalDistance)

  if (distance === undefined || distance === null) return ''

  const absSemitones = Math.abs(distance)

  if (absSemitones === 1) return 'H'
  if (absSemitones === 2) return 'W'

  return ''
}
