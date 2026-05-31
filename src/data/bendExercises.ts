/**
 * Bend exercise generation for the Bending Practice mode.
 *
 * Extracts the pre-computed bend / extended-technique frequencies from a
 * harmonica's hole data ({@link getHarmonica}) and groups them into graded
 * practice exercises. The note frequencies are produced by tonal.js at the
 * standard A4 = 440 Hz reference; the practice hook compares them against the
 * raw detected frequency, so reference-pitch tuning does not enter here.
 * @packageDocumentation
 */
import { getHarmonica } from './harmonicas'
import type { HarmonicaKey, HarmonicaNote, HoleNote, TuningType } from './harmonicas'

/** A specific bend or extended technique on a hole. */
export type BendType =
  | 'draw-half'
  | 'draw-whole'
  | 'draw-minor-third'
  | 'blow-half'
  | 'blow-whole'
  | 'overblow'
  | 'overdraw'

/** Difficulty tier for a set of bend exercises. */
export type BendDifficulty = 'beginner' | 'intermediate' | 'advanced'

/** Selectable difficulty tiers, in order, for UI controls. */
export const BEND_DIFFICULTIES: BendDifficulty[] = ['beginner', 'intermediate', 'advanced']

/** A single guided bending exercise: one target note on one hole. */
export interface BendExercise {
  /** Hole number (1-10). */
  hole: number
  /** Which bend / technique produces the target. */
  bendType: BendType
  /** Target note name (e.g. "Db4"). */
  targetNote: string
  /** Target frequency in Hz (A4 = 440 reference). */
  targetFrequency: number
  /** Difficulty tier this exercise belongs to. */
  difficulty: BendDifficulty
  /** Human-readable one-line description. */
  description: string
}

/** Human-readable label for each bend type, used in exercise descriptions. */
const BEND_LABELS: Record<BendType, string> = {
  'draw-half': 'draw half-step bend',
  'draw-whole': 'draw whole-step bend',
  'draw-minor-third': 'draw minor-third bend',
  'blow-half': 'blow half-step bend',
  'blow-whole': 'blow whole-step bend',
  overblow: 'overblow',
  overdraw: 'overdraw',
}

/** Holes whose draw half-step bend is the easiest to learn first. */
const BEGINNER_HOLES = [1, 4, 6]
/** Draw bend types, easiest to hardest, for the intermediate tier. */
const DRAW_BEND_TYPES: BendType[] = ['draw-half', 'draw-whole', 'draw-minor-third']
/** Advanced techniques: blow bends and over-bends. */
const ADVANCED_BEND_TYPES: BendType[] = ['blow-half', 'blow-whole', 'overblow', 'overdraw']

/** Resolves the note for a given bend type on a hole, if it exists for this tuning. */
const getBendNote = (hole: HoleNote, bendType: BendType): HarmonicaNote | undefined => {
  switch (bendType) {
    case 'draw-half':
      return hole.drawBends?.halfStepBend
    case 'draw-whole':
      return hole.drawBends?.wholeStepBend
    case 'draw-minor-third':
      return hole.drawBends?.minorThirdBend
    case 'blow-half':
      return hole.blowBends?.halfStepBend
    case 'blow-whole':
      return hole.blowBends?.wholeStepBend
    case 'overblow':
      return hole.overblow
    case 'overdraw':
      return hole.overdraw
  }
}

/** Builds an exercise from a hole + bend type, or undefined if the bend is unavailable. */
const makeExercise = (
  hole: HoleNote,
  bendType: BendType,
  difficulty: BendDifficulty
): BendExercise | undefined => {
  const note = getBendNote(hole, bendType)
  if (!note || !note.frequency) return undefined
  return {
    hole: hole.hole,
    bendType,
    targetNote: note.note,
    targetFrequency: note.frequency,
    difficulty,
    description: `Hole ${hole.hole} ${BEND_LABELS[bendType]} → ${note.note}`,
  }
}

/**
 * Generates the bend exercises for a harmonica at a given difficulty.
 *
 * - **beginner**: holes 1, 4, 6 draw half-step bends (physically easiest).
 * - **intermediate**: every available draw bend (half / whole / minor-third).
 * - **advanced**: blow bends, overblows, and overdraws.
 *
 * Bend slots that do not exist for the selected tuning are skipped, so the
 * returned list adapts to alternate tunings automatically.
 */
export const getBendExercises = (
  harmonicaKey: HarmonicaKey,
  tuning: TuningType,
  difficulty: BendDifficulty
): BendExercise[] => {
  const { holes } = getHarmonica(harmonicaKey, tuning)
  const exercises: BendExercise[] = []

  for (const hole of holes) {
    if (difficulty === 'beginner') {
      if (!BEGINNER_HOLES.includes(hole.hole)) continue
      const exercise = makeExercise(hole, 'draw-half', 'beginner')
      if (exercise) exercises.push(exercise)
    } else {
      const bendTypes = difficulty === 'intermediate' ? DRAW_BEND_TYPES : ADVANCED_BEND_TYPES
      for (const bendType of bendTypes) {
        const exercise = makeExercise(hole, bendType, difficulty)
        if (exercise) exercises.push(exercise)
      }
    }
  }

  return exercises
}
