/**
 * Chord generation and voicing utilities for diatonic harmonica.
 * @packageDocumentation
 */
import { Note, Interval } from 'tonal'
import type { HarmonicaKey } from './harmonicas'
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
}

export type ChordQuality = 'major' | 'minor' | 'dominant7' | 'minor7' | 'diminished' | 'augmented'

const transposeNote = (note: string, interval: string): string => {
  return Note.transpose(note, interval)
}

/** Gets all available chord voicings for a given harmonica key in Richter tuning. */
export const getHarmonicaChords = (harmonicaKey: HarmonicaKey): ChordVoicing[] => {
  const keyInterval = Interval.distance('C', harmonicaKey)

  const cBlowNotes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7']
  const cDrawNotes = ['D4', 'G4', 'B4', 'D5', 'F5', 'A5', 'B5', 'D6', 'F6', 'A6']

  interface ChordDef {
    quality: ChordQuality
    holes: number[]
    breath: 'blow' | 'draw'
    position: number
    romanNumeral: string
    rootNoteIndex: number
  }

  const chordDefs: ChordDef[] = [
    { quality: 'major', holes: [1, 2, 3], breath: 'blow', position: 1, romanNumeral: 'I', rootNoteIndex: 0 },
    { quality: 'major', holes: [4, 5, 6], breath: 'blow', position: 1, romanNumeral: 'I', rootNoteIndex: 0 },
    { quality: 'major', holes: [7, 8, 9], breath: 'blow', position: 1, romanNumeral: 'I', rootNoteIndex: 0 },
    { quality: 'minor', holes: [1, 2, 3, 4], breath: 'draw', position: 1, romanNumeral: 'ii', rootNoteIndex: 0 },
    { quality: 'dominant7', holes: [2, 3, 4, 5], breath: 'draw', position: 1, romanNumeral: 'V7', rootNoteIndex: 0 },
    { quality: 'minor', holes: [4, 5, 6], breath: 'draw', position: 1, romanNumeral: 'ii', rootNoteIndex: 0 },
    { quality: 'diminished', holes: [8, 9, 10], breath: 'draw', position: 1, romanNumeral: 'vii°', rootNoteIndex: 0 },
    { quality: 'major', holes: [2, 3, 4], breath: 'draw', position: 2, romanNumeral: 'I', rootNoteIndex: 0 },
  ]

  return chordDefs.map((def) => {
    const baseNotes = def.breath === 'blow' ? cBlowNotes : cDrawNotes
    const chordNotes = def.holes.map(h => transposeNote(baseNotes[h - 1], keyInterval))

    const rootNote = chordNotes[def.rootNoteIndex]
    const rootPitch = Note.pitchClass(rootNote)

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

/** Gets chords filtered by harmonica position. */
export const getChordsByPosition = (harmonicaKey: HarmonicaKey, position: number): ChordVoicing[] => {
  return getHarmonicaChords(harmonicaKey).filter(chord => chord.position === position)
}

/** Gets unique chords sorted by breath direction and hole position. */
export const getCommonChords = (harmonicaKey: HarmonicaKey): ChordVoicing[] => {
  const allChords = getHarmonicaChords(harmonicaKey)

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
