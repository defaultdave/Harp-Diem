import { Note, Interval } from 'tonal'
import type { HarmonicaKey } from './harmonicas'
import { getChordKey } from '../utils/chord'

/**
 * Represents a single chord voicing on the harmonica
 */
export interface ChordVoicing {
  name: string // e.g., "C Major", "G7"
  shortName: string // e.g., "C", "G7"
  quality: ChordQuality
  holes: number[] // Holes to play (e.g., [1, 2, 3])
  breath: 'blow' | 'draw' // Direction to play
  notes: string[] // Notes in the chord (e.g., ['C4', 'E4', 'G4'])
  position: number // Position on the harmonica (1-12)
  romanNumeral: string // Roman numeral analysis (e.g., "I", "IV", "V")
}

export type ChordQuality = 'major' | 'minor' | 'dominant7' | 'minor7' | 'diminished' | 'augmented'

/**
 * Common harmonica chord patterns in Richter tuning
 * These are the most useful chords available on a standard diatonic harmonica
 */

// Helper to transpose a note
const transposeNote = (note: string, interval: string): string => {
  return Note.transpose(note, interval)
}

/**
 * Get all available chords for a given harmonica key
 * Based on standard Richter tuning chord patterns
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
 * Get chords filtered by position
 */
export const getChordsByPosition = (harmonicaKey: HarmonicaKey, position: number): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey).filter(chord => chord.position === position)
}

/**
 * Get the most common/useful chords for a harmonica key
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
