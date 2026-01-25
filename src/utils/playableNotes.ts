/**
 * @packageDocumentation
 * Utilities for collecting playable notes from harmonica hole data.
 *
 * @remarks
 * These utilities help identify which notes on a harmonica are playable
 * for a given scale, including bends and extended techniques.
 *
 * @category Utils
 */
import type { HoleNote } from '../data'
import type { NoteNames } from '../types'
import { isNoteInScale } from '../data'

/**
 * A note that can be played, with its name and frequency.
 */
export interface PlayableNote {
  /** Note name with octave (e.g., "C4") */
  note: string
  /** Frequency in Hz for audio playback */
  frequency: number
}

/**
 * Source of a note (note name + frequency).
 * @internal
 */
interface NoteSource {
  note: string
  frequency: number
}

/**
 * Adds a note to the collection if it's in the scale and hasn't been seen.
 *
 * @param source - The note source (may be undefined)
 * @param scaleNotes - Array of scale note names
 * @param seen - Set of already-collected frequencies
 * @param notes - Array to add playable notes to
 * @internal
 */
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
 *
 * @remarks
 * Iterates through all holes and their note sources (blow, draw, bends,
 * overblows, overdraws) and collects notes that are in the scale.
 * Deduplicates by frequency and returns sorted by pitch (low to high).
 *
 * @param holes - Array of harmonica hole data
 * @param scaleNotes - Array of note names in the scale
 * @returns Array of playable notes sorted by frequency (ascending)
 *
 * @example
 * ```typescript
 * const playable = collectPlayableNotes(harmonica.holes, ['C', 'D', 'E', 'G', 'A'])
 * // Returns all pentatonic scale notes playable on the harmonica
 * ```
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

/**
 * Playability status for all bend and extended techniques on a hole.
 *
 * @remarks
 * Used by HoleColumn to determine which bend indicators to highlight.
 */
export interface BendPlayability {
  /** Overblow note is in scale */
  isOverblowPlayable: boolean
  /** Blow half-step bend is in scale */
  isBlowHalfStepPlayable: boolean
  /** Blow whole-step bend is in scale */
  isBlowWholeStepPlayable: boolean
  /** Draw half-step bend is in scale */
  isDrawHalfStepPlayable: boolean
  /** Draw whole-step bend is in scale */
  isDrawWholeStepPlayable: boolean
  /** Draw minor-third bend is in scale */
  isDrawMinorThirdPlayable: boolean
  /** Overdraw note is in scale */
  isOverdrawPlayable: boolean
}

/**
 * Calculates playability status for all bend types on a harmonica hole.
 *
 * @remarks
 * Checks each available bend/extended technique against the scale
 * to determine if it produces a playable note.
 *
 * @param hole - Harmonica hole data with all note sources
 * @param scaleNotes - Array of note names in the scale
 * @returns Object with boolean flags for each technique's playability
 *
 * @example
 * ```typescript
 * const playability = getBendPlayability(hole4, ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'])
 * // playability.isDrawHalfStepPlayable might be true if Db4 is in scale
 * ```
 */
export const getBendPlayability = (hole: HoleNote, scaleNotes: NoteNames): BendPlayability => ({
  isOverblowPlayable: !!hole.overblow && isNoteInScale(hole.overblow.note, scaleNotes),
  isBlowHalfStepPlayable: !!hole.blowBends?.halfStepBend && isNoteInScale(hole.blowBends.halfStepBend.note, scaleNotes),
  isBlowWholeStepPlayable: !!hole.blowBends?.wholeStepBend && isNoteInScale(hole.blowBends.wholeStepBend.note, scaleNotes),
  isDrawHalfStepPlayable: !!hole.drawBends?.halfStepBend && isNoteInScale(hole.drawBends.halfStepBend.note, scaleNotes),
  isDrawWholeStepPlayable: !!hole.drawBends?.wholeStepBend && isNoteInScale(hole.drawBends.wholeStepBend.note, scaleNotes),
  isDrawMinorThirdPlayable: !!hole.drawBends?.minorThirdBend && isNoteInScale(hole.drawBends.minorThirdBend.note, scaleNotes),
  isOverdrawPlayable: !!hole.overdraw && isNoteInScale(hole.overdraw.note, scaleNotes),
})
