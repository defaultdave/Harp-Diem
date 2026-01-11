import { Note, Interval } from 'tonal'

export type HarmonicaKey = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

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

// C harmonica layout (standard Richter tuning)
const C_HARMONICA_LAYOUT: Omit<HoleNote, 'blow' | 'draw'>[] = [
  {
    hole: 1,
    blowBends: { halfStepBend: { note: 'Eb4', frequency: 0 } },
    drawBends: { 
      wholeStepBend: { note: 'Db4', frequency: 0 }, 
    },
  },
  {
    hole: 2,
    drawBends: { 
      wholeStepBend: { note: 'Gb4', frequency: 0 }, 
      minorThirdBend: { note: 'F4', frequency: 0 } 
    },
  },
  {
    hole: 3,
    drawBends: { 
      halfStepBend: { note: 'Bb4', frequency: 0 }, 
      wholeStepBend: { note: 'A4', frequency: 0 }, 
      minorThirdBend: { note: 'Ab4', frequency: 0 } 
    },
  },
  {
    hole: 4,
    blowBends: { 
      halfStepBend: { note: 'Eb5', frequency: 0 }, 
    },
    drawBends: { 
      halfStepBend: { note: 'Db5', frequency: 0 }, 
    },
  },
  {
    hole: 5,
    blowBends: { 
      halfStepBend: { note: 'Gb5', frequency: 0 }, 
    },
  },
  {
    hole: 6,
    blowBends: { 
      halfStepBend: { note: 'Bb5', frequency: 0 }, 
    },
    drawBends: { halfStepBend: { note: 'Ab5', frequency: 0 } },
  },
  {
    hole: 7,
    overdraw: {  note: 'Db5', frequency: 0 },
  },
  {
    hole: 8,
    blowBends: { 
      halfStepBend: { note: 'Eb6', frequency: 0 }, 
    },
  },
  {
    hole: 9,
    blowBends: { 
      halfStepBend: { note: 'Gb6', frequency: 0 }, 
    },
    overdraw: { note: 'Ab6', frequency: 0 },
  },
  {
    hole: 10,
    blowBends: { halfStepBend: { note: 'B7', frequency: 0 },  wholeStepBend: { note: 'Bb7', frequency: 0 } },
    overdraw: { note: 'Db7', frequency: 0 },
  },
]

// Blow and draw notes for C harmonica
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

const convertNotesToFrequencies = (
  blowNotes: string[],
  drawNotes: string[],
  layoutData: (Omit<HoleNote, 'blow' | 'draw'> & { hole: number })[]
): HoleNote[] => {
  return layoutData.map((item, idx) => {
    const convertBends = (bends?: HoleBends): HoleBends | undefined => {
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

    return {
      hole: item.hole,
      blow: {
        note: blowNotes[idx],
        frequency: Note.freq(blowNotes[idx]) || 0,
      },
      draw: {
        note: drawNotes[idx],
        frequency: Note.freq(drawNotes[idx]) || 0,
      },
      blowBends: item.blowBends ? convertBends(item.blowBends) : undefined,
      drawBends: item.drawBends ? convertBends(item.drawBends) : undefined,
      overblow: item.overblow
        ? { note: item.overblow.note, frequency: Note.freq(item.overblow.note) || 0 }
        : undefined,
      overdraw: item.overdraw
        ? { note: item.overdraw.note, frequency: Note.freq(item.overdraw.note) || 0 }
        : undefined,
    }
  })
}

const createDiatonicHarmonica = (key: HarmonicaKey): DiatonicHarmonica => {
  if (key === 'C') {
    return {
      key,
      holes: convertNotesToFrequencies(BLOW_NOTES_C, DRAW_NOTES_C, C_HARMONICA_LAYOUT),
    }
  }

  // Transpose for other keys
  const keyDifference = Interval.semitones(Interval.distance('C', key)) || 0

  const transposeBlow = BLOW_NOTES_C.map((note) =>
    Note.transpose(note, Interval.fromSemitones(keyDifference))
  )

  const transposeDraw = DRAW_NOTES_C.map((note) =>
    Note.transpose(note, Interval.fromSemitones(keyDifference))
  )

  // Transpose bends - only transpose note names, frequencies are calculated by convertNotesToFrequencies
  const interval = Interval.fromSemitones(keyDifference)
  const transposedLayout = C_HARMONICA_LAYOUT.map((item) => {
    const transposeBends = (bends?: HoleBends): HoleBends | undefined => {
      if (!bends) return undefined
      return {
        halfStepBend: bends.halfStepBend
          ? { note: Note.transpose(bends.halfStepBend.note, interval), frequency: 0 }
          : undefined,
        wholeStepBend: bends.wholeStepBend
          ? { note: Note.transpose(bends.wholeStepBend.note, interval), frequency: 0 }
          : undefined,
        minorThirdBend: bends.minorThirdBend
          ? { note: Note.transpose(bends.minorThirdBend.note, interval), frequency: 0 }
          : undefined,
      }
    }

    return {
      hole: item.hole,
      blowBends: item.blowBends ? transposeBends(item.blowBends) : undefined,
      drawBends: item.drawBends ? transposeBends(item.drawBends) : undefined,
      overblow: item.overblow
        ? { note: Note.transpose(item.overblow.note, interval), frequency: 0 }
        : undefined,
      overdraw: item.overdraw
        ? { note: Note.transpose(item.overdraw.note, interval), frequency: 0 }
        : undefined,
    }
  })

  return {
    key,
    holes: convertNotesToFrequencies(transposeBlow, transposeDraw, transposedLayout),
  }
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

export const AVAILABLE_KEYS: HarmonicaKey[] = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']

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
