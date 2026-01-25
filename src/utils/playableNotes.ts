/**
 * Utilities for collecting playable notes from harmonica hole data.
 * @packageDocumentation
 */
import type { HoleNote } from '../data'
import type { NoteNames } from '../types'
import { isNoteInScale } from '../data'

/** A note that can be played, with its name and frequency. */
export interface PlayableNote {
  note: string
  frequency: number
}

/** @internal */
interface NoteSource {
  note: string
  frequency: number
}

/** @internal */
const collectIfPlayable = (
  source: NoteSource | undefined,
  scaleNotes: NoteNames,
  seen: Set<number>,
  notes: PlayableNote[]
): void => {
  if (source && isNoteInScale(source.note, scaleNotes) && !seen.has(source.frequency)) {
    notes.push({ note: source.note, frequency: source.frequency })
    seen.add(source.frequency)
  }
}

/**
 * Collects all playable notes from harmonica holes for a given scale.
 * Includes bends and extended techniques, deduplicates by frequency.
 */
export const collectPlayableNotes = (
  holes: HoleNote[],
  scaleNotes: NoteNames
): PlayableNote[] => {
  const notes: PlayableNote[] = []
  const seen = new Set<number>()

  for (const hole of holes) {
    collectIfPlayable(hole.blow, scaleNotes, seen, notes)
    collectIfPlayable(hole.draw, scaleNotes, seen, notes)
    collectIfPlayable(hole.blowBends?.halfStepBend, scaleNotes, seen, notes)
    collectIfPlayable(hole.blowBends?.wholeStepBend, scaleNotes, seen, notes)
    collectIfPlayable(hole.drawBends?.halfStepBend, scaleNotes, seen, notes)
    collectIfPlayable(hole.drawBends?.wholeStepBend, scaleNotes, seen, notes)
    collectIfPlayable(hole.drawBends?.minorThirdBend, scaleNotes, seen, notes)
    collectIfPlayable(hole.overblow, scaleNotes, seen, notes)
    collectIfPlayable(hole.overdraw, scaleNotes, seen, notes)
  }

  return notes.sort((a, b) => a.frequency - b.frequency)
}

/** Playability status for all bend and extended techniques on a hole. */
export interface BendPlayability {
  isOverblowPlayable: boolean
  isBlowHalfStepPlayable: boolean
  isBlowWholeStepPlayable: boolean
  isDrawHalfStepPlayable: boolean
  isDrawWholeStepPlayable: boolean
  isDrawMinorThirdPlayable: boolean
  isOverdrawPlayable: boolean
}

/** Calculates playability status for all bend types on a harmonica hole. */
export const getBendPlayability = (hole: HoleNote, scaleNotes: NoteNames): BendPlayability => ({
  isOverblowPlayable: !!hole.overblow && isNoteInScale(hole.overblow.note, scaleNotes),
  isBlowHalfStepPlayable: !!hole.blowBends?.halfStepBend && isNoteInScale(hole.blowBends.halfStepBend.note, scaleNotes),
  isBlowWholeStepPlayable: !!hole.blowBends?.wholeStepBend && isNoteInScale(hole.blowBends.wholeStepBend.note, scaleNotes),
  isDrawHalfStepPlayable: !!hole.drawBends?.halfStepBend && isNoteInScale(hole.drawBends.halfStepBend.note, scaleNotes),
  isDrawWholeStepPlayable: !!hole.drawBends?.wholeStepBend && isNoteInScale(hole.drawBends.wholeStepBend.note, scaleNotes),
  isDrawMinorThirdPlayable: !!hole.drawBends?.minorThirdBend && isNoteInScale(hole.drawBends.minorThirdBend.note, scaleNotes),
  isOverdrawPlayable: !!hole.overdraw && isNoteInScale(hole.overdraw.note, scaleNotes),
})
