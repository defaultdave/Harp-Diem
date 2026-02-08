/**
 * Data layer exports: harmonicas, scales, chords, and progressions.
 * @packageDocumentation
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
  type TongueBlockingParams,
  type ChordGroup,
  DEFAULT_TONGUE_BLOCKING,
  getHarmonicaChords,
  getChordsByPosition,
  getCommonChords,
  findChordVoicings,
  getChordByName,
  getAllChords,
  getScaleFilteredChords,
  getScaleFilteredTongueBlockingChords,
  getTongueBlockingChords,
  groupChordsByName,
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
