/**
 * Chord progression generation for the key identification quiz.
 * @packageDocumentation
 */
import { Note, Scale } from 'tonal'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type Mode = 'major' | 'minor'

/** A chord within a progression, including its notes and harmonic function. */
export interface ChordInProgression {
  name: string
  romanNumeral: string
  notes: string[]
}

/** A complete quiz question with key, mode, and chord progression. */
export interface QuizQuestion {
  key: string
  mode: Mode
  progression: ChordInProgression[]
}

const DIFFICULTY_KEYS: Record<Difficulty, string[]> = {
  easy: ['C', 'G', 'D', 'A', 'E', 'F'],
  medium: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  hard: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
}

type ProgressionPattern = [number, string, string][]

const MAJOR_PROGRESSIONS: Record<Difficulty, ProgressionPattern[]> = {
  easy: [
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V']],
    [[1, 'major', 'I'], [5, 'major', 'V'], [1, 'major', 'I']],
    [[1, 'major', 'I'], [4, 'major', 'IV'], [1, 'major', 'I']],
  ],
  medium: [
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V']],
    [[1, 'major', 'I'], [5, 'major', 'V'], [6, 'minor', 'vi'], [4, 'major', 'IV']],
    [[1, 'major', 'I'], [6, 'minor', 'vi'], [4, 'major', 'IV'], [5, 'major', 'V']],
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V'], [4, 'major', 'IV']],
  ],
  hard: [
    [[1, 'major', 'I'], [4, 'major', 'IV'], [5, 'major', 'V']],
    [[1, 'major', 'I'], [5, 'major', 'V'], [6, 'minor', 'vi'], [4, 'major', 'IV']],
    [[2, 'minor', 'ii'], [5, '7', 'V7'], [1, 'major', 'I']],
    [[1, 'major', 'I'], [6, 'minor', 'vi'], [2, 'minor', 'ii'], [5, '7', 'V7']],
    [[1, 'major', 'I'], [4, 'major', 'IV'], [2, 'minor', 'ii'], [5, 'major', 'V']],
  ],
}

const MINOR_PROGRESSIONS: Record<Difficulty, ProgressionPattern[]> = {
  easy: [
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, 'minor', 'v']],
    [[1, 'minor', 'i'], [5, 'minor', 'v'], [1, 'minor', 'i']],
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [1, 'minor', 'i']],
  ],
  medium: [
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, 'minor', 'v']],
    [[1, 'minor', 'i'], [6, 'major', 'VI'], [3, 'major', 'III'], [7, 'major', 'VII']],
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [7, 'major', 'VII'], [3, 'major', 'III']],
    [[1, 'minor', 'i'], [7, 'major', 'VII'], [6, 'major', 'VI'], [7, 'major', 'VII']],
  ],
  hard: [
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, 'minor', 'v']],
    [[1, 'minor', 'i'], [6, 'major', 'VI'], [3, 'major', 'III'], [7, 'major', 'VII']],
    [[2, 'diminished', 'ii°'], [5, '7', 'V7'], [1, 'minor', 'i']],
    [[1, 'minor', 'i'], [4, 'minor', 'iv'], [5, '7', 'V7'], [1, 'minor', 'i']],
    [[1, 'minor', 'i'], [7, 'major', 'VII'], [6, 'major', 'VI'], [5, '7', 'V7']],
  ],
}

function getScaleDegrees(key: string, mode: Mode): string[] {
  const scaleName = mode === 'major' ? 'major' : 'minor'
  const scaleData = Scale.get(`${key} ${scaleName}`)
  return scaleData.notes
}

/** Builds a chord using interval-based construction to preserve octave info. */
function buildChord(root: string, quality: string, octave: number = 4): string[] {
  const qualityIntervals: Record<string, string[]> = {
    'major': ['1P', '3M', '5P'],
    'minor': ['1P', '3m', '5P'],
    '7': ['1P', '3M', '5P', '7m'],
    'diminished': ['1P', '3m', '5d'],
  }

  const intervals = qualityIntervals[quality] || qualityIntervals['major']
  return intervals.map(interval => Note.transpose(`${root}${octave}`, interval))
}

function getDegreeRoot(key: string, mode: Mode, degree: number): string {
  const degrees = getScaleDegrees(key, mode)
  return degrees[(degree - 1) % 7]
}

function getChordSymbol(root: string, quality: string): string {
  const symbolMap: Record<string, string> = {
    'major': '',
    'minor': 'm',
    '7': '7',
    'diminished': 'dim',
  }
  return `${root}${symbolMap[quality] || ''}`
}

/** Generates a random quiz question based on difficulty level. */
export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  const availableKeys = DIFFICULTY_KEYS[difficulty]
  const key = availableKeys[Math.floor(Math.random() * availableKeys.length)]
  const mode: Mode = Math.random() < 0.5 ? 'major' : 'minor'

  const progressions = mode === 'major'
    ? MAJOR_PROGRESSIONS[difficulty]
    : MINOR_PROGRESSIONS[difficulty]

  const pattern = progressions[Math.floor(Math.random() * progressions.length)]

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

/** All 12 musical keys available for answer selection. */
export const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
