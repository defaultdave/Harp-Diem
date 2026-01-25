/**
 * @packageDocumentation
 * Utility functions barrel file - exports all utility modules.
 *
 * Available utilities:
 * - **audioPlayer**: Web Audio API playback for notes and chords
 * - **chord**: Chord comparison and key generation
 * - **classNames**: CSS class name composition
 * - **events**: Keyboard event handlers
 * - **export/exportLazy**: PNG/PDF export and print functionality
 * - **playableNotes**: Collect playable notes from harmonica holes
 * - **string**: String formatting utilities
 * - **tabNotation**: Harmonica tablature conversion
 *
 * @category Utils
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
