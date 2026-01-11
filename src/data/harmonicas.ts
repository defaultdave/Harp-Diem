import { Note, Interval } from 'tonal'

// Single source of truth for harmonica keys and their starting octaves
// Keys C through F#/Gb start at middle C (octave 4)
// Keys G through B start below middle C (octave 3)
const HARMONICA_KEY_CONFIG = {
  'C': { startOctave: 4 },
  'C#': { startOctave: 4 },
  'Db': { startOctave: 4 },
  'D': { startOctave: 4 },
  'D#': { startOctave: 4 },
  'Eb': { startOctave: 4 },
  'E': { startOctave: 4 },
  'F': { startOctave: 4 },
  'F#': { startOctave: 4 },
  'Gb': { startOctave: 4 },
  'G': { startOctave: 3 },
  'G#': { startOctave: 3 },
  'Ab': { startOctave: 3 },
  'A': { startOctave: 3 },
  'A#': { startOctave: 3 },
  'Bb': { startOctave: 3 },
  'B': { startOctave: 3 },
} as const

export type HarmonicaKey = keyof typeof HARMONICA_KEY_CONFIG

// Reference octave for C harmonica (used for calculating octave shifts)
const C_START_OCTAVE = 4

export interface HarmonicaNote {
  note: string
  frequency: number
}

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
  if (interval >= 2) bends.halfStepBend = { note: Note.transpose(drawNote, '-2m'), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: Note.transpose(drawNote, '-2M'), frequency: 0 }
  if (interval >= 4) bends.minorThirdBend = { note: Note.transpose(drawNote, '-3m'), frequency: 0 }
  return bends
}

// Build blow bends based on interval between blow and draw notes
const buildBlowBends = (blowNote: string, interval: number): HoleBends | undefined => {
  if (interval < 2) return undefined
  const bends: HoleBends = {}
  if (interval >= 2) bends.halfStepBend = { note: Note.transpose(blowNote, '-2m'), frequency: 0 }
  if (interval >= 3) bends.wholeStepBend = { note: Note.transpose(blowNote, '-2M'), frequency: 0 }
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
      ? { note: Note.transpose(drawNote, '2m'), frequency: 0 }
      : undefined
    return { drawBends, overblow }
  } else {
    // Blow is higher than draw: blow bends available, overdraw on specific holes
    const blowBends = buildBlowBends(blowNote, Math.abs(interval))
    const overdraw = OVERDRAW_HOLES.includes(holeNumber)
      ? { note: Note.transpose(blowNote, '2m'), frequency: 0 }
      : undefined
    return { blowBends, overdraw }
  }
}

// Blow and draw notes for C harmonica (standard Richter tuning)
const BLOW_NOTES_C = [
  'C4',
  'E4',
  'G4',
  'C5',
  'E5',
  'G5',
  'C6',
  'E6',
  'G6',
  'C7',
]

const DRAW_NOTES_C = [
  'D4',
  'G4',
  'B4',
  'D5',
  'F5',
  'A5',
  'B5',
  'D6',
  'F6',
  'A6',
]

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
const buildHoles = (blowNotes: string[], drawNotes: string[]): HoleNote[] => {
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

const createDiatonicHarmonica = (key: HarmonicaKey): DiatonicHarmonica => {
  // For C harmonica, use base notes directly
  if (key === 'C') {
    return { key, holes: buildHoles(BLOW_NOTES_C, DRAW_NOTES_C) }
  }

  // Transpose blow/draw notes for other keys - bends are calculated dynamically
  const keyDifference = Interval.semitones(Interval.distance('C', key)) || 0
  const octaveShift = HARMONICA_KEY_CONFIG[key].startOctave - C_START_OCTAVE

  const transposeNote = (note: string): string => {
    const transposed = Note.transpose(note, Interval.fromSemitones(keyDifference))
    if (octaveShift === 0) return transposed
    return Note.transpose(transposed, Interval.fromSemitones(octaveShift * 12))
  }

  const transposedBlow = BLOW_NOTES_C.map(transposeNote)
  const transposedDraw = DRAW_NOTES_C.map(transposeNote)

  return { key, holes: buildHoles(transposedBlow, transposedDraw) }
}

// Lazy-loaded cache for harmonicas - only created when requested
const harmonicaCache: Partial<Record<HarmonicaKey, DiatonicHarmonica>> = {}

export const getHarmonica = (key: HarmonicaKey): DiatonicHarmonica => {
  if (!harmonicaCache[key]) {
    harmonicaCache[key] = createDiatonicHarmonica(key)
  }
  return harmonicaCache[key]
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
