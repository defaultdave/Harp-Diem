/**
 * @packageDocumentation
 * Harmonica data module providing complete diatonic harmonica layouts.
 *
 * This module handles the creation and management of diatonic harmonica data,
 * including note layouts for all 12 keys, various tuning systems, bend calculations,
 * and position determination using the circle of fourths.
 *
 * @remarks
 * The harmonica data is built on a C harmonica template and transposed to other keys
 * using tonal.js. Bends are calculated dynamically based on the interval between
 * blow and draw notes on each hole - larger intervals allow for more bends.
 *
 * @example
 * ```typescript
 * import { getHarmonica, getHarmonicaPosition } from './harmonicas'
 *
 * // Get a G harmonica in Richter tuning
 * const gHarp = getHarmonica('G', 'richter')
 * console.log(gHarp.holes[0].blow.note) // "G3"
 *
 * // Get position for playing in D on a G harp (2nd position)
 * const position = getHarmonicaPosition('G', 'D') // Returns 2
 * ```
 *
 * @category Data
 */
import { Note, Interval } from 'tonal'
import type { MusicalNote, NoteNames } from '../types'

/**
 * Simplifies note names to avoid confusing enharmonic spellings.
 *
 * Converts notes like Fb to E, or Abb to G for more intuitive display.
 *
 * @param note - The note to simplify (e.g., "Fb4", "Abb3")
 * @returns The simplified enharmonic equivalent (e.g., "E4", "G3")
 * @internal
 */
const simplifyNote = (note: string): string => Note.enharmonic(note)

/**
 * Configuration for all harmonica keys with their starting octaves.
 *
 * Keys C through F#/Gb start at middle C (octave 4).
 * Keys G through B start below middle C (octave 3) to keep notes in a comfortable range.
 *
 * @internal
 */
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

/**
 * All available harmonica keys (12 keys in standard Western music).
 *
 * @remarks
 * Keys are represented without sharps/flats ambiguity. For example, only "Db" is used,
 * not both "Db" and "C#". The 12 unique keys are:
 * C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B
 */
export type HarmonicaKey = keyof typeof HARMONICA_KEY_CONFIG

/** Reference octave for C harmonica (used for calculating octave shifts) */
const C_START_OCTAVE = 4

/**
 * A musical note on the harmonica with its name and frequency.
 *
 * @remarks
 * This is an alias for MusicalNote, used throughout the harmonica module
 * for type clarity.
 */
export type HarmonicaNote = MusicalNote

/**
 * Bend notes available on a harmonica hole.
 *
 * @remarks
 * Bends are achieved by changing the shape of the mouth/throat to lower the pitch.
 * The number of available bends depends on the interval between blow and draw notes:
 * - 2 semitone interval: half-step bend available
 * - 3 semitone interval: half-step and whole-step bends available
 * - 4+ semitone interval: half-step, whole-step, and minor-third bends available
 *
 * @example
 * On hole 3 of a C harmonica (blow: G4, draw: B4):
 * - halfStepBend: Bb4 (one semitone below B)
 * - wholeStepBend: A4 (two semitones below B)
 * - No minor-third bend (only 4 semitones between G and B)
 */
export interface HoleBends {
  /** Half-step (1 semitone) bend below the base note */
  halfStepBend?: HarmonicaNote
  /** Whole-step (2 semitones) bend below the base note */
  wholeStepBend?: HarmonicaNote
  /** Minor-third (3 semitones) bend below the base note */
  minorThirdBend?: HarmonicaNote
}

/**
 * Complete note information for a single harmonica hole.
 *
 * @remarks
 * Each hole on a diatonic harmonica produces different notes when blowing
 * and drawing. Additionally, certain holes support bends, overblows, and overdraws
 * to access chromatic notes.
 *
 * @example
 * Hole 4 on a C harmonica:
 * ```typescript
 * {
 *   hole: 4,
 *   blow: { note: "C5", frequency: 523.25 },
 *   draw: { note: "D5", frequency: 587.33 },
 *   drawBends: { halfStepBend: { note: "Db5", frequency: 554.37 } },
 *   overblow: { note: "Eb5", frequency: 622.25 }
 * }
 * ```
 */
export interface HoleNote {
  /** Hole number (1-10 on a standard 10-hole diatonic) */
  hole: number
  /** Note produced when blowing into the hole */
  blow: HarmonicaNote
  /** Note produced when drawing from the hole */
  draw: HarmonicaNote
  /** Bends available when blowing (holes 8-10 on Richter tuning) */
  blowBends?: HoleBends
  /** Bends available when drawing (holes 1-6 on Richter tuning) */
  drawBends?: HoleBends
  /** Overblow note (advanced technique, holes 1, 4, 5, 6) */
  overblow?: HarmonicaNote
  /** Overdraw note (advanced technique, holes 7, 9, 10) */
  overdraw?: HarmonicaNote
}

/**
 * A complete diatonic harmonica with its key and all hole data.
 *
 * @remarks
 * A standard diatonic harmonica has 10 holes, each with blow/draw notes
 * and potentially bends and overblows/overdraws. The note layout depends
 * on both the key of the harmonica and its tuning.
 */
export interface DiatonicHarmonica {
  /** The key of the harmonica (e.g., "C", "G", "Bb") */
  key: HarmonicaKey
  /** Array of 10 holes with all note information */
  holes: HoleNote[]
}

/**
 * Builds draw bend notes based on the interval between blow and draw notes.
 *
 * @remarks
 * Draw bends are available on holes where the draw note is higher than the blow note.
 * The number of bends available depends on the semitone interval:
 * - 2 semitones: half-step bend only
 * - 3 semitones: half-step and whole-step bends
 * - 4+ semitones: all three bend types
 *
 * @param drawNote - The draw note to bend from (e.g., "D4")
 * @param interval - Number of semitones between blow and draw notes
 * @returns HoleBends object with available bends, or undefined if no bends possible
 * @internal
 */
const buildDrawBends = (drawNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: simplifyNote(Note.transpose(drawNote, '-2m')), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: simplifyNote(Note.transpose(drawNote, '-2M')), frequency: 0 }
  if (interval >= 4) bends.minorThirdBend = { note: simplifyNote(Note.transpose(drawNote, '-3m')), frequency: 0 }
  return bends
}

/**
 * Builds blow bend notes based on the interval between blow and draw notes.
 *
 * @remarks
 * Blow bends are available on holes where the blow note is higher than the draw note
 * (typically holes 8-10 on Richter tuning). The number of bends depends on the interval.
 *
 * @param blowNote - The blow note to bend from (e.g., "E6")
 * @param interval - Number of semitones between draw and blow notes (absolute value)
 * @returns HoleBends object with available bends, or undefined if no bends possible
 * @internal
 */
const buildBlowBends = (blowNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: simplifyNote(Note.transpose(blowNote, '-2m')), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: simplifyNote(Note.transpose(blowNote, '-2M')), frequency: 0 }
  return bends
}

/** Holes that support overblows (where draw is higher than blow) */
const OVERBLOW_HOLES = [1, 4, 5, 6]
/** Holes that support overdraws (where blow is higher than draw) */
const OVERDRAW_HOLES = [7, 9, 10]

/**
 * Calculates all available bends, overblows, and overdraws for a harmonica hole.
 *
 * @remarks
 * This function determines which extended techniques are available based on
 * the relationship between blow and draw notes:
 *
 * - If draw > blow: Draw bends and potentially overblows are available
 * - If blow > draw: Blow bends and potentially overdraws are available
 *
 * Overblows/overdraws produce a note one semitone above the higher of the two
 * notes, allowing access to chromatic notes not otherwise available.
 *
 * @param holeNumber - The hole number (1-10)
 * @param blowNote - The blow note with octave (e.g., "C4")
 * @param drawNote - The draw note with octave (e.g., "D4")
 * @returns Object containing available bends and overblow/overdraw
 * @internal
 */
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

/**
 * Available harmonica tuning types.
 *
 * @remarks
 * Different tunings modify the note layout to better suit specific musical styles:
 *
 * - **richter**: Standard tuning, most common. Optimized for blues and folk.
 * - **paddy-richter**: Hole 3 blow raised to 6th. Better for Celtic/Irish music.
 * - **natural-minor**: Minor 3rds and 7ths for playing in minor keys.
 * - **country**: Hole 5 draw raised. Better for country/bluegrass music.
 * - **melody-maker**: Lee Oskar design combining multiple modifications.
 */
export type TuningType = 'richter' | 'paddy-richter' | 'natural-minor' | 'country' | 'melody-maker'

/** Array of all available tuning types */
export const TUNING_TYPES: TuningType[] = [
  'richter',
  'paddy-richter',
  'natural-minor',
  'country',
  'melody-maker',
]

/**
 * Definition of a harmonica tuning with blow and draw note layouts.
 * @internal
 */
interface TuningDefinition {
  blowNotes: NoteNames
  drawNotes: NoteNames
}

/**
 * Tuning configurations for C harmonica.
 *
 * @remarks
 * All tunings are defined for C harmonica and transposed to other keys.
 * Each tuning provides different note layouts optimized for specific musical styles.
 *
 * @internal
 */
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

/**
 * Adds frequency information to bend notes.
 *
 * @param bends - HoleBends object with note names only
 * @returns HoleBends with frequencies populated, or undefined if no bends
 * @internal
 */
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

/**
 * Builds complete hole data from blow/draw note arrays.
 *
 * @remarks
 * For each hole, this function:
 * 1. Creates the blow and draw notes with frequencies
 * 2. Calculates available bends based on note intervals
 * 3. Determines if overblow/overdraw is available
 *
 * @param blowNotes - Array of 10 blow note names with octaves
 * @param drawNotes - Array of 10 draw note names with octaves
 * @returns Array of 10 HoleNote objects
 * @internal
 */
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

/**
 * Creates a complete diatonic harmonica for the specified key and tuning.
 *
 * @remarks
 * This function transposes the C harmonica template to the target key:
 * 1. Calculates the semitone difference from C to the target key
 * 2. Applies octave shift for keys G through B (start an octave lower)
 * 3. Transposes all notes and recalculates bends
 *
 * The result is cached for performance, so subsequent calls return
 * the same object.
 *
 * @param key - The target harmonica key (e.g., "G", "Bb")
 * @param tuning - The tuning system to use (default: "richter")
 * @returns A complete DiatonicHarmonica object
 * @internal
 */
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

/** Lazy-loaded cache for harmonicas, keyed by "key:tuning" */
const harmonicaCache: Map<string, DiatonicHarmonica> = new Map()

/**
 * Gets a diatonic harmonica for the specified key and tuning.
 *
 * @remarks
 * This is the primary function for obtaining harmonica data. It uses lazy loading
 * with caching, so harmonicas are only created when first requested and reused
 * for subsequent calls.
 *
 * @param key - The harmonica key (e.g., "C", "G", "Bb")
 * @param tuning - The tuning system (default: "richter")
 * @returns A DiatonicHarmonica object with all hole and note data
 *
 * @example
 * ```typescript
 * const gHarp = getHarmonica('G', 'richter')
 * console.log(gHarp.holes[0].blow.note) // "G3"
 * console.log(gHarp.holes[0].draw.note) // "A3"
 * ```
 */
export const getHarmonica = (key: HarmonicaKey, tuning: TuningType = 'richter'): DiatonicHarmonica => {
  const cacheKey = `${key}:${tuning}`
  if (!harmonicaCache.has(cacheKey)) {
    harmonicaCache.set(cacheKey, createDiatonicHarmonica(key, tuning))
  }
  return harmonicaCache.get(cacheKey)!
}

/**
 * Object providing access to all harmonicas by key.
 *
 * @remarks
 * This uses a Proxy for lazy loading - harmonicas are only created when accessed.
 * Prefer using {@link getHarmonica} for explicit tuning control.
 *
 * @example
 * ```typescript
 * const cHarp = harmonicas['C']
 * const gHarp = harmonicas['G']
 * ```
 *
 * @deprecated Prefer {@link getHarmonica} for explicit tuning control
 */
export const harmonicas: Record<HarmonicaKey, DiatonicHarmonica> = new Proxy(
  {} as Record<HarmonicaKey, DiatonicHarmonica>,
  {
    get(_, key: string) {
      return getHarmonica(key as HarmonicaKey)
    },
  }
)

/** Array of all available harmonica keys */
export const AVAILABLE_KEYS = Object.keys(HARMONICA_KEY_CONFIG) as HarmonicaKey[]

/**
 * Supported musical scale types.
 *
 * @remarks
 * This is a curated list of common scales used in harmonica playing.
 * Scale notes are generated using tonal.js Scale.get().
 */
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

/** Union type of all supported scale types */
export type ScaleType = (typeof SCALE_TYPES)[number]

/**
 * Circle of fourths mapping for position calculation.
 *
 * @remarks
 * The circle of fourths is the counter-clockwise direction on the circle of fifths.
 * Each step represents a perfect fourth (5 semitones).
 *
 * Order: C → F → Bb → Eb → Ab → Db → Gb → B → E → A → D → G → C
 *
 * This is used to calculate harmonica positions (1st position, 2nd position, etc.)
 * based on the relationship between the harmonica key and song key.
 *
 * @internal
 */
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
 *
 * @remarks
 * Harmonica positions determine which mode you're playing in relative to the
 * harmonica's key. The position is calculated using the circle of fourths:
 *
 * - **1st position** (Straight harp): Playing in the key of the harmonica. Blow notes are tonic.
 * - **2nd position** (Cross harp): Playing a 4th above. Most common for blues. Draw notes are tonic.
 * - **3rd position**: Playing a minor 7th above. Good for minor keys.
 * - Higher positions are less common but available.
 *
 * @param harmonicaKey - The key of the harmonica being played
 * @param songKey - The key of the song being played
 * @returns Position number (1-12)
 *
 * @example
 * ```typescript
 * // Playing a C harmonica in the key of G (2nd position / cross harp)
 * getHarmonicaPosition('C', 'G') // Returns 2
 *
 * // Playing a G harmonica in the key of G (1st position / straight harp)
 * getHarmonicaPosition('G', 'G') // Returns 1
 *
 * // Playing an A harmonica in the key of E (2nd position)
 * getHarmonicaPosition('A', 'E') // Returns 2
 * ```
 */
export const getHarmonicaPosition = (harmonicaKey: HarmonicaKey, songKey: HarmonicaKey): number => {
  const harmonicaIndex = CIRCLE_OF_FOURTHS[harmonicaKey]
  const songIndex = CIRCLE_OF_FOURTHS[songKey]

  // Count fourths from harmonica key to song key (positions are 1-indexed)
  return ((songIndex - harmonicaIndex + 12) % 12) + 1
}
