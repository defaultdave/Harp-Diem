import { Scale, Note } from 'tonal'
import type { ScaleType } from './harmonicas'

export interface ScaleNote {
  note: string
  frequency: number
}

export const getScaleNotes = (rootKey: string, scaleType: ScaleType): ScaleNote[] => {
  let scaleName: string

  switch (scaleType) {
    case 'major':
      scaleName = 'major'
      break
    case 'minor':
      scaleName = 'minor'
      break
    case 'pentatonic':
      scaleName = 'pentatonic major'
      break
    case 'blues':
      scaleName = 'blues'
      break
    default:
      scaleName = 'major'
  }

  const notes = Scale.get(`${rootKey} ${scaleName}`)?.notes || []

  return notes.map((note) => ({
    note,
    frequency: Note.freq(note) || 0,
  }))
}

export const getNoteOctave = (note: string): number => {
  const match = note.match(/\d+$/)
  return match ? parseInt(match[0]) : 4
}

export const isNoteInScale = (note: string, scaleNotes: string[]): boolean => {
  const noteWithoutOctave = note.replace(/\d+$/, '')
  return scaleNotes.some((n) => n.replace(/\d+$/, '') === noteWithoutOctave)
}
