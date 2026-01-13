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
