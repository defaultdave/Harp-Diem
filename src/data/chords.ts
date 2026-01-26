/**
 * Chord generation and voicing utilities for diatonic harmonica.
 * Uses Tonal's Chord API to validate chord notes against music theory.
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

/** Maps chord quality to its symbol notation. */
const QUALITY_SYMBOL: Record<ChordQuality, string> = {
  'major': '',
  'minor': 'm',
  'dominant7': '7',
  'minor7': 'm7',
  'diminished': 'dim',
  'augmented': 'aug',
}

/** Maps chord quality to its full name. */
const QUALITY_NAME: Record<ChordQuality, string> = {
  'major': 'Major',
  'minor': 'Minor',
  'dominant7': 'Dominant 7th',
  'minor7': 'Minor 7th',
  'diminished': 'Diminished',
  'augmented': 'Augmented',
}

/** Maps Tonal chord type names to our quality types. */
const TONAL_TO_QUALITY: Record<string, ChordQuality> = {
  'major': 'major',
  '': 'major',
  'minor': 'minor',
  'm': 'minor',
  'dominant seventh': 'dominant7',
  '7': 'dominant7',
  'minor seventh': 'minor7',
  'm7': 'minor7',
  'diminished': 'diminished',
  'dim': 'diminished',
  'augmented': 'augmented',
  'aug': 'augmented',
}

/** Standard diatonic chords available on a major-key harmonica with their Roman numerals. */
const DIATONIC_CHORDS: Array<{ root: number; quality: ChordQuality; romanNumeral: string; position: number }> = [
  // Position 1 (1st position / straight harp)
  { root: 0, quality: 'major', romanNumeral: 'I', position: 1 },       // C major
  { root: 2, quality: 'minor', romanNumeral: 'ii', position: 1 },      // D minor
  { root: 4, quality: 'minor', romanNumeral: 'iii', position: 1 },     // E minor
  { root: 5, quality: 'major', romanNumeral: 'IV', position: 1 },      // F major
  { root: 7, quality: 'major', romanNumeral: 'V', position: 1 },       // G major
  { root: 7, quality: 'dominant7', romanNumeral: 'V7', position: 1 },  // G7
  { root: 9, quality: 'minor', romanNumeral: 'vi', position: 1 },      // A minor
  { root: 11, quality: 'diminished', romanNumeral: 'vii°', position: 1 }, // B diminished
  // Position 2 (2nd position / cross harp)
  { root: 7, quality: 'major', romanNumeral: 'I', position: 2 },       // G major (cross harp)
]

/**
 * Generates all valid hole patterns for chord playing.
 * - Consecutive: exactly 4 holes
 * - Split: exactly 5 hole span with 2-3 holes blocked in middle
 */
const generateValidPatterns = (): Array<{ holes: number[]; isConsecutive: boolean }> => {
  const patterns: Array<{ holes: number[]; isConsecutive: boolean }> = []

  // Consecutive 4-hole patterns
  for (let start = 1; start <= 7; start++) {
    patterns.push({
      holes: [start, start + 1, start + 2, start + 3],
      isConsecutive: true,
    })
  }

  // Split 5-hole patterns (span of 5, with 2-3 holes blocked)
  for (let start = 1; start <= 6; start++) {
    const end = start + 4 // 5-hole span

    // 2 holes blocked: play first 2 and last, or first and last 2
    // Pattern: [start, start+1, end] - 2 blocked (start+2, start+3)
    patterns.push({
      holes: [start, start + 1, end],
      isConsecutive: false,
    })
    // Pattern: [start, end-1, end] - 2 blocked (start+1, start+2)
    patterns.push({
      holes: [start, end - 1, end],
      isConsecutive: false,
    })

    // 3 holes blocked: play first and last only... but that's only 2 notes
    // So for 3 blocked we need: [start, end] but add middle note
    // Actually 3 blocked means: [start, start+1, end] where gap is 3? No...
    // Let me recalculate: span 5, blocked 3 = 2 notes played (not enough)
    // So valid splits with 3+ notes are only 2 blocked
  }

  return patterns
}

/**
 * Finds all valid voicings for a chord on a harmonica.
 * @param chordName - The chord name (e.g., "Dm", "G7", "Bdim")
 * @param harmonicaKey - The key of the harmonica
 * @param tuning - The tuning type
 * @returns Array of valid voicings, sorted by consecutive first, then by lowest hole
 */
export const findChordVoicings = (
  chordName: string,
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  const targetChord = Chord.get(chordName)
  if (!targetChord.notes || targetChord.notes.length === 0) return []

  const targetPitchClasses = new Set(targetChord.notes.map(n => Note.pitchClass(n)))
  const harmonica = getHarmonica(harmonicaKey, tuning)
  const patterns = generateValidPatterns()
  const voicings: ChordVoicing[] = []
  const seenPatterns = new Set<string>()

  for (const breath of ['blow', 'draw'] as const) {
    for (const pattern of patterns) {
      // Check if pattern holes are within harmonica range
      if (pattern.holes.some(h => h < 1 || h > 10)) continue

      // Get the notes for this pattern
      const notes = pattern.holes.map(h => {
        const holeData = harmonica.holes[h - 1]
        return breath === 'blow' ? holeData.blow.note : holeData.draw.note
      })

      // Check if these notes match the target chord
      const notePitchClasses = notes.map(n => Note.pitchClass(n))
      const uniqueNotes = new Set(notePitchClasses)

      // All played notes must be chord tones
      const allNotesInChord = notePitchClasses.every(pc => targetPitchClasses.has(pc))
      if (!allNotesInChord) continue

      // Must have at least 3 unique pitch classes (basic triad)
      if (uniqueNotes.size < 3) continue

      // Create unique key to avoid duplicates
      const patternKey = `${pattern.holes.join(',')}-${breath}`
      if (seenPatterns.has(patternKey)) continue
      seenPatterns.add(patternKey)

      const quality = TONAL_TO_QUALITY[targetChord.type] || TONAL_TO_QUALITY[targetChord.quality] || 'major'
      const rootPitch = targetChord.tonic || Note.pitchClass(notes[0])

      voicings.push({
        name: `${rootPitch} ${QUALITY_NAME[quality]}`,
        shortName: `${rootPitch}${QUALITY_SYMBOL[quality]}`,
        quality,
        holes: pattern.holes,
        breath,
        notes,
        position: 1,
        romanNumeral: '',
        isConsecutive: pattern.isConsecutive,
        tuning,
      })
    }
  }

  // Sort: consecutive first, then by lowest hole number
  return voicings.sort((a, b) => {
    if (a.isConsecutive !== b.isConsecutive) {
      return a.isConsecutive ? -1 : 1
    }
    return a.holes[0] - b.holes[0]
  })
}

/**
 * Gets all available chord voicings for a given harmonica key and tuning.
 * Validates each chord against music theory using Tonal's Chord API.
 */
export const getHarmonicaChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  const keyInterval = Interval.distance('C', harmonicaKey)
  const allVoicings: ChordVoicing[] = []
  const seenKeys = new Set<string>()

  for (const chordDef of DIATONIC_CHORDS) {
    // Calculate the transposed root note
    const rootSemitones = chordDef.root
    const transposedRoot = Note.transpose('C', Interval.fromSemitones(rootSemitones))
    const finalRoot = Note.transpose(transposedRoot, keyInterval)
    const rootPitch = Note.pitchClass(finalRoot)

    // Build the chord name
    const chordName = `${rootPitch}${QUALITY_SYMBOL[chordDef.quality]}`

    // Find all valid voicings for this chord
    const voicings = findChordVoicings(chordName, harmonicaKey, tuning)

    // Add position and roman numeral info
    for (const voicing of voicings) {
      const key = getChordKey(voicing)
      if (seenKeys.has(key)) continue
      seenKeys.add(key)

      allVoicings.push({
        ...voicing,
        position: chordDef.position,
        romanNumeral: chordDef.romanNumeral,
      })
    }
  }

  return allVoicings
}

/** Gets chords filtered by harmonica position. */
export const getChordsByPosition = (
  harmonicaKey: HarmonicaKey,
  position: number,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning).filter(chord => chord.position === position)
}

/** Gets unique chords sorted by breath direction and hole position. */
export const getCommonChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey, tuning)

  const uniqueChords = new Map<string, ChordVoicing>()
  allChords.forEach(chord => {
    const key = getChordKey(chord)
    if (!uniqueChords.has(key)) {
      uniqueChords.set(key, chord)
    }
  })

  return Array.from(uniqueChords.values())
    .sort((a, b) => {
      if (a.breath !== b.breath) return a.breath === 'blow' ? -1 : 1
      return a.holes[0] - b.holes[0]
    })
}

/**
 * Gets a specific chord by name.
 * @param chordName - The chord name (e.g., "Dm", "G7")
 * @param harmonicaKey - The harmonica key
 * @param tuning - The tuning type
 * @returns The first matching voicing, or undefined if not found
 */
export const getChordByName = (
  chordName: string,
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing | undefined => {
  const voicings = findChordVoicings(chordName, harmonicaKey, tuning)
  return voicings[0]
}

/**
 * Gets all chord voicings for a harmonica, organized by chord name.
 * @param harmonicaKey - The harmonica key
 * @param tuning - The tuning type
 * @returns Map of chord names to their voicings
 */
export const getAllChords = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType = 'richter'
): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey, tuning)
}
