/**
 * @packageDocumentation
 * Hook for combining harmonica data with scale selection.
 *
 * This is the primary hook for the harmonica visualization, providing
 * the harmonica layout and determining which holes are playable for
 * the selected scale.
 *
 * @category Hooks
 */
import { useMemo } from 'react'
import type { HarmonicaKey, ScaleType, DiatonicHarmonica, TuningType } from '../data'
import { getScaleNotes, isNoteInScale, getHarmonica } from '../data'
import type { NoteNames } from '../types'

/**
 * Result object returned by the useHarmonicaScale hook.
 *
 * @remarks
 * Contains the harmonica data, scale notes, and various filtered lists
 * of playable holes for efficient rendering.
 */
export interface UseHarmonicaScaleResult {
  /** The complete harmonica data for the selected key and tuning */
  harmonica: DiatonicHarmonica
  /** Array of note names in the selected scale */
  scaleNotes: NoteNames
  /** Hole numbers where either blow or draw is in the scale */
  playableHoles: number[]
  /** Hole numbers where the blow note is in the scale */
  playableBlowHoles: number[]
  /** Hole numbers where the draw note is in the scale */
  playableDrawHoles: number[]
  /** All hole numbers (1-10) for iteration */
  allHoles: number[]
}

/**
 * Combines harmonica data with scale selection to determine playable notes.
 *
 * @remarks
 * This hook is the core of the harmonica visualization. It:
 * 1. Gets the harmonica layout for the selected key and tuning
 * 2. Generates the scale notes for the selected song key and scale type
 * 3. Calculates which holes have playable blow/draw notes in the scale
 *
 * All calculations are memoized for performance.
 *
 * @param harmonicaKey - The key of the harmonica (e.g., "C", "G")
 * @param songKey - The key of the song/scale (e.g., "G", "D")
 * @param scaleType - The type of scale (e.g., "major", "blues")
 * @param tuning - The harmonica tuning (default: "richter")
 * @returns Object containing harmonica data and playable hole information
 *
 * @example
 * ```tsx
 * function HarmonicaView() {
 *   const { harmonica, playableBlowHoles, playableDrawHoles } =
 *     useHarmonicaScale('G', 'D', 'blues', 'richter')
 *
 *   return (
 *     <div>
 *       {harmonica.holes.map(hole => (
 *         <HoleColumn
 *           key={hole.hole}
 *           hole={hole}
 *           isBlowPlayable={playableBlowHoles.includes(hole.hole)}
 *           isDrawPlayable={playableDrawHoles.includes(hole.hole)}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
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
