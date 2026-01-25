/**
 * Hook for combining harmonica data with scale selection.
 * @packageDocumentation
 */
import { useMemo } from 'react'
import type { HarmonicaKey, ScaleType, DiatonicHarmonica, TuningType } from '../data'
import { getScaleNotes, isNoteInScale, getHarmonica } from '../data'
import type { NoteNames } from '../types'

/** Result from useHarmonicaScale hook. */
export interface UseHarmonicaScaleResult {
  harmonica: DiatonicHarmonica
  scaleNotes: NoteNames
  playableHoles: number[]
  playableBlowHoles: number[]
  playableDrawHoles: number[]
  allHoles: number[]
}

/**
 * Combines harmonica data with scale selection to determine playable notes.
 * Returns memoized harmonica data and filtered lists of playable holes.
 */
export const useHarmonicaScale = (
  harmonicaKey: HarmonicaKey,
  songKey: HarmonicaKey,
  scaleType: ScaleType,
  tuning: TuningType = 'richter'
): UseHarmonicaScaleResult => {
  const harmonica = useMemo(() => getHarmonica(harmonicaKey, tuning), [harmonicaKey, tuning])

  const scaleNotes = useMemo(() => {
    const notes = getScaleNotes(songKey, scaleType)
    return notes.map((n) => n.note)
  }, [songKey, scaleType])

  const playableBlowHoles = useMemo(() => {
    return harmonica.holes
      .filter((hole) => isNoteInScale(hole.blow.note, scaleNotes))
      .map((hole) => hole.hole)
  }, [harmonica.holes, scaleNotes])

  const playableDrawHoles = useMemo(() => {
    return harmonica.holes
      .filter((hole) => isNoteInScale(hole.draw.note, scaleNotes))
      .map((hole) => hole.hole)
  }, [harmonica.holes, scaleNotes])

  const playableHoles = useMemo(
    () => Array.from(new Set([...playableBlowHoles, ...playableDrawHoles])),
    [playableBlowHoles, playableDrawHoles]
  )

  const allHoles = useMemo(() => {
    return harmonica.holes.map((hole) => hole.hole)
  }, [harmonica.holes])

  return {
    harmonica,
    scaleNotes,
    playableHoles,
    playableBlowHoles,
    playableDrawHoles,
    allHoles,
  }
}
