import { Note, Interval } from 'tonal'
import type { MusicalNote, NoteNames } from '../types'

// Simplify note names to avoid confusing enharmonic spellings (e.g., Fb → E, Abb → G)
const simplifyNote = (note: string): string => Note.enharmonic(note)

// Single source of truth for harmonica keys and their starting octaves
// Keys C through F#/Gb start at middle C (octave 4)
// Keys G through B start below middle C (octave 3)
const HARMONICA_KEY_CONFIG = {
  'C': { startOctave: 4 },
  'Db': { startOctave: 4 },
  'D': { startOctave: 4 },
  'Eb': { startOctave: 4 },
  'E': { startOctave: 4 },
  'F': { startOctave: 4 },
  'F#': { startOctave: 4 },
  'G': { startOctave: 3 },
  'Ab': { startOctave: 3 },
  'A': { startOctave: 3 },
  'Bb': { startOctave: 3 },
  'B': { startOctave: 3 },
} as const

export type HarmonicaKey = keyof typeof HARMONICA_KEY_CONFIG

// Reference octave for C harmonica (used for calculating octave shifts)
const C_START_OCTAVE = 4

export type HarmonicaNote = MusicalNote

export interface HoleBends {
  halfStepBend?: HarmonicaNote // e.g., D♭ from D
  wholeStepBend?: HarmonicaNote // e.g., C from D
  minorThirdBend?: HarmonicaNote // e.g., B♭ from D
}

export interface HoleNote {
  hole: number
  blow: HarmonicaNote
  draw: HarmonicaNote
  blowBends?: HoleBends
  drawBends?: HoleBends
  overblow?: HarmonicaNote
  overdraw?: HarmonicaNote
}

export interface DiatonicHarmonica {
  key: HarmonicaKey
  holes: HoleNote[]
}

// Build draw bends based on interval between blow and draw notes
const buildDrawBends = (drawNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: simplifyNote(Note.transpose(drawNote, '-2m')), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: simplifyNote(Note.transpose(drawNote, '-2M')), frequency: 0 }
  if (interval >= 4) bends.minorThirdBend = { note: simplifyNote(Note.transpose(drawNote, '-3m')), frequency: 0 }
  return bends
}

// Build blow bends based on interval between blow and draw notes
const buildBlowBends = (blowNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: simplifyNote(Note.transpose(blowNote, '-2m')), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: simplifyNote(Note.transpose(blowNote, '-2M')), frequency: 0 }
  return bends
}

// Holes that support overblows and overdraws (not all holes have them)
const OVERBLOW_HOLES = [1, 4, 5, 6]
const OVERDRAW_HOLES = [7, 9, 10]

// Calculate all bends, overblows, and overdraws for a hole
const calculateBends = (
  holeNumber: number,
  blowNote: string,
  drawNote: string
): { drawBends?: HoleBends; blowBends?: HoleBends; overblow?: HarmonicaNote; overdraw?: HarmonicaNote } => {
  const blowMidi = Note.midi(blowNote) || 0
  const drawMidi = Note.midi(drawNote) || 0
  const interval = drawMidi - blowMidi

  if (interval > 0) {
    // Draw is higher than blow: draw bends available, overblow on specific holes
    const drawBends = buildDrawBends(drawNote, interval)
    const overblow = OVERBLOW_HOLES.includes(holeNumber)
      ? { note: simplifyNote(Note.transpose(drawNote, '2m')), frequency: 0 }
      : undefined
    return { drawBends, overblow }
  } else {
    // Blow is higher than draw: blow bends available, overdraw on specific holes
    const blowBends = buildBlowBends(blowNote, Math.abs(interval))
    const overdraw = OVERDRAW_HOLES.includes(holeNumber)
      ? { note: simplifyNote(Note.transpose(blowNote, '2m')), frequency: 0 }
      : undefined
    return { blowBends, overdraw }
  }
}

// Tuning type definitions
export type TuningType = 'richter' | 'paddy-richter' | 'natural-minor' | 'country' | 'melody-maker'

export const TUNING_TYPES: TuningType[] = [
  'richter',
  'paddy-richter',
  'natural-minor',
  'country',
  'melody-maker',
]

interface TuningDefinition {
  blowNotes: NoteNames
  drawNotes: NoteNames
}

// Tuning configurations for C harmonica (transposed to other keys)
const TUNINGS: Record<TuningType, TuningDefinition> = {
  'richter': {
    blowNotes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F5', 'A5', 'B5', 'D6', 'F6', 'A6'],
  },
  'paddy-richter': {
    // Hole 3 blow raised from G to A for easier melody playing in Celtic/Irish music
    blowNotes: ['C4', 'E4', 'A4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F5', 'A5', 'B5', 'D6', 'F6', 'A6'],
  },
  'natural-minor': {
    // Minor 3rds and 7ths for playing in minor keys
    blowNotes: ['C4', 'Eb4', 'G4', 'C5', 'Eb5', 'G5', 'C6', 'Eb6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'Bb4', 'D5', 'F5', 'Ab5', 'Bb5', 'D6', 'F6', 'Ab6'],
  },
  'country': {
    // Hole 5 draw raised by half step for country/bluegrass
    blowNotes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F#5', 'A5', 'B5', 'D6', 'F6', 'A6'],
  },
  'melody-maker': {
    // Lee Oskar design: Hole 3 blow raised, holes 5 and 9 draw raised
    blowNotes: ['C4', 'E4', 'A4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F#5', 'A5', 'B5', 'D6', 'F#6', 'A6'],
  },
}

// Add frequencies to a HoleBends object
const addBendFrequencies = (bends?: HoleBends): HoleBends | undefined => {
  if (!bends) return undefined
  return {
    halfStepBend: bends.halfStepBend
      ? { note: bends.halfStepBend.note, frequency: Note.freq(bends.halfStepBend.note) || 0 }
      : undefined,
    wholeStepBend: bends.wholeStepBend
      ? { note: bends.wholeStepBend.note, frequency: Note.freq(bends.wholeStepBend.note) || 0 }
      : undefined,
    minorThirdBend: bends.minorThirdBend
      ? { note: bends.minorThirdBend.note, frequency: Note.freq(bends.minorThirdBend.note) || 0 }
      : undefined,
  }
}

// Build holes from blow/draw notes with dynamically calculated bends
const buildHoles = (blowNotes: NoteNames, drawNotes: NoteNames): HoleNote[] => {
  return blowNotes.map((blowNote, idx) => {
    const drawNote = drawNotes[idx]
    const holeNumber = idx + 1
    const { drawBends, blowBends, overblow, overdraw } = calculateBends(holeNumber, blowNote, drawNote)

    return {
      hole: idx + 1,
      blow: { note: blowNote, frequency: Note.freq(blowNote) || 0 },
      draw: { note: drawNote, frequency: Note.freq(drawNote) || 0 },
      blowBends: addBendFrequencies(blowBends),
      drawBends: addBendFrequencies(drawBends),
      overblow: overblow ? { note: overblow.note, frequency: Note.freq(overblow.note) || 0 } : undefined,
      overdraw: overdraw ? { note: overdraw.note, frequency: Note.freq(overdraw.note) || 0 } : undefined,
    }
  })
}

const createDiatonicHarmonica = (key: HarmonicaKey, tuning: TuningType = 'richter'): DiatonicHarmonica => {
  const tuningDef = TUNINGS[tuning]

  // For C harmonica, use base notes directly
  if (key === 'C') {
    return { key, holes: buildHoles(tuningDef.blowNotes, tuningDef.drawNotes) }
  }

  // Transpose blow/draw notes for other keys - bends are calculated dynamically
  const keyDifference = Interval.semitones(Interval.distance('C', key)) || 0
  const octaveShift = HARMONICA_KEY_CONFIG[key].startOctave - C_START_OCTAVE

  const transposeNote = (note: string): string => {
    const transposed = Note.transpose(note, Interval.fromSemitones(keyDifference))
    if (octaveShift === 0) return simplifyNote(transposed)
    return simplifyNote(Note.transpose(transposed, Interval.fromSemitones(octaveShift * 12)))
  }

  const transposedBlow = tuningDef.blowNotes.map(transposeNote)
  const transposedDraw = tuningDef.drawNotes.map(transposeNote)

  return { key, holes: buildHoles(transposedBlow, transposedDraw) }
}

// Lazy-loaded cache for harmonicas - keyed by "key:tuning"
const harmonicaCache: Map<string, DiatonicHarmonica> = new Map()

export const getHarmonica = (key: HarmonicaKey, tuning: TuningType = 'richter'): DiatonicHarmonica => {
  const cacheKey = `${key}:${tuning}`
  if (!harmonicaCache.has(cacheKey)) {
    harmonicaCache.set(cacheKey, createDiatonicHarmonica(key, tuning))
  }
  return harmonicaCache.get(cacheKey)!
}

// Kept for backwards compatibility - uses lazy loading via Proxy
export const harmonicas: Record<HarmonicaKey, DiatonicHarmonica> = new Proxy(
  {} as Record<HarmonicaKey, DiatonicHarmonica>,
  {
    get(_, key: string) {
      return getHarmonica(key as HarmonicaKey)
    },
  }
)

export const AVAILABLE_KEYS = Object.keys(HARMONICA_KEY_CONFIG) as HarmonicaKey[]

// Keep to a focused set of common scales for usability
export const SCALE_TYPES = [
  'major',
  'minor',
  'harmonic minor',
  'melodic minor',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'locrian',
  'major pentatonic',
  'minor pentatonic',
  'blues',
] as const

export type ScaleType = (typeof SCALE_TYPES)[number]

// Calculate harmonica position based on harmonica key and song key
export const getHarmonicaPosition = (harmonicaKey: HarmonicaKey, songKey: HarmonicaKey): number => {
  const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const flatToSharpMap: { [key: string]: string } = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  }

  const toSharp = (note: string) => flatToSharpMap[note] || note
  const harmonicaNormalized = toSharp(harmonicaKey)
  const songNormalized = toSharp(songKey)

  const harmonicaIndex = noteOrder.indexOf(harmonicaNormalized)
  const songIndex = noteOrder.indexOf(songNormalized)

  const semitonesDiff = (songIndex - harmonicaIndex + 12) % 12

  // Map semitone differences to positions (based on circle of fourths)
  // Each position moves up by a perfect 4th (5 semitones)
  const positionMap: { [key: number]: number } = {
    0: 1,   // 1st position (straight harp): same key (C for C harp)
    5: 2,   // 2nd position (cross harp): perfect 4th up (F for C harp)
    10: 3,  // 3rd position: major 7th up (Bb for C harp)
    3: 4,   // 4th position: minor 3rd up (Eb for C harp)
    8: 5,   // 5th position: minor 6th up (Ab for C harp)
    1: 6,   // 6th position: minor 2nd up (Db for C harp)
    6: 7,   // 7th position: tritone up (Gb for C harp)
    11: 8,  // 8th position: major 7th up (B for C harp)
    4: 9,   // 9th position: major 3rd up (E for C harp)
    9: 10,  // 10th position: major 6th up (A for C harp)
    2: 11,  // 11th position: major 2nd up (D for C harp)
    7: 12,  // 12th position: perfect 5th up (G for C harp)
  }

  return positionMap[semitonesDiff] || 1
}
