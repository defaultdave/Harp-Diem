/**
 * Chord generation and voicing utilities for diatonic harmonica.
 * @packageDocumentation
 */
import { Note, Interval, Chord } from 'tonal'
import type { HarmonicaKey, TuningType } from './harmonicas'
import { getHarmonica } from './harmonicas'
import { getChordKey } from '../utils'

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
 * Configuration for tongue blocking chord generation.
 * Controls which non-adjacent hole combinations are valid.
 */
export interface TongueBlockingParams {
  /** Maximum span between lowest and highest hole (default: 5) */
  maxSpan: number
  /** Minimum holes skipped between played holes (default: 1) */
  minSkip: number
  /** Maximum holes skipped between played holes (default: 2) */
  maxSkip: number
}

export const DEFAULT_TONGUE_BLOCKING: TongueBlockingParams = {
  maxSpan: 5,
  minSkip: 1,
  maxSkip: 2,
}

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

/**
 * Curated chord voicings for C Richter harmonica.
 * All notes are explicitly defined and pre-validated against music theory.
 */
interface BaseChordVoicing {
  name: string
  shortName: string
  quality: ChordQuality
  holes: number[]
  breath: 'blow' | 'draw'
  notes: string[]
  position: number
  romanNumeral: string
}

/**
 * C Richter harmonica layout:
 * Blow: C4 E4 G4 C5 E5 G5 C6 E6 G6 C7
 * Draw: D4 G4 B4 D5 F5 A5 B5 D6 F6 A6
 */
const C_RICHTER_VOICINGS: BaseChordVoicing[] = [
  // C Major voicings (I)
  {
    name: 'C Major',
    shortName: 'C',
    quality: 'major',
    holes: [1, 2, 3],
    breath: 'blow',
    notes: ['C4', 'E4', 'G4'],
    position: 1,
    romanNumeral: 'I',
  },
  {
    name: 'C Major',
    shortName: 'C',
    quality: 'major',
    holes: [1, 2, 3, 4],
    breath: 'blow',
    notes: ['C4', 'E4', 'G4', 'C5'],
    position: 1,
    romanNumeral: 'I',
  },
  {
    name: 'C Major',
    shortName: 'C',
    quality: 'major',
    holes: [4, 5, 6],
    breath: 'blow',
    notes: ['C5', 'E5', 'G5'],
    position: 1,
    romanNumeral: 'I',
  },
  {
    name: 'C Major',
    shortName: 'C',
    quality: 'major',
    holes: [4, 5, 6, 7],
    breath: 'blow',
    notes: ['C5', 'E5', 'G5', 'C6'],
    position: 1,
    romanNumeral: 'I',
  },
  {
    name: 'C Major',
    shortName: 'C',
    quality: 'major',
    holes: [7, 8, 9],
    breath: 'blow',
    notes: ['C6', 'E6', 'G6'],
    position: 1,
    romanNumeral: 'I',
  },
  {
    name: 'C Major',
    shortName: 'C',
    quality: 'major',
    holes: [7, 8, 9, 10],
    breath: 'blow',
    notes: ['C6', 'E6', 'G6', 'C7'],
    position: 1,
    romanNumeral: 'I',
  },

  // D minor voicings (ii)
  {
    name: 'D Minor',
    shortName: 'Dm',
    quality: 'minor',
    holes: [4, 5, 6],
    breath: 'draw',
    notes: ['D5', 'F5', 'A5'],
    position: 1,
    romanNumeral: 'ii',
  },
  {
    name: 'D Minor',
    shortName: 'Dm',
    quality: 'minor',
    holes: [8, 9, 10],
    breath: 'draw',
    notes: ['D6', 'F6', 'A6'],
    position: 1,
    romanNumeral: 'ii',
  },

  // G Major voicings (V)
  {
    name: 'G Major',
    shortName: 'G',
    quality: 'major',
    holes: [2, 3, 4],
    breath: 'draw',
    notes: ['G4', 'B4', 'D5'],
    position: 2,
    romanNumeral: 'I',
  },
  {
    name: 'G Major',
    shortName: 'G',
    quality: 'major',
    holes: [1, 2, 3, 4],
    breath: 'draw',
    notes: ['D4', 'G4', 'B4', 'D5'],
    position: 2,
    romanNumeral: 'I',
  },

  // G7 voicings (V7)
  {
    name: 'G Dominant 7th',
    shortName: 'G7',
    quality: 'dominant7',
    holes: [2, 3, 4, 5],
    breath: 'draw',
    notes: ['G4', 'B4', 'D5', 'F5'],
    position: 1,
    romanNumeral: 'V7',
  },

  // B diminished voicings (vii°)
  {
    name: 'B Diminished',
    shortName: 'Bdim',
    quality: 'diminished',
    holes: [3, 4, 5],
    breath: 'draw',
    notes: ['B4', 'D5', 'F5'],
    position: 1,
    romanNumeral: 'vii°',
  },
  {
    name: 'B Diminished',
    shortName: 'Bdim',
    quality: 'diminished',
    holes: [7, 8, 9],
    breath: 'draw',
    notes: ['B5', 'D6', 'F6'],
    position: 1,
    romanNumeral: 'vii°',
  },
]

/**
 * Checks if an array of hole numbers are consecutive (adjacent).
 */
const isConsecutive = (holes: number[]): boolean => {
  if (holes.length <= 1) return true
  const sorted = [...holes].sort((a, b) => a - b)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== 1) return false
  }
  return true
}

/**
 * Key configuration for octave shifts.
 * Keys C-F# start at octave 4, G-B start at octave 3.
 */
const HARMONICA_KEY_CONFIG: Record<HarmonicaKey, { startOctave: number }> = {
  C: { startOctave: 4 },
  Db: { startOctave: 4 },
  D: { startOctave: 4 },
  Eb: { startOctave: 4 },
  E: { startOctave: 4 },
  F: { startOctave: 4 },
  'F#': { startOctave: 4 },
  G: { startOctave: 3 },
  Ab: { startOctave: 3 },
  A: { startOctave: 3 },
  Bb: { startOctave: 3 },
  B: { startOctave: 3 },
}

const C_START_OCTAVE = 4

/**
 * Transposes a chord voicing from C to the target key.
 * Matches the transposition logic in harmonicas.ts, including octave adjustments.
 */
const transposeVoicing = (
  baseVoicing: BaseChordVoicing,
  targetKey: HarmonicaKey,
  tuning: TuningType
): ChordVoicing => {
  // Simple case - no transposition needed
  if (targetKey === 'C') {
    return {
      name: baseVoicing.name,
      shortName: baseVoicing.shortName,
      quality: baseVoicing.quality,
      holes: baseVoicing.holes,
      breath: baseVoicing.breath,
      notes: baseVoicing.notes,
      position: baseVoicing.position,
      romanNumeral: baseVoicing.romanNumeral,
      isConsecutive: isConsecutive(baseVoicing.holes),
      tuning,
    }
  }

  // Calculate transposition interval and octave shift
  const keyDifference = Interval.semitones(Interval.distance('C', targetKey)) || 0
  const octaveShift = HARMONICA_KEY_CONFIG[targetKey].startOctave - C_START_OCTAVE

  // Transpose each note with octave adjustment
  const transposeNote = (note: string): string => {
    const transposed = Note.transpose(note, Interval.fromSemitones(keyDifference))
    if (octaveShift === 0) return transposed
    return Note.transpose(transposed, Interval.fromSemitones(octaveShift * 12))
  }

  const transposedNotes = baseVoicing.notes.map(transposeNote)

  // Transpose the chord root from the base voicing name, not from the first note
  // (first note may be an inversion, e.g. G Major [1,2,3,4] has D as bass, not G)
  const baseRoot = baseVoicing.shortName.match(/^([A-G][#b]?)/)?.[1] || Note.pitchClass(baseVoicing.notes[0])
  const rootNote = Note.pitchClass(transposeNote(baseRoot + '4'))
  const qualitySymbol = {
    major: '',
    minor: 'm',
    dominant7: '7',
    minor7: 'm7',
    diminished: 'dim',
    augmented: 'aug',
  }[baseVoicing.quality]

  const qualityName = {
    major: 'Major',
    minor: 'Minor',
    dominant7: 'Dominant 7th',
    minor7: 'Minor 7th',
    diminished: 'Diminished',
    augmented: 'Augmented',
  }[baseVoicing.quality]

  return {
    name: `${rootNote} ${qualityName}`,
    shortName: `${rootNote}${qualitySymbol}`,
    quality: baseVoicing.quality,
    holes: baseVoicing.holes,
    breath: baseVoicing.breath,
    notes: transposedNotes,
    position: baseVoicing.position,
    romanNumeral: baseVoicing.romanNumeral,
    isConsecutive: isConsecutive(baseVoicing.holes),
    tuning,
  }
}

/**
 * Gets all chord voicings for the specified tuning.
 * Currently only Richter is fully curated; other tunings fall back to Richter with a warning.
 */
const getBaseVoicings = (tuning: TuningType): BaseChordVoicing[] => {
  if (tuning !== 'richter') {
    console.warn(`Tuning "${tuning}" chord voicings not yet curated, using richter`)
  }
  return C_RICHTER_VOICINGS
}

/**
 * Gets all available chord voicings for a given harmonica key and tuning.
 */
export const getHarmonicaChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  const baseVoicings = getBaseVoicings(tuning)
  return baseVoicings.map((voicing) => transposeVoicing(voicing, harmonicaKey, tuning))
}

/**
 * Gets all chord voicings for a given harmonica key and tuning.
 * Alias for getHarmonicaChords for consistency with other APIs.
 */
export const getAllChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning)
}

/**
 * Gets chords filtered by harmonica position.
 */
export const getChordsByPosition = (
  harmonicaKey: HarmonicaKey,
  position: number,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning).filter((chord) => chord.position === position)
}

/**
 * Gets unique chords sorted by breath direction and hole position.
 */
export const getCommonChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
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
 * @param chordName - The chord name to search for (e.g., "C", "Dm", "G7")
 * @param harmonicaKey - The harmonica key
 * @param tuning - The harmonica tuning (default: 'richter')
 * @returns Array of matching chord voicings
 */
export const findChordVoicings = (
  chordName: string,
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey, tuning)
  return allChords.filter((chord) => chord.shortName === chordName)
}

/**
 * Gets a single chord voicing by name, preferring consecutive holes.
 * @param chordName - The chord name to search for (e.g., "C", "Dm", "G7")
 * @param harmonicaKey - The harmonica key
 * @param tuning - The harmonica tuning (default: 'richter')
 * @returns The first matching chord voicing, or undefined if not found
 */
export const getChordByName = (
  chordName: string,
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing | undefined => {
  const voicings = findChordVoicings(chordName, harmonicaKey, tuning)
  if (voicings.length === 0) return undefined

  // Prefer consecutive holes if available
  const consecutive = voicings.find((v) => v.isConsecutive)
  return consecutive || voicings[0]
}

/**
 * Filters chords to only include those where ALL notes are in the scale.
 * Uses Note.chroma() for enharmonic comparison (C# matches Db).
 * @param harmonicaKey - The harmonica key
 * @param tuning - The harmonica tuning
 * @param scaleNotes - The notes in the selected scale (pitch classes)
 * @returns Chords where all notes are in scale
 */
export const getScaleFilteredChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
  scaleNotes: string[]
): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey, tuning)

  return allChords.filter((chord) => {
    // Check if every note in the chord is in the scale
    return chord.notes.every((note) => {
      const noteChroma = Note.chroma(note)
      if (noteChroma === undefined) return false

      // Check if any scale note has matching chroma
      return scaleNotes.some((scaleNote) => {
        const scaleChroma = Note.chroma(scaleNote)
        return scaleChroma === noteChroma
      })
    })
  })
}

/**
 * Groups chord voicings by chord name.
 * Each group contains all voicings of that chord.
 * @param chords - Array of chord voicings to group
 * @returns Array of ChordGroup objects
 */
export const groupChordsByName = (chords: ChordVoicing[]): ChordGroup[] => {
  // Group by shortName (e.g., "C", "Dm", "G7")
  const groups = new Map<string, ChordVoicing[]>()

  chords.forEach((chord) => {
    const existing = groups.get(chord.shortName) || []
    existing.push(chord)
    groups.set(chord.shortName, existing)
  })

  // Convert to ChordGroup array, sorted by breath then hole position
  return Array.from(groups.entries())
    .map(([name, voicings]) => ({
      name,
      quality: voicings[0].quality,
      voicings: voicings.sort((a, b) => {
        // Sort by breath direction (blow first), then hole position
        if (a.breath !== b.breath) return a.breath === 'blow' ? -1 : 1
        return a.holes[0] - b.holes[0]
      }),
      currentIndex: 0,
    }))
    .sort((a, b) => {
      // Sort groups by breath direction and lowest hole
      const aFirst = a.voicings[0]
      const bFirst = b.voicings[0]
      if (aFirst.breath !== bFirst.breath) return aFirst.breath === 'blow' ? -1 : 1
      return aFirst.holes[0] - bFirst.holes[0]
    })
}

// --- Tongue Blocking Chord Generation ---

const mapTonalQuality = (tonalQuality: string): ChordQuality | undefined => {
  const q = tonalQuality.toLowerCase()
  if (q.includes('diminished')) return 'diminished'
  if (q.includes('augmented')) return 'augmented'
  if (q.includes('minor') && q.includes('seventh')) return 'minor7'
  if (q.includes('minor')) return 'minor'
  if (q.includes('dominant') || q.includes('seventh')) return 'dominant7'
  if (q.includes('major')) return 'major'
  if (q === '' || q === 'major') return 'major'
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

/**
 * Generates all valid non-adjacent hole combinations for tongue blocking.
 * Only allows combinations with exactly one contiguous group of blocked holes,
 * reflecting real tongue blocking technique where the tongue covers one span.
 *
 * Valid: [1, 3] (block 2), [1, 4, 5] (block 2,3), [1, 2, 5] (block 3,4)
 * Invalid: [1, 3, 5] (two separate blocked groups at 2 and 4)
 */
const generateHoleCombinations = (params: TongueBlockingParams): number[][] => {
  const results: number[][] = []

  const isValidCombination = (holes: number[]): boolean => {
    const sorted = [...holes].sort((a, b) => a - b)
    const span = sorted[sorted.length - 1] - sorted[0]
    if (span > params.maxSpan) return false

    // Count gaps and validate: only one contiguous gap allowed
    let gapCount = 0
    let totalSkipped = 0
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i] - sorted[i - 1] - 1
      if (gap > 0) {
        gapCount++
        totalSkipped = gap
      }
    }

    // Must have exactly one gap (one tongue-blocked section)
    if (gapCount !== 1) return false

    // The single gap must meet skip constraints
    return totalSkipped >= params.minSkip && totalSkipped <= params.maxSkip
  }

  // Generate 3-note combinations
  for (let a = 1; a <= 10; a++) {
    for (let b = a + 1; b <= 10; b++) {
      for (let c = b + 1; c <= 10; c++) {
        const combo = [a, b, c]
        if (isValidCombination(combo)) results.push(combo)
      }
    }
  }

  // Generate 4-note combinations
  for (let a = 1; a <= 10; a++) {
    for (let b = a + 1; b <= 10; b++) {
      for (let c = b + 1; c <= 10; c++) {
        for (let d = c + 1; d <= 10; d++) {
          const combo = [a, b, c, d]
          if (isValidCombination(combo)) results.push(combo)
        }
      }
    }
  }

  return results
}

/**
 * Gets all tongue blocking chord voicings for a given harmonica key and tuning.
 * These are chords played with non-adjacent holes via tongue blocking technique.
 */
export const getTongueBlockingChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter',
  params: TongueBlockingParams = DEFAULT_TONGUE_BLOCKING,
): ChordVoicing[] => {
  const harmonica = getHarmonica(harmonicaKey, tuning)
  const combinations = generateHoleCombinations(params)
  const voicings: ChordVoicing[] = []

  for (const breath of ['blow', 'draw'] as const) {
    for (const holes of combinations) {
      const notes = holes.map(h => {
        const hole = harmonica.holes[h - 1]
        return breath === 'blow' ? hole.blow.note : hole.draw.note
      })

      const pitchClasses = notes.map(n => Note.pitchClass(n))
      const uniquePitchClasses = [...new Set(pitchClasses)]

      // Need at least 3 unique pitch classes for a meaningful chord
      if (uniquePitchClasses.length < 3) continue

      const detected = Chord.detect(uniquePitchClasses)
      if (detected.length === 0) continue

      // Use the first detected chord symbol
      const chordSymbol = detected[0]
      const chordInfo = Chord.get(chordSymbol)
      if (!chordInfo.name) continue

      const quality = mapTonalQuality(chordInfo.quality)
      if (!quality) continue

      const rootNote = chordInfo.tonic || uniquePitchClasses[0]
      const symbol = getChordShortSymbol(quality)
      const qualityName = getChordQualityName(quality)

      voicings.push({
        name: `${rootNote} ${qualityName}`,
        shortName: `${rootNote}${symbol}`,
        quality,
        holes: [...holes].sort((a, b) => a - b),
        breath,
        notes,
        position: 1,
        romanNumeral: '',
        isConsecutive: false,
        tuning,
      })
    }
  }

  return voicings
}

/**
 * Gets tongue blocking chords filtered to only those with all notes in scale.
 */
export const getScaleFilteredTongueBlockingChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
  scaleNotes: string[],
  params: TongueBlockingParams = DEFAULT_TONGUE_BLOCKING,
): ChordVoicing[] => {
  const allChords = getTongueBlockingChords(harmonicaKey, tuning, params)

  return allChords.filter(chord =>
    chord.notes.every(note => {
      const noteChroma = Note.chroma(note)
      if (noteChroma === undefined) return false
      return scaleNotes.some(scaleNote => Note.chroma(scaleNote) === noteChroma)
    })
  )
}
