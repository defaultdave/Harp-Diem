/**
 * @packageDocumentation
 * Scale utilities for harmonica note matching and music theory.
 *
 * This module provides functions for working with musical scales:
 * generating scale notes, checking if notes belong to a scale,
 * calculating scale degrees, and determining intervals.
 *
 * @remarks
 * All scale operations use tonal.js for music theory calculations.
 * Note comparison uses chroma (pitch class 0-11) for enharmonic equivalence,
 * meaning C# and Db are treated as the same note.
 *
 * @category Data
 */
import { Scale, Note, Interval } from 'tonal'
import type { HarmonicaKey, ScaleType } from './harmonicas'
import type { MusicalNote, NoteNames } from '../types'

/**
 * Gets all notes in a scale for a given root key and scale type.
 *
 * @param rootKey - The root note of the scale (e.g., "C", "G", "Bb")
 * @param scaleType - The type of scale (e.g., "major", "minor pentatonic")
 * @returns Array of MusicalNote objects with note names and frequencies
 *
 * @example
 * ```typescript
 * const cMajorNotes = getScaleNotes('C', 'major')
 * // Returns: [{ note: 'C', frequency: ... }, { note: 'D', frequency: ... }, ...]
 * ```
 */
export const getScaleNotes = (rootKey: HarmonicaKey, scaleType: ScaleType): MusicalNote[] => {
  const notes = Scale.get(`${rootKey} ${scaleType}`)?.notes || []

  return notes.map((note) => ({
    note,
    frequency: Note.freq(note) || 0,
  }))
}

/**
 * Extracts the octave number from a note string.
 *
 * @param note - A note with octave (e.g., "C4", "Bb3", "F#5")
 * @returns The octave number, or 4 (middle C octave) if not found
 *
 * @example
 * ```typescript
 * getNoteOctave('C4')  // Returns 4
 * getNoteOctave('G3')  // Returns 3
 * getNoteOctave('C')   // Returns 4 (default)
 * ```
 */
export const getNoteOctave = (note: string): number => {
  const match = note.match(/\d+$/)
  return match ? parseInt(match[0]) : 4
}

/**
 * Checks if a note belongs to a given scale.
 *
 * @remarks
 * Uses chroma (pitch class 0-11) for comparison, which handles enharmonic
 * equivalents correctly. For example, C# and Db both have chroma 1, so
 * they match each other regardless of spelling.
 *
 * @param note - The note to check (with or without octave, e.g., "C4" or "C#")
 * @param scaleNotes - Array of note names that define the scale
 * @returns True if the note is in the scale, false otherwise
 *
 * @example
 * ```typescript
 * const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 * isNoteInScale('E4', cMajor)   // true
 * isNoteInScale('Eb4', cMajor)  // false
 * isNoteInScale('Fb4', cMajor)  // true (Fb = E enharmonically)
 * ```
 */
export const isNoteInScale = (note: string, scaleNotes: NoteNames): boolean => {
  // Use chroma (0-11 pitch class) for enharmonic-safe comparison
  const noteChroma = Note.chroma(note)
  if (noteChroma === undefined) return false

  return scaleNotes.some((n) => Note.chroma(n) === noteChroma)
}

/**
 * Gets the scale degree (1-7) of a note within a scale.
 *
 * @param note - The note to find the degree for
 * @param scaleNotes - Array of notes defining the scale (in order)
 * @returns The scale degree (1-7), or undefined if note is not in scale
 *
 * @example
 * ```typescript
 * const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 * getNoteDegree('C', cMajor)   // 1 (root)
 * getNoteDegree('G', cMajor)   // 5 (fifth)
 * getNoteDegree('Eb', cMajor)  // undefined (not in scale)
 * ```
 */
export const getNoteDegree = (note: string, scaleNotes: NoteNames): number | undefined => {
  const noteChroma = Note.chroma(note)
  if (noteChroma === undefined) return undefined

  const index = scaleNotes.findIndex((n) => Note.chroma(n) === noteChroma)
  return index >= 0 ? index + 1 : undefined
}

/**
 * Converts a scale degree number to Roman numeral notation.
 *
 * @param degree - Scale degree (1-7)
 * @returns Roman numeral string (I-VII), or empty string if invalid
 *
 * @example
 * ```typescript
 * degreeToRoman(1)  // "I"
 * degreeToRoman(4)  // "IV"
 * degreeToRoman(7)  // "VII"
 * degreeToRoman(8)  // "" (invalid)
 * ```
 */
export const degreeToRoman = (degree: number): string => {
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  return numerals[degree - 1] || ''
}

/**
 * Gets the interval type between two notes (whole step or half step).
 *
 * @remarks
 * This is used for displaying scale patterns. Only whole steps (2 semitones)
 * and half steps (1 semitone) are returned; other intervals return empty string.
 *
 * @param note1 - The first note
 * @param note2 - The second note
 * @returns "W" for whole step, "H" for half step, "" for other intervals
 *
 * @example
 * ```typescript
 * getIntervalBetweenNotes('C', 'D')   // "W" (whole step)
 * getIntervalBetweenNotes('E', 'F')   // "H" (half step)
 * getIntervalBetweenNotes('C', 'G')   // "" (fifth, not W or H)
 * ```
 */
export const getIntervalBetweenNotes = (note1: string, note2: string): 'W' | 'H' | '' => {
  const intervalDistance = Interval.distance(note1, note2)
  const distance = Interval.semitones(intervalDistance)
  
  if (distance === undefined || distance === null) return ''
  
  // Normalize to positive value (handle both ascending and descending)
  const absSemitones = Math.abs(distance)
  
  if (absSemitones === 1) return 'H' // Half step
  if (absSemitones === 2) return 'W' // Whole step
  
  return '' // Other intervals (not used in standard scales between adjacent notes)
}
