/**
 * Harmonica data module providing diatonic harmonica layouts, tunings, and position calculation.
 * @packageDocumentation
 */
import { Note, Interval } from 'tonal'
import type { MusicalNote, NoteNames } from '../types'

/** Converts notes like Fb to E for intuitive display. */
const simplifyNote = (note: string): string => Note.enharmonic(note)

// Keys C-F# start at octave 4, G-B start at octave 3
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

/** All available harmonica keys. */
export type HarmonicaKey = keyof typeof HARMONICA_KEY_CONFIG

const C_START_OCTAVE = 4

/** A musical note with name and frequency. */
export type HarmonicaNote = MusicalNote

/**
 * Bend notes available on a harmonica hole.
 * Available bends depend on the interval between blow and draw notes.
 */
export interface HoleBends {
  halfStepBend?: HarmonicaNote
  wholeStepBend?: HarmonicaNote
  minorThirdBend?: HarmonicaNote
}

/** Complete note information for a single harmonica hole (1-10). */
export interface HoleNote {
  hole: number
  blow: HarmonicaNote
  draw: HarmonicaNote
  blowBends?: HoleBends
  drawBends?: HoleBends
  overblow?: HarmonicaNote
  overdraw?: HarmonicaNote
}

/** A complete diatonic harmonica with its key and all hole data. */
export interface DiatonicHarmonica {
  key: HarmonicaKey
  holes: HoleNote[]
}

/** Builds draw bends based on semitone interval between blow and draw. */
const buildDrawBends = (drawNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: simplifyNote(Note.transpose(drawNote, '-2m')), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: simplifyNote(Note.transpose(drawNote, '-2M')), frequency: 0 }
  if (interval >= 4) bends.minorThirdBend = { note: simplifyNote(Note.transpose(drawNote, '-3m')), frequency: 0 }
  return bends
}

/** Builds blow bends based on semitone interval between draw and blow. */
const buildBlowBends = (blowNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: simplifyNote(Note.transpose(blowNote, '-2m')), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: simplifyNote(Note.transpose(blowNote, '-2M')), frequency: 0 }
  return bends
}

const OVERBLOW_HOLES = [1, 4, 5, 6]
const OVERDRAW_HOLES = [7, 9, 10]

/** Calculates all available bends, overblows, and overdraws for a hole. */
const calculateBends = (
  holeNumber: number,
  blowNote: string,
  drawNote: string
): { drawBends?: HoleBends; blowBends?: HoleBends; overblow?: HarmonicaNote; overdraw?: HarmonicaNote } => {
  const blowMidi = Note.midi(blowNote) || 0
  const drawMidi = Note.midi(drawNote) || 0
  const interval = drawMidi - blowMidi

  if (interval > 0) {
    const drawBends = buildDrawBends(drawNote, interval)
    const overblow = OVERBLOW_HOLES.includes(holeNumber)
      ? { note: simplifyNote(Note.transpose(drawNote, '2m')), frequency: 0 }
      : undefined
    return { drawBends, overblow }
  } else {
    const blowBends = buildBlowBends(blowNote, Math.abs(interval))
    const overdraw = OVERDRAW_HOLES.includes(holeNumber)
      ? { note: simplifyNote(Note.transpose(blowNote, '2m')), frequency: 0 }
      : undefined
    return { blowBends, overdraw }
  }
}

/**
 * Available harmonica tuning types.
 * - richter: Standard tuning for blues/folk
 * - paddy-richter: Hole 3 raised for Celtic music
 * - natural-minor: Minor 3rds/7ths for minor keys
 * - country: Hole 5 draw raised for country/bluegrass
 * - melody-maker: Lee Oskar design with multiple modifications
 */
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
    blowNotes: ['C4', 'E4', 'A4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F5', 'A5', 'B5', 'D6', 'F6', 'A6'],
  },
  'natural-minor': {
    blowNotes: ['C4', 'Eb4', 'G4', 'C5', 'Eb5', 'G5', 'C6', 'Eb6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'Bb4', 'D5', 'F5', 'Ab5', 'Bb5', 'D6', 'F6', 'Ab6'],
  },
  'country': {
    blowNotes: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F#5', 'A5', 'B5', 'D6', 'F6', 'A6'],
  },
  'melody-maker': {
    blowNotes: ['C4', 'E4', 'A4', 'C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
    drawNotes: ['D4', 'G4', 'B4', 'D5', 'F#5', 'A5', 'B5', 'D6', 'F#6', 'A6'],
  },
}

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

/** Builds complete hole data from blow/draw note arrays. */
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

/** Creates a harmonica by transposing the C template to the target key. */
const createDiatonicHarmonica = (key: HarmonicaKey, tuning: TuningType = 'richter'): DiatonicHarmonica => {
  const tuningDef = TUNINGS[tuning]

  if (key === 'C') {
    return { key, holes: buildHoles(tuningDef.blowNotes, tuningDef.drawNotes) }
  }

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

const harmonicaCache: Map<string, DiatonicHarmonica> = new Map()

/**
 * Gets a diatonic harmonica for the specified key and tuning.
 * Uses lazy loading with caching for performance.
 */
export const getHarmonica = (key: HarmonicaKey, tuning: TuningType = 'richter'): DiatonicHarmonica => {
  const cacheKey = `${key}:${tuning}`
  if (!harmonicaCache.has(cacheKey)) {
    harmonicaCache.set(cacheKey, createDiatonicHarmonica(key, tuning))
  }
  return harmonicaCache.get(cacheKey)!
}

/**
 * @deprecated Use {@link getHarmonica} for explicit tuning control.
 */
export const harmonicas: Record<HarmonicaKey, DiatonicHarmonica> = new Proxy(
  {} as Record<HarmonicaKey, DiatonicHarmonica>,
  {
    get(_, key: string) {
      return getHarmonica(key as HarmonicaKey)
    },
  }
)

export const AVAILABLE_KEYS = Object.keys(HARMONICA_KEY_CONFIG) as HarmonicaKey[]

/** Supported musical scale types for the visualization. */
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

// Circle of fourths for position calculation
const CIRCLE_OF_FOURTHS: Record<string, number> = {
  'C': 0,
  'F': 1,
  'Bb': 2, 'A#': 2,
  'Eb': 3, 'D#': 3,
  'Ab': 4, 'G#': 4,
  'Db': 5, 'C#': 5,
  'Gb': 6, 'F#': 6,
  'B': 7,
  'E': 8,
  'A': 9,
  'D': 10,
  'G': 11,
}

/**
 * Calculates the harmonica position for playing in a given song key.
 * Position 1 = straight harp (same key), Position 2 = cross harp (most common for blues).
 */
export const getHarmonicaPosition = (harmonicaKey: HarmonicaKey, songKey: HarmonicaKey): number => {
  const harmonicaIndex = CIRCLE_OF_FOURTHS[harmonicaKey]
  const songIndex = CIRCLE_OF_FOURTHS[songKey]
  return ((songIndex - harmonicaIndex + 12) % 12) + 1
}
