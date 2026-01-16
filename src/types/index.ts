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
 * A saved favorite harmonica/scale combination
 * Note: Uses string types instead of HarmonicaKey/ScaleType/TuningType to avoid
 * circular dependencies (data files import from types) and for better JSON serialization.
 * The component validates these match the allowed values from harmonicas.ts.
 */
export interface Favorite {
  id: string
  name: string
  harmonicaKey: string // matches HarmonicaKey type
  tuning: string // matches TuningType
  songKey: string // matches HarmonicaKey type
  scaleType: string // matches ScaleType
  createdAt: number
}
