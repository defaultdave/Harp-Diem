/**
 * Chord generation and voicing utilities for diatonic harmonica.
 * @packageDocumentation
 */
import { Note, Interval } from 'tonal'
import type { HarmonicaKey, TuningType } from './harmonicas'
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
 * Configuration for tongue blocking chord generation (Phase 2).
 * Defines how many consecutive holes can be blocked/played.
 */
export interface TongueBlockingParams {
  /** Total holes that can be covered (default: 4) */
  totalHoles: number
  /** Holes on each side of split (default: 2) */
  splitHoles: number
}

export const DEFAULT_TONGUE_BLOCKING: TongueBlockingParams = {
  totalHoles: 4,
  splitHoles: 2,
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
    const rootNote = Note.pitchClass(baseVoicing.notes[0])
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

  // Get the chord name from the transposed root
  const rootNote = Note.pitchClass(transposedNotes[0])
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
