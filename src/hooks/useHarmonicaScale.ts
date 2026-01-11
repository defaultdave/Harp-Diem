import { useMemo } from 'react'
import type { HarmonicaKey, ScaleType, DiatonicHarmonica } from '../data/harmonicas'
import { getScaleNotes, isNoteInScale } from '../data/scales'
import { harmonicas } from '../data/harmonicas'

export interface UseHarmonicaScaleResult {
  harmonica: DiatonicHarmonica
  scaleNotes: string[]
  playableHoles: number[] // Holes with blow or draw in scale
  playableBlowHoles: number[]
  playableDrawHoles: number[]
  allHoles: number[]
}

export const useHarmonicaScale = (
  harmonicaKey: HarmonicaKey,
  songKey: string,
  scaleType: ScaleType
): UseHarmonicaScaleResult => {
  const harmonica = harmonicas[harmonicaKey]

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
