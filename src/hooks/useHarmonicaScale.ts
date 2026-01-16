import { useMemo } from 'react'
import type { HarmonicaKey, ScaleType, DiatonicHarmonica, TuningType } from '../data/harmonicas'
import { getScaleNotes, isNoteInScale } from '../data/scales'
import { getHarmonica } from '../data/harmonicas'
import type { NoteNames } from '../types'

export interface UseHarmonicaScaleResult {
  harmonica: DiatonicHarmonica
  scaleNotes: NoteNames
  playableHoles: number[] // Holes with blow or draw in scale
  playableBlowHoles: number[]
  playableDrawHoles: number[]
  allHoles: number[]
  missingNotes: NoteNames // Scale notes not available on the harmonica
}

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

  // Calculate which scale notes are missing (not available on the harmonica)
  const missingNotes = useMemo(() => {
    // Collect all available notes from the harmonica (including bends and overblows/overdraws)
    const availableNotes = new Set<string>()
    
    harmonica.holes.forEach((hole) => {
      // Add blow and draw notes
      availableNotes.add(hole.blow.note)
      availableNotes.add(hole.draw.note)
      
      // Add blow bends
      if (hole.blowBends?.halfStepBend) availableNotes.add(hole.blowBends.halfStepBend.note)
      if (hole.blowBends?.wholeStepBend) availableNotes.add(hole.blowBends.wholeStepBend.note)
      if (hole.blowBends?.minorThirdBend) availableNotes.add(hole.blowBends.minorThirdBend.note)
      
      // Add draw bends
      if (hole.drawBends?.halfStepBend) availableNotes.add(hole.drawBends.halfStepBend.note)
      if (hole.drawBends?.wholeStepBend) availableNotes.add(hole.drawBends.wholeStepBend.note)
      if (hole.drawBends?.minorThirdBend) availableNotes.add(hole.drawBends.minorThirdBend.note)
      
      // Add overblows and overdraws
      if (hole.overblow) availableNotes.add(hole.overblow.note)
      if (hole.overdraw) availableNotes.add(hole.overdraw.note)
    })
    
    // Filter scale notes to find which ones are not available
    return scaleNotes.filter((scaleNote) => !isNoteInScale(scaleNote, Array.from(availableNotes)))
  }, [harmonica.holes, scaleNotes])

  return {
    harmonica,
    scaleNotes,
    playableHoles,
    playableBlowHoles,
    playableDrawHoles,
    allHoles,
    missingNotes,
  }
}
