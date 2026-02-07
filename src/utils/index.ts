/**
 * Utility functions for audio, export, events, and string formatting.
 * @packageDocumentation
 */

// Re-export from audioPlayer
export {
  playTone,
  playChordProgression,
  playChord,
  type PlayChordOptions,
} from './audioPlayer'

// Re-export from chord
export { getChordKey, areChordsSame } from './chord'

// Re-export from classNames
export { cn } from './classNames'

// Re-export from events
export { handleActivationKey } from './events'

// Re-export from export
export {
  type ExportOptions,
  exportAsPNG,
  exportAsPDF,
  printView,
} from './export'

// Re-export from playableNotes
export {
  type PlayableNote,
  type BendPlayability,
  collectPlayableNotes,
  getBendPlayability,
} from './playableNotes'

// Re-export from string
export {
  capitalize,
  capitalizeWords,
  getOrdinalSuffix,
} from './string'

// Re-export from tabNotation
export {
  type NoteType,
  getTabNotation,
  labelToNoteType,
} from './tabNotation'

// Re-export from pitchDetection
export {
  type PitchResult,
  detectPitch,
  frequencyToNote,
} from './pitchDetection'
