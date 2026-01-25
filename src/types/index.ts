/**
 * @packageDocumentation
 * Core type definitions used throughout the application.
 *
 * @category Types
 */

/**
 * A musical note with its name and frequency for audio playback.
 *
 * @remarks
 * Used throughout the application to represent notes that can be played.
 * The frequency is in Hz and is used by the Web Audio API for playback.
 *
 * @example
 * ```typescript
 * const middleC: MusicalNote = {
 *   note: "C4",
 *   frequency: 261.63
 * }
 * ```
 */
export interface MusicalNote {
  /** Note name with octave (e.g., "C4", "F#5", "Bb3") */
  note: string
  /** Frequency in Hz for audio playback */
  frequency: number
}

/**
 * Array of note names without octave or frequency information.
 *
 * @remarks
 * Used for scale membership checking where octave doesn't matter.
 * Notes are compared by pitch class (chroma) for enharmonic equivalence.
 *
 * @example
 * ```typescript
 * const cMajorScale: NoteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 * ```
 */
export type NoteNames = string[]

/**
 * Chord-related types re-exported from the chords module.
 *
 * @see {@link ../data/chords.ts} for full definitions
 */
export type { ChordVoicing, ChordQuality } from '../data/chords'
