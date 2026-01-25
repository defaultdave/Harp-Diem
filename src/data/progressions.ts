/**
 * @packageDocumentation
 * Chord progression generation for the key identification quiz.
 *
 * This module generates random chord progressions at various difficulty levels
 * for ear training purposes. Players listen to progressions and identify the key.
 *
 * @remarks
 * Progressions are built using scale degrees and common patterns from
 * Western music theory (I-IV-V, ii-V-I, etc.). The difficulty affects
 * both the available keys and the complexity of the progressions.
 *
 * @category Data
 */
import { Note, Scale } from 'tonal'

/**
 * Quiz difficulty levels affecting key selection and progression complexity.
 *
 * - **easy**: Simple keys (C, G, D, A, E, F) with basic I-IV-V patterns
 * - **medium**: All 12 keys with more varied progressions (vi, ii chords)
 * - **hard**: All 12 keys with jazz-influenced progressions (ii-V-I, V7)
 */
export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * Musical mode for the progression (major or minor).
 */
export type Mode = 'major' | 'minor'

/**
 * A chord within a progression, including its notes and harmonic function.
 *
 * @example
 * ```typescript
 * // The IV chord in C major
 * {
 *   name: "F",
 *   romanNumeral: "IV",
 *   notes: ["F4", "A4", "C5"]
 * }
 * ```
 */
export interface ChordInProgression {
  /** Chord symbol (e.g., "C", "Am", "G7", "Dm") */
  name: string
  /** Roman numeral showing harmonic function (e.g., "I", "IV", "V7", "ii") */
  romanNumeral: string
  /** Notes in the chord with octaves for audio playback */
  notes: string[]
}

/**
 * A complete quiz question with key, mode, and chord progression.
 *
 * @example
 * ```typescript
 * {
 *   key: "G",
 *   mode: "major",
 *   progression: [
 *     { name: "G", romanNumeral: "I", notes: ["G4", "B4", "D5"] },
 *     { name: "C", romanNumeral: "IV", notes: ["C4", "E4", "G4"] },
 *     { name: "D", romanNumeral: "V", notes: ["D4", "F#4", "A4"] }
 *   ]
 * }
 * ```
 */
export interface QuizQuestion {
  /** The key of the progression (e.g., "C", "G", "Bb") */
  key: string
  /** Whether the progression is in major or minor mode */
  mode: Mode
  /** The chord progression to play */
  progression: ChordInProgression[]
}

/**
 * Keys available at each difficulty level.
 * Easy uses common keys; medium and hard use all 12 keys.
 * @internal
 */
const DIFFICULTY_KEYS: Record<Difficulty, string[]> = {
  easy: ['C', 'G', 'D', 'A', 'E', 'F'],
  medium: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  hard: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
}

/**
 * Progression pattern definition: [scaleDegree, chordQuality, romanNumeral]
 * @internal
 */
type ProgressionPattern = [number, string, string][]

const MAJOR_PROGRESSIONS: Record<Difficulty, ProgressionPattern[]> = {
  easy: [
    // I - IV - V
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V']],
    // I - V - I
    [[1, 'major', 'I'], [5, 'major', 'V'], [1, 'major', 'I']],
    // I - IV - I
    [[1, 'major', 'I'], [4, 'major', 'IV'], [1, 'major', 'I']],
  ],
  medium: [
    // I - IV - V
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V']],
    // I - V - vi - IV (pop progression)
    [[1, 'major', 'I'], [5, 'major', 'V'], [6, 'minor', 'vi'], [4, 'major', 'IV']],
    // I - vi - IV - V (50s progression)
    [[1, 'major', 'I'], [6, 'minor', 'vi'], [4, 'major', 'IV'], [5, 'major', 'V']],
    // I - IV - V - IV
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V'], [4, 'major', 'IV']],
  ],
  hard: [
    // I - IV - V
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V']],
    // I - V - vi - IV
    [[1, 'major', 'I'], [5, 'major', 'V'], [6, 'minor', 'vi'], [4, 'major', 'IV']],
    // ii - V - I (jazz cadence)
    [[2, 'minor', 'ii'], [5, '7', 'V7'], [1, 'major', 'I']],
    // I - vi - ii - V (rhythm changes)
    [[1, 'major', 'I'], [6, 'minor', 'vi'], [2, 'minor', 'ii'], [5, '7', 'V7']],
    // I - IV - ii - V
    [[1, 'major', 'I'], [4, 'major', 'IV'], [2, 'minor', 'ii'], [5, 'major', 'V']],
  ],
}

const MINOR_PROGRESSIONS: Record<Difficulty, ProgressionPattern[]> = {
  easy: [
    // i - iv - v
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, 'minor', 'v']],
    // i - v - i
    [[1, 'minor', 'i'], [5, 'minor', 'v'], [1, 'minor', 'i']],
    // i - iv - i
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [1, 'minor', 'i']],
  ],
  medium: [
    // i - iv - v
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, 'minor', 'v']],
    // i - VI - III - VII (Andalusian-like)
    [[1, 'minor', 'i'], [6, 'major', 'VI'], [3, 'major', 'III'], [7, 'major', 'VII']],
    // i - iv - VII - III
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [7, 'major', 'VII'], [3, 'major', 'III']],
    // i - VII - VI - VII
    [[1, 'minor', 'i'], [7, 'major', 'VII'], [6, 'major', 'VI'], [7, 'major', 'VII']],
  ],
  hard: [
    // i - iv - v
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, 'minor', 'v']],
    // i - VI - III - VII
    [[1, 'minor', 'i'], [6, 'major', 'VI'], [3, 'major', 'III'], [7, 'major', 'VII']],
    // ii° - V - i (minor jazz cadence)
    [[2, 'diminished', 'ii°'], [5, '7', 'V7'], [1, 'minor', 'i']],
    // i - iv - V7 - i (with harmonic minor V)
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, '7', 'V7'], [1, 'minor', 'i']],
    // i - VII - VI - V7
    [[1, 'minor', 'i'], [7, 'major', 'VII'], [6, 'major', 'VI'], [5, '7', 'V7']],
  ],
}

/**
 * Gets the scale notes for a given key and mode.
 *
 * @param key - The root key (e.g., "C", "G")
 * @param mode - Major or minor mode
 * @returns Array of note names in the scale
 * @internal
 */
function getScaleDegrees(key: string, mode: Mode): string[] {
  const scaleName = mode === 'major' ? 'major' : 'minor'
  const scaleData = Scale.get(`${key} ${scaleName}`)
  return scaleData.notes
}

/**
 * Builds a chord from a root note and quality using intervals.
 *
 * @remarks
 * Uses interval-based construction rather than Chord.getChord() to preserve
 * octave information. This is necessary because Note.freq() requires octaves
 * to return valid frequencies for audio playback.
 *
 * @param root - The chord root note (without octave, e.g., "C", "G")
 * @param quality - Chord quality ("major", "minor", "7", "diminished")
 * @param octave - Base octave for the chord (default: 4)
 * @returns Array of notes with octaves (e.g., ["C4", "E4", "G4"])
 * @internal
 */
function buildChord(root: string, quality: string, octave: number = 4): string[] {
  // Define intervals for each chord quality
  const qualityIntervals: Record<string, string[]> = {
    'major': ['1P', '3M', '5P'],
    'minor': ['1P', '3m', '5P'],
    '7': ['1P', '3M', '5P', '7m'],
    'diminished': ['1P', '3m', '5d'],
  }

  const intervals = qualityIntervals[quality] || qualityIntervals['major']

  // Use Note.transpose to build chord - this preserves octave information
  return intervals.map(interval => Note.transpose(`${root}${octave}`, interval))
}

/**
 * Gets the root note for a given scale degree.
 *
 * @param key - The key (e.g., "C")
 * @param mode - Major or minor mode
 * @param degree - Scale degree (1-7)
 * @returns The note name at that degree (e.g., degree 5 in C major = "G")
 * @internal
 */
function getDegreeRoot(key: string, mode: Mode, degree: number): string {
  const degrees = getScaleDegrees(key, mode)
  // Degrees are 1-indexed, array is 0-indexed
  return degrees[(degree - 1) % 7]
}

/**
 * Creates a chord symbol from root and quality.
 *
 * @param root - The chord root (e.g., "C", "F#")
 * @param quality - Chord quality (e.g., "major", "minor", "7")
 * @returns Chord symbol (e.g., "C", "Am", "G7", "Bdim")
 * @internal
 */
function getChordSymbol(root: string, quality: string): string {
  const symbolMap: Record<string, string> = {
    'major': '',
    'minor': 'm',
    '7': '7',
    'diminished': 'dim',
  }
  return `${root}${symbolMap[quality] || ''}`
}

/**
 * Generates a random quiz question based on difficulty level.
 *
 * @remarks
 * The function randomly selects:
 * 1. A key from the difficulty-appropriate key pool
 * 2. A mode (major or minor, 50/50 chance)
 * 3. A progression pattern from the difficulty/mode pool
 *
 * The progression is then built with actual notes for audio playback.
 *
 * @param difficulty - The difficulty level (easy, medium, hard)
 * @returns A complete QuizQuestion ready for playback and display
 *
 * @example
 * ```typescript
 * const question = generateQuestion('medium')
 * // question.key might be "Bb"
 * // question.mode might be "minor"
 * // question.progression would be 3-4 chords with notes
 * ```
 */
export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  // Pick random key from difficulty-appropriate keys
  const availableKeys = DIFFICULTY_KEYS[difficulty]
  const key = availableKeys[Math.floor(Math.random() * availableKeys.length)]

  // Pick random mode
  const mode: Mode = Math.random() < 0.5 ? 'major' : 'minor'

  // Get progressions for this difficulty and mode
  const progressions = mode === 'major'
    ? MAJOR_PROGRESSIONS[difficulty]
    : MINOR_PROGRESSIONS[difficulty]

  // Pick random progression pattern
  const pattern = progressions[Math.floor(Math.random() * progressions.length)]

  // Build the chord progression
  const progression: ChordInProgression[] = pattern.map(([degree, quality, romanNumeral]) => {
    const root = getDegreeRoot(key, mode, degree)
    const notes = buildChord(root, quality, 4)
    const name = getChordSymbol(root, quality)

    return {
      name,
      romanNumeral,
      notes,
    }
  })

  return {
    key,
    mode,
    progression,
  }
}

/**
 * All 12 musical keys available for answer selection in the quiz.
 *
 * @remarks
 * Uses flat/sharp naming to avoid duplicates (Db not C#, F# not Gb).
 * This matches the keys used throughout the application.
 */
export const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
