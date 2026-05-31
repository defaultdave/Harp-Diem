import { describe, it, expect } from 'vitest'
import { getBendExercises, BEND_DIFFICULTIES } from './bendExercises'
import { getHarmonica } from './harmonicas'

describe('getBendExercises', () => {
  describe('beginner tier', () => {
    it('returns only holes 1, 4, 6 draw half-step bends', () => {
      const exercises = getBendExercises('C', 'richter', 'beginner')

      expect(exercises.map((e) => e.hole)).toEqual([1, 4, 6])
      expect(exercises.every((e) => e.bendType === 'draw-half')).toBe(true)
      expect(exercises.every((e) => e.difficulty === 'beginner')).toBe(true)
    })

    it('uses the exact note + frequency from the harmonica hole data', () => {
      const exercises = getBendExercises('C', 'richter', 'beginner')
      const { holes } = getHarmonica('C', 'richter')

      for (const exercise of exercises) {
        const slot = holes[exercise.hole - 1].drawBends?.halfStepBend
        expect(slot).toBeDefined()
        expect(exercise.targetNote).toBe(slot!.note)
        expect(exercise.targetFrequency).toBeCloseTo(slot!.frequency, 5)
        expect(exercise.targetFrequency).toBeGreaterThan(0)
      }
    })

    it('includes a readable description referencing the hole and target note', () => {
      const [first] = getBendExercises('C', 'richter', 'beginner')
      expect(first.description).toContain('Hole 1')
      expect(first.description).toContain(first.targetNote)
    })
  })

  describe('intermediate tier', () => {
    it('contains only draw bends across all bend depths', () => {
      const exercises = getBendExercises('C', 'richter', 'intermediate')
      const drawTypes = new Set(['draw-half', 'draw-whole', 'draw-minor-third'])

      expect(exercises.length).toBeGreaterThan(0)
      expect(exercises.every((e) => drawTypes.has(e.bendType))).toBe(true)
    })

    it('includes a minor-third draw bend (hole 3 on a C richter harp)', () => {
      const exercises = getBendExercises('C', 'richter', 'intermediate')
      const minorThird = exercises.filter((e) => e.bendType === 'draw-minor-third')

      expect(minorThird.length).toBeGreaterThan(0)
      expect(minorThird.some((e) => e.hole === 3)).toBe(true)
    })
  })

  describe('advanced tier', () => {
    it('contains only blow bends, overblows, and overdraws', () => {
      const exercises = getBendExercises('C', 'richter', 'advanced')
      const advancedTypes = new Set(['blow-half', 'blow-whole', 'overblow', 'overdraw'])

      expect(exercises.length).toBeGreaterThan(0)
      expect(exercises.every((e) => advancedTypes.has(e.bendType))).toBe(true)
    })

    it('includes overblows on holes 1, 4, 5, 6', () => {
      const overblowHoles = getBendExercises('C', 'richter', 'advanced')
        .filter((e) => e.bendType === 'overblow')
        .map((e) => e.hole)

      expect(overblowHoles).toEqual([1, 4, 5, 6])
    })
  })

  describe('tuning sensitivity', () => {
    it('produces a different intermediate set for country tuning (hole 5 draw bends)', () => {
      const richter = getBendExercises('C', 'richter', 'intermediate')
      const country = getBendExercises('C', 'country', 'intermediate')

      // Richter hole 5 (E5 blow / F5 draw, 1 semitone apart) has no draw bend;
      // country raises the hole 5 draw to F#5, opening a half-step bend.
      expect(richter.some((e) => e.hole === 5)).toBe(false)
      expect(country.some((e) => e.hole === 5)).toBe(true)
    })
  })

  describe('robustness', () => {
    it('never emits an exercise with a zero or missing target frequency', () => {
      for (const difficulty of BEND_DIFFICULTIES) {
        const exercises = getBendExercises('A', 'richter', difficulty)
        expect(exercises.every((e) => e.targetFrequency > 0)).toBe(true)
        expect(exercises.every((e) => typeof e.targetNote === 'string' && e.targetNote.length > 0)).toBe(true)
      }
    })
  })
})
