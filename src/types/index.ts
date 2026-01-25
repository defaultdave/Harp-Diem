/**
 * Core type definitions used throughout the application.
 * @packageDocumentation
 */

/** A musical note with its name and frequency for audio playback. */
export interface MusicalNote {
  note: string
  frequency: number
}

/** Array of note names without octave information, used for scale membership checking. */
export type NoteNames = string[]

export type { ChordVoicing, ChordQuality } from '../data/chords'
