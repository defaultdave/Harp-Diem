/**
 * @packageDocumentation
 * Data layer barrel file - exports all data modules.
 *
 * This module provides the core data structures and functions for:
 * - **Harmonicas**: Harmonica layouts, tunings, and position calculation
 * - **Scales**: Scale generation and note membership checking
 * - **Chords**: Chord voicing generation for harmonica
 * - **Progressions**: Quiz question generation with chord progressions
 *
 * @category Data
 */

// Re-export everything from harmonicas
export {
  type HarmonicaKey,
  type HarmonicaNote,
  type HoleBends,
  type HoleNote,
  type DiatonicHarmonica,
  type TuningType,
  type ScaleType,
  TUNING_TYPES,
  getHarmonica,
  harmonicas,
  AVAILABLE_KEYS,
  SCALE_TYPES,
  getHarmonicaPosition,
} from './harmonicas'

// Re-export everything from scales
export {
  getScaleNotes,
  getNoteOctave,
  isNoteInScale,
  getNoteDegree,
  degreeToRoman,
  getIntervalBetweenNotes,
} from './scales'

// Re-export everything from chords
export {
  type ChordVoicing,
  type ChordQuality,
  getHarmonicaChords,
  getChordsByPosition,
  getCommonChords,
} from './chords'

// Re-export everything from progressions
export {
  type Difficulty,
  type Mode,
  type ChordInProgression,
  type QuizQuestion,
  generateQuestion,
  ALL_KEYS,
} from './progressions'
