import { Note, Scale } from 'tonal'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type Mode = 'major' | 'minor'

/**
 * Represents a single chord in a progression with its notes and context
 */
export interface ChordInProgression {
  name: string // e.g., "C", "Am", "G7"
  romanNumeral: string // e.g., "I", "IV", "V"
  notes: string[] // Actual notes with octaves, e.g., ["C4", "E4", "G4"]
}

/**
 * Represents a quiz question with a chord progression
 */
export interface QuizQuestion {
  key: string // e.g., "C"
  mode: Mode // 'major' or 'minor'
  progression: ChordInProgression[]
}

// Keys available at each difficulty level
const DIFFICULTY_KEYS: Record<Difficulty, string[]> = {
  easy: ['C', 'G', 'D', 'A', 'E', 'F'],
  medium: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  hard: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
}

// Progression patterns by difficulty and mode
// Each pattern is an array of [degree, quality, romanNumeral]
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
 * Get the scale degrees for a given mode
 */
function getScaleDegrees(key: string, mode: Mode): string[] {
  const scaleName = mode === 'major' ? 'major' : 'minor'
  const scaleData = Scale.get(`${key} ${scaleName}`)
  return scaleData.notes
}

/**
 * Build a chord from a scale degree
 * Uses interval-based construction to preserve octave information
 * (Chord.getChord strips octaves, causing Note.freq() to return null)
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
 * Get the root note for a scale degree
 */
function getDegreeRoot(key: string, mode: Mode, degree: number): string {
  const degrees = getScaleDegrees(key, mode)
  // Degrees are 1-indexed, array is 0-indexed
  return degrees[(degree - 1) % 7]
}

/**
 * Get the symbol for a chord quality
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
 * Generate a random quiz question based on difficulty
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
 * All keys available for answer selection
 */
export const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
