/**
 * Chord generation and voicing utilities for diatonic harmonica.
 *
 * Uses algorithmic generation for consecutive chords (works for all tunings)
 * and precomputed tongue blocking patterns with runtime chord detection.
 * @packageDocumentation
 */
import { Note, Chord } from 'tonal'
import type { HarmonicaKey, TuningType } from './harmonicas'
import { getHarmonica } from './harmonicas'
import { getChordKey } from '../utils'

// --- Types ---

/** A chord voicing that can be played on a harmonica. */
export interface ChordVoicing {
  name: string
  shortName: string
  quality: ChordQuality
  holes: number[]
  breath: 'blow' | 'draw'
  notes: string[]
  position: number
  romanNumeral: string
  isConsecutive: boolean
  tuning: TuningType
}

export type ChordQuality = 'major' | 'minor' | 'dominant7' | 'minor7' | 'diminished' | 'augmented'

/**
 * A chord name with all its voicings grouped together.
 * Each group tracks which voicing is currently displayed.
 */
export interface ChordGroup {
  /** Chord name (e.g., "C", "Dm", "G7") */
  name: string
  /** Chord quality for coloring */
  quality: ChordQuality
  /** All voicings of this chord */
  voicings: ChordVoicing[]
  /** Index of currently selected voicing (managed by ChordCard component) */
  currentIndex: number
}

// --- Quality mapping helpers ---

/**
 * Detects our ChordQuality from tonal's chord info.
 * Uses `type` as primary classifier with interval-based fallback,
 * since tonal's `quality` field is too coarse (e.g., "Major" for both triads and dom7).
 */
const detectChordQuality = (chordInfo: ReturnType<typeof Chord.get>): ChordQuality | undefined => {
  const type = chordInfo.type.toLowerCase()

  switch (type) {
    case 'major': return 'major'
    case 'minor': return 'minor'
    case 'diminished': return 'diminished'
    case 'augmented': return 'augmented'
    case 'dominant seventh': return 'dominant7'
    case 'minor seventh': return 'minor7'
    case 'half-diminished': return 'diminished'
    case 'diminished seventh': return 'diminished'
    case 'minor sixth': return 'minor'
    case 'major sixth': return 'major'
  }

  // For non-standard types (e.g., G7no5 has type=""), check intervals
  const intervals = chordInfo.intervals
  const hasMinor7th = intervals.includes('7m')
  const hasMajor7th = intervals.includes('7M')
  const hasMajor3rd = intervals.includes('3M')
  const hasMinor3rd = intervals.includes('3m')

  if (hasMajor7th) return undefined // skip major 7th chords
  if (hasMinor7th && hasMajor3rd) return 'dominant7'
  if (hasMinor7th && hasMinor3rd) return 'minor7'

  return undefined
}

const getChordShortSymbol = (quality: ChordQuality): string => ({
  major: '',
  minor: 'm',
  dominant7: '7',
  minor7: 'm7',
  diminished: 'dim',
  augmented: 'aug',
})[quality]

const getChordQualityName = (quality: ChordQuality): string => ({
  major: 'Major',
  minor: 'Minor',
  dominant7: 'Dominant 7th',
  minor7: 'Minor 7th',
  diminished: 'Diminished',
  augmented: 'Augmented',
})[quality]

// --- Position & roman numeral computation ---

/** Maps semitone distance from harmonica key to circle-of-fifths position. */
const SEMITONE_TO_POSITION: Record<number, number> = {
  0: 1, 7: 2, 2: 3, 9: 4, 4: 5, 11: 6,
  6: 7, 1: 8, 8: 9, 3: 10, 10: 11, 5: 12,
}

const computePosition = (chordRoot: string, harmonicaKey: HarmonicaKey): number => {
  const rootChroma = Note.chroma(chordRoot)
  const keyChroma = Note.chroma(harmonicaKey)
  if (rootChroma === undefined || keyChroma === undefined) return 1
  const semitones = (rootChroma - keyChroma + 12) % 12
  return SEMITONE_TO_POSITION[semitones] || 1
}

const computeRomanNumeral = (chordRoot: string, harmonicaKey: HarmonicaKey, quality: ChordQuality): string => {
  const rootChroma = Note.chroma(chordRoot)
  const keyChroma = Note.chroma(harmonicaKey)
  if (rootChroma === undefined || keyChroma === undefined) return ''

  const semitones = (rootChroma - keyChroma + 12) % 12

  const degreeMap: Record<number, [string, string]> = {
    0: ['I', 'i'],
    1: ['bII', 'bii'],
    2: ['II', 'ii'],
    3: ['bIII', 'biii'],
    4: ['III', 'iii'],
    5: ['IV', 'iv'],
    6: ['#IV', '#iv'],
    7: ['V', 'v'],
    8: ['bVI', 'bvi'],
    9: ['VI', 'vi'],
    10: ['bVII', 'bvii'],
    11: ['VII', 'vii'],
  }

  const [upper, lower] = degreeMap[semitones]

  switch (quality) {
    case 'major': return upper
    case 'minor': return lower
    case 'diminished': return `${lower}°`
    case 'dominant7': return `${upper}7`
    case 'minor7': return `${lower}7`
    case 'augmented': return `${upper}+`
  }
}

// --- Chord detection from harmonica holes ---

/**
 * Detects a chord from a set of harmonica holes played with the same breath.
 * Returns null if the notes don't form a recognized chord.
 */
const detectChord = (
  harmonica: ReturnType<typeof getHarmonica>,
  holes: number[],
  breath: 'blow' | 'draw',
  harmonicaKey: HarmonicaKey,
): Omit<ChordVoicing, 'isConsecutive' | 'tuning'> | null => {
  const notes = holes.map(h => {
    const hole = harmonica.holes[h - 1]
    return breath === 'blow' ? hole.blow.note : hole.draw.note
  })

  const pitchClasses = notes.map(n => Note.pitchClass(n))
  const uniquePitchClasses = [...new Set(pitchClasses)]

  if (uniquePitchClasses.length < 3) return null

  const detected = Chord.detect(uniquePitchClasses)
  if (detected.length === 0) return null

  // Try each detection, pick first with a valid quality mapping
  for (const chordSymbol of detected) {
    const chordInfo = Chord.get(chordSymbol)
    if (!chordInfo.name) continue

    const quality = detectChordQuality(chordInfo)
    if (!quality) continue

    const rootNote = chordInfo.tonic || uniquePitchClasses[0]
    const symbol = getChordShortSymbol(quality)
    const qualityName = getChordQualityName(quality)
    const position = computePosition(rootNote, harmonicaKey)
    const romanNumeral = computeRomanNumeral(rootNote, harmonicaKey, quality)

    return {
      name: `${rootNote} ${qualityName}`,
      shortName: `${rootNote}${symbol}`,
      quality,
      holes,
      breath,
      notes,
      position,
      romanNumeral,
    }
  }

  return null
}

// --- Consecutive chord generation ---

/**
 * Generates all consecutive (adjacent-hole) chord voicings for a harmonica.
 * Scans 3-note and 4-note groups across all 10 holes for both breath directions.
 */
const generateConsecutiveChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
): ChordVoicing[] => {
  const harmonica = getHarmonica(harmonicaKey, tuning)
  const voicings: ChordVoicing[] = []

  for (const breath of ['blow', 'draw'] as const) {
    // 3-note groups: [1,2,3], [2,3,4], ..., [8,9,10]
    for (let start = 1; start <= 8; start++) {
      const holes = [start, start + 1, start + 2]
      const result = detectChord(harmonica, holes, breath, harmonicaKey)
      if (result) voicings.push({ ...result, isConsecutive: true, tuning })
    }
    // 4-note groups: [1,2,3,4], ..., [7,8,9,10]
    for (let start = 1; start <= 7; start++) {
      const holes = [start, start + 1, start + 2, start + 3]
      const result = detectChord(harmonica, holes, breath, harmonicaKey)
      if (result) voicings.push({ ...result, isConsecutive: true, tuning })
    }
  }

  return voicings
}

// --- Tongue blocking chord generation ---

/**
 * Precomputed valid tongue blocking hole combinations.
 * Non-adjacent holes with exactly one contiguous blocked section,
 * span ≤ 5 holes, skip 1-2 holes.
 */
const TB_HOLE_PATTERNS: number[][] = [
  // 3-note: gap after 2nd note, skip 1 — [a, a+1, a+3]
  [1,2,4], [2,3,5], [3,4,6], [4,5,7], [5,6,8], [6,7,9], [7,8,10],
  // 3-note: gap after 2nd note, skip 2 — [a, a+1, a+4]
  [1,2,5], [2,3,6], [3,4,7], [4,5,8], [5,6,9], [6,7,10],
  // 3-note: gap after 1st note, skip 1 — [a, a+2, a+3]
  [1,3,4], [2,4,5], [3,5,6], [4,6,7], [5,7,8], [6,8,9], [7,9,10],
  // 3-note: gap after 1st note, skip 2 — [a, a+3, a+4]
  [1,4,5], [2,5,6], [3,6,7], [4,7,8], [5,8,9], [6,9,10],
  // 4-note: gap after 1st note, skip 1 — [a, a+2, a+3, a+4]
  [1,3,4,5], [2,4,5,6], [3,5,6,7], [4,6,7,8], [5,7,8,9], [6,8,9,10],
  // 4-note: gap after 1st note, skip 2 — [a, a+3, a+4, a+5]
  [1,4,5,6], [2,5,6,7], [3,6,7,8], [4,7,8,9], [5,8,9,10],
  // 4-note: gap in middle, skip 1 — [a, a+1, a+3, a+4]
  [1,2,4,5], [2,3,5,6], [3,4,6,7], [4,5,7,8], [5,6,8,9], [6,7,9,10],
  // 4-note: gap in middle, skip 2 — [a, a+1, a+4, a+5]
  [1,2,5,6], [2,3,6,7], [3,4,7,8], [4,5,8,9], [5,6,9,10],
  // 4-note: gap after 3rd note, skip 1 — [a, a+1, a+2, a+4]
  [1,2,3,5], [2,3,4,6], [3,4,5,7], [4,5,6,8], [5,6,7,9], [6,7,8,10],
  // 4-note: gap after 3rd note, skip 2 — [a, a+1, a+2, a+5]
  [1,2,3,6], [2,3,4,7], [3,4,5,8], [4,5,6,9], [5,6,7,10],
]

/**
 * Generates tongue blocking chord voicings by testing precomputed
 * hole patterns against the harmonica's actual notes.
 */
const generateTBChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
): ChordVoicing[] => {
  const harmonica = getHarmonica(harmonicaKey, tuning)
  const voicings: ChordVoicing[] = []

  for (const breath of ['blow', 'draw'] as const) {
    for (const holes of TB_HOLE_PATTERNS) {
      const result = detectChord(harmonica, holes, breath, harmonicaKey)
      if (result) voicings.push({ ...result, isConsecutive: false, tuning })
    }
  }

  return voicings
}

// --- Main chord API ---

const chordCache = new Map<string, ChordVoicing[]>()

/**
 * Gets all available chord voicings for a given harmonica key and tuning.
 * Returns both consecutive and tongue blocking voicings.
 */
export const getHarmonicaChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
): ChordVoicing[] => {
  const cacheKey = `${harmonicaKey}:${tuning}`
  if (chordCache.has(cacheKey)) return chordCache.get(cacheKey)!

  const consecutive = generateConsecutiveChords(harmonicaKey, tuning)
  const tb = generateTBChords(harmonicaKey, tuning)
  const all = [...consecutive, ...tb]

  chordCache.set(cacheKey, all)
  return all
}

/**
 * Gets all chord voicings for a given harmonica key and tuning.
 * Alias for getHarmonicaChords for consistency with other APIs.
 */
export const getAllChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning)
}

/**
 * Gets chords filtered by harmonica position.
 */
export const getChordsByPosition = (
  harmonicaKey: HarmonicaKey,
  position: number,
  tuning: TuningType = 'richter',
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning).filter((chord) => chord.position === position)
}

/**
 * Gets unique chords sorted by breath direction and hole position.
 */
export const getCommonChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey, tuning)

  const uniqueChords = new Map<string, ChordVoicing>()
  allChords.forEach((chord) => {
    const key = getChordKey(chord)
    if (!uniqueChords.has(key)) {
      uniqueChords.set(key, chord)
    }
  })

  return Array.from(uniqueChords.values()).sort((a, b) => {
    if (a.breath !== b.breath) return a.breath === 'blow' ? -1 : 1
    return a.holes[0] - b.holes[0]
  })
}

/**
 * Finds all voicings for a specific chord by name.
 */
export const findChordVoicings = (
  chordName: string,
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey, tuning)
  return allChords.filter((chord) => chord.shortName === chordName)
}

/**
 * Gets a single chord voicing by name, preferring consecutive holes.
 */
export const getChordByName = (
  chordName: string,
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
): ChordVoicing | undefined => {
  const voicings = findChordVoicings(chordName, harmonicaKey, tuning)
  if (voicings.length === 0) return undefined

  const consecutive = voicings.find((v) => v.isConsecutive)
  return consecutive || voicings[0]
}

/**
 * Filters chords to only include those where ALL notes are in the scale.
 * Uses Note.chroma() for enharmonic comparison (C# matches Db).
 */
export const getScaleFilteredChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
  scaleNotes: string[],
): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey, tuning)

  return allChords.filter((chord) => {
    return chord.notes.every((note) => {
      const noteChroma = Note.chroma(note)
      if (noteChroma === undefined) return false

      return scaleNotes.some((scaleNote) => {
        const scaleChroma = Note.chroma(scaleNote)
        return scaleChroma === noteChroma
      })
    })
  })
}

/**
 * Gets all tongue blocking chord voicings for a given harmonica key and tuning.
 */
export const getTongueBlockingChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning).filter(v => !v.isConsecutive)
}

/**
 * Gets tongue blocking chords filtered to only those with all notes in scale.
 */
export const getScaleFilteredTongueBlockingChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
  scaleNotes: string[],
): ChordVoicing[] => {
  return getScaleFilteredChords(harmonicaKey, tuning, scaleNotes).filter(v => !v.isConsecutive)
}

/**
 * Groups chord voicings by chord name.
 * Each group contains all voicings of that chord.
 */
export const groupChordsByName = (chords: ChordVoicing[]): ChordGroup[] => {
  const groups = new Map<string, ChordVoicing[]>()

  chords.forEach((chord) => {
    const existing = groups.get(chord.shortName) || []
    existing.push(chord)
    groups.set(chord.shortName, existing)
  })

  return Array.from(groups.entries())
    .map(([name, voicings]) => ({
      name,
      quality: voicings[0].quality,
      voicings: voicings.sort((a, b) => {
        if (a.breath !== b.breath) return a.breath === 'blow' ? -1 : 1
        return a.holes[0] - b.holes[0]
      }),
      currentIndex: 0,
    }))
    .sort((a, b) => {
      const aFirst = a.voicings[0]
      const bFirst = b.voicings[0]
      if (aFirst.breath !== bFirst.breath) return aFirst.breath === 'blow' ? -1 : 1
      return aFirst.holes[0] - bFirst.holes[0]
    })
}
