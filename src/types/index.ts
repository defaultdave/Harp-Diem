/**
 * A musical note with its frequency for audio playback
 */
export interface MusicalNote {
  note: string
  frequency: number
}

/**
 * An array of note names (without octave/frequency info)
 * Used for scale membership checking
 */
export type NoteNames = string[]

/**
 * Chord-related types are defined in src/data/chords.ts
 * Re-exported here for convenience
 */
export type { ChordVoicing, ChordQuality } from '../data/chords'
