/**
 * @packageDocumentation
 * Chord generation and voicing utilities for diatonic harmonica.
 *
 * This module provides functions for generating playable chord voicings
 * based on the harmonica key and standard Richter tuning patterns.
 *
 * @remarks
 * Diatonic harmonicas can play several chords by playing multiple
 * adjacent holes simultaneously. The available chords depend on the
 * tuning (this module assumes Richter tuning) and breath direction.
 *
 * @category Data
 */
import { Note, Interval } from 'tonal'
import type { HarmonicaKey } from './harmonicas'
import { getChordKey } from '../utils'

/**
 * A chord voicing that can be played on a harmonica.
 *
 * @remarks
 * Each voicing represents a specific way to play a chord by playing
 * multiple adjacent holes with the same breath direction.
 *
 * @example
 * ```typescript
 * // C Major chord on holes 1-2-3 blow on a C harmonica
 * {
 *   name: "C Major",
 *   shortName: "C",
 *   quality: "major",
 *   holes: [1, 2, 3],
 *   breath: "blow",
 *   notes: ["C4", "E4", "G4"],
 *   position: 1,
 *   romanNumeral: "I"
 * }
 * ```
 */
export interface ChordVoicing {
  /** Full chord name (e.g., "C Major", "G Dominant 7th") */
  name: string
  /** Short chord symbol (e.g., "C", "G7", "Am") */
  shortName: string
  /** Chord quality classification */
  quality: ChordQuality
  /** Hole numbers to play (e.g., [1, 2, 3]) */
  holes: number[]
  /** Breath direction (blow or draw) */
  breath: 'blow' | 'draw'
  /** Notes in the chord with octaves (e.g., ["C4", "E4", "G4"]) */
  notes: string[]
  /** Harmonica position this chord is native to (1-12) */
  position: number
  /** Roman numeral analysis (e.g., "I", "IV", "V7") */
  romanNumeral: string
}

/**
 * Chord quality types supported on harmonica.
 *
 * @remarks
 * Due to the limited notes available on a diatonic harmonica,
 * only certain chord qualities are naturally playable.
 */
export type ChordQuality = 'major' | 'minor' | 'dominant7' | 'minor7' | 'diminished' | 'augmented'

/**
 * Transposes a note by a given interval.
 *
 * @param note - The note to transpose (e.g., "C4")
 * @param interval - The interval to transpose by (e.g., "P5", "M3")
 * @returns The transposed note
 * @internal
 */
const transposeNote = (note: string, interval: string): string => {
  return Note.transpose(note, interval)
}

/**
 * Gets all available chord voicings for a given harmonica key.
 *
 * @remarks
 * Returns chord voicings based on standard Richter tuning patterns.
 * The chord definitions are transposed from C to the target key.
 *
 * Available chords in Richter tuning include:
 * - I chord (blow): Holes 1-2-3, 4-5-6, 7-8-9
 * - V7 chord (draw): Holes 2-3-4-5
 * - ii chord (draw): Holes 1-2-3-4, 4-5-6
 * - vii° chord (draw): Holes 8-9-10
 *
 * @param harmonicaKey - The key of the harmonica
 * @returns Array of ChordVoicing objects for all available chords
 *
 * @example
 * ```typescript
 * const gHarpChords = getHarmonicaChords('G')
 * // Returns chords like G Major, D7, Am, etc.
 * ```
 */
export const getHarmonicaChords = (harmonicaKey: HarmonicaKey): ChordVoicing[] => {
  // Calculate interval from C to target key
  const keyInterval = Interval.distance('C', harmonicaKey)
  
  // Standard Richter tuning note layout for C harmonica
  const cBlowNotes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7']
  const cDrawNotes = ['D4', 'G4', 'B4', 'D5', 'F5', 'A5', 'B5', 'D6', 'F6', 'A6']
  
  // Define chord voicings with their properties
  interface ChordDef {
    quality: ChordQuality
    holes: number[]
    breath: 'blow' | 'draw'
    position: number
    romanNumeral: string
    rootNoteIndex: number // Index in holes array that is the root
  }
  
  const chordDefs: ChordDef[] = [
    // Blow chords - 1st position (tonic = C on C harp)
    { quality: 'major', holes: [1, 2, 3], breath: 'blow', position: 1, romanNumeral: 'I', rootNoteIndex: 0 },
    { quality: 'major', holes: [4, 5, 6], breath: 'blow', position: 1, romanNumeral: 'I', rootNoteIndex: 0 },
    { quality: 'major', holes: [7, 8, 9], breath: 'blow', position: 1, romanNumeral: 'I', rootNoteIndex: 0 },
    
    // Draw chords - various functions
    { quality: 'minor', holes: [1, 2, 3, 4], breath: 'draw', position: 1, romanNumeral: 'ii', rootNoteIndex: 0 }, // D minor in C key
    { quality: 'dominant7', holes: [2, 3, 4, 5], breath: 'draw', position: 1, romanNumeral: 'V7', rootNoteIndex: 0 }, // G7 in C key
    { quality: 'minor', holes: [4, 5, 6], breath: 'draw', position: 1, romanNumeral: 'ii', rootNoteIndex: 0 }, // D minor partial
    { quality: 'diminished', holes: [8, 9, 10], breath: 'draw', position: 1, romanNumeral: 'vii°', rootNoteIndex: 0 }, // B diminished
    { quality: 'major', holes: [2, 3, 4], breath: 'draw', position: 2, romanNumeral: 'I', rootNoteIndex: 0 }, // G major (2nd position)
  ]
  
  return chordDefs.map((def) => {
    // Get base notes in C
    const baseNotes = def.breath === 'blow' ? cBlowNotes : cDrawNotes
    const chordNotes = def.holes.map(h => transposeNote(baseNotes[h - 1], keyInterval))
    
    // Root note is determined by the root note index
    const rootNote = chordNotes[def.rootNoteIndex]
    const rootPitch = Note.pitchClass(rootNote)
    
    // Generate chord name
    const qualitySymbol = {
      'major': '',
      'minor': 'm',
      'dominant7': '7',
      'minor7': 'm7',
      'diminished': 'dim',
      'augmented': 'aug',
    }[def.quality]
    
    const qualityName = {
      'major': 'Major',
      'minor': 'Minor',
      'dominant7': 'Dominant 7th',
      'minor7': 'Minor 7th',
      'diminished': 'Diminished',
      'augmented': 'Augmented',
    }[def.quality]
    
    const shortName = `${rootPitch}${qualitySymbol}`
    const name = `${rootPitch} ${qualityName}`
    
    return {
      name,
      shortName,
      quality: def.quality,
      holes: def.holes,
      breath: def.breath,
      notes: chordNotes,
      position: def.position,
      romanNumeral: def.romanNumeral,
    }
  })
}

/**
 * Gets chords filtered by harmonica position.
 *
 * @param harmonicaKey - The key of the harmonica
 * @param position - The position to filter by (1-12)
 * @returns Array of chord voicings native to the specified position
 *
 * @example
 * ```typescript
 * // Get 2nd position chords for a C harmonica
 * const crossHarpChords = getChordsByPosition('C', 2)
 * ```
 */
export const getChordsByPosition = (harmonicaKey: HarmonicaKey, position: number): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey).filter(chord => chord.position === position)
}

/**
 * Gets the most common/useful unique chords for a harmonica key.
 *
 * @remarks
 * This function deduplicates chords (removing voicings that play the same
 * holes/breath) and sorts them by breath direction and hole position for
 * consistent display.
 *
 * @param harmonicaKey - The key of the harmonica
 * @returns Array of unique chord voicings, sorted by breath then hole number
 *
 * @example
 * ```typescript
 * const chords = getCommonChords('C')
 * // Returns deduplicated chords sorted: blow chords first, then draw
 * ```
 */
export const getCommonChords = (harmonicaKey: HarmonicaKey): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey)
  
  // Remove duplicates by creating a unique key from holes and breath
  const uniqueChords = new Map<string, ChordVoicing>()
  allChords.forEach(chord => {
    const key = getChordKey(chord)
    if (!uniqueChords.has(key)) {
      uniqueChords.set(key, chord)
    }
  })
  
  return Array.from(uniqueChords.values())
    // Sort by hole number and breath direction
    .sort((a, b) => {
      if (a.breath !== b.breath) return a.breath === 'blow' ? -1 : 1
      return a.holes[0] - b.holes[0]
    })
}
