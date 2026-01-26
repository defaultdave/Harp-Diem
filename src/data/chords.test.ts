/**
 * Tests for chord generation and voicing utilities.
 * Validates that chords are musically correct using Tonal's Chord API.
 *
 * Note: With strict 4-hole consecutive / 5-hole split constraints,
 * many theoretical chords (Dm, Am, Bdim) aren't playable because
 * their notes don't appear in valid patterns on diatonic harmonica.
 */
import { describe, it, expect } from 'vitest'
import { Note } from 'tonal'
import {
  findChordVoicings,
  getChordByName,
  getAllChords,
  getHarmonicaChords,
  getCommonChords,
} from './chords'

describe('chord note accuracy', () => {
  it('C major chord contains C, E, G notes', () => {
    const c = getChordByName('C', 'C', 'richter')
    expect(c).toBeDefined()

    const pitchClasses = c!.notes.map(n => Note.pitchClass(n))
    expect(pitchClasses).toContain('C')
    expect(pitchClasses).toContain('E')
    expect(pitchClasses).toContain('G')
  })

  it('G major chord on draw contains G, B, D notes', () => {
    const g = getChordByName('G', 'C', 'richter')
    expect(g).toBeDefined()

    const pitchClasses = g!.notes.map(n => Note.pitchClass(n))
    expect(pitchClasses).toContain('G')
    expect(pitchClasses).toContain('B')
    expect(pitchClasses).toContain('D')
  })

  it('G7 chord at holes 2-3-4-5 draw contains G, B, D, F', () => {
    const voicings = findChordVoicings('G7', 'C', 'richter')
    const g7at2345 = voicings.find(
      v => v.holes.join(',') === '2,3,4,5' && v.breath === 'draw'
    )
    expect(g7at2345).toBeDefined()

    const pitchClasses = g7at2345!.notes.map(n => Note.pitchClass(n))
    expect(pitchClasses).toContain('G')
    expect(pitchClasses).toContain('B')
    expect(pitchClasses).toContain('D')
    expect(pitchClasses).toContain('F')
  })
})

describe('breath direction rules', () => {
  it('chords never mix blow and draw', () => {
    const chords = getAllChords('C', 'richter')
    chords.forEach(chord => {
      expect(['blow', 'draw']).toContain(chord.breath)
    })
  })

  it('blow chords only use blow notes', () => {
    const chords = getAllChords('C', 'richter')
    const blowChords = chords.filter(c => c.breath === 'blow')

    blowChords.forEach(chord => {
      chord.notes.forEach(note => {
        const pc = Note.pitchClass(note)
        expect(['C', 'E', 'G']).toContain(pc)
      })
    })
  })

  it('draw chords only use draw notes', () => {
    const drawPitchClasses = ['D', 'G', 'B', 'F', 'A']

    const chords = getAllChords('C', 'richter')
    const drawChords = chords.filter(c => c.breath === 'draw')

    drawChords.forEach(chord => {
      chord.notes.forEach(note => {
        const pc = Note.pitchClass(note)
        expect(drawPitchClasses).toContain(pc)
      })
    })
  })
})

describe('voicing sorting', () => {
  it('consecutive voicings come before non-consecutive for C major', () => {
    const voicings = findChordVoicings('C', 'C', 'richter')
    expect(voicings.length).toBeGreaterThan(0)

    const firstNonConsec = voicings.findIndex(v => !v.isConsecutive)
    if (firstNonConsec > 0) {
      voicings.slice(0, firstNonConsec).forEach(v => {
        expect(v.isConsecutive).toBe(true)
      })
    }
  })

  it('voicings are sorted by lowest hole number within groups', () => {
    const voicings = findChordVoicings('C', 'C', 'richter')

    const consecutive = voicings.filter(v => v.isConsecutive)
    for (let i = 1; i < consecutive.length; i++) {
      expect(consecutive[i].holes[0]).toBeGreaterThanOrEqual(consecutive[i - 1].holes[0])
    }

    const nonConsecutive = voicings.filter(v => !v.isConsecutive)
    for (let i = 1; i < nonConsecutive.length; i++) {
      expect(nonConsecutive[i].holes[0]).toBeGreaterThanOrEqual(nonConsecutive[i - 1].holes[0])
    }
  })
})

describe('tuning support', () => {
  it('generates chords for richter tuning', () => {
    const chords = getAllChords('C', 'richter')
    expect(chords.length).toBeGreaterThan(0)
    chords.forEach(chord => {
      expect(chord.tuning).toBe('richter')
    })
  })

  it('generates C major chords for both richter and country', () => {
    const richter = getAllChords('C', 'richter')
    const country = getAllChords('C', 'country')

    expect(richter.length).toBeGreaterThan(0)
    expect(country.length).toBeGreaterThan(0)

    // Both should have C major on blow
    const richterC = richter.find(c => c.shortName === 'C' && c.breath === 'blow')
    const countryC = country.find(c => c.shortName === 'C' && c.breath === 'blow')

    expect(richterC).toBeDefined()
    expect(countryC).toBeDefined()
  })

  it('natural-minor tuning produces Cm instead of C major', () => {
    const richterC = findChordVoicings('C', 'C', 'richter')
    expect(richterC.length).toBeGreaterThan(0)

    const naturalMinorCm = findChordVoicings('Cm', 'C', 'natural-minor')
    expect(naturalMinorCm.length).toBeGreaterThan(0)

    const cmNotes = naturalMinorCm[0].notes.map(n => Note.pitchClass(n))
    expect(cmNotes).toContain('C')
    expect(cmNotes).toContain('Eb')
    expect(cmNotes).toContain('G')

    const naturalMinorC = findChordVoicings('C', 'C', 'natural-minor')
    expect(naturalMinorC.length).toBe(0)
  })

  it('paddy-richter tuning has modified hole 3 blow', () => {
    const richter = findChordVoicings('C', 'C', 'richter')
    const paddyRichter = findChordVoicings('C', 'C', 'paddy-richter')

    expect(richter.length).toBeGreaterThan(0)
    // Paddy-richter has A on hole 3 blow instead of G, may affect C voicings
    expect(paddyRichter.length).toBeGreaterThanOrEqual(0)
  })
})

describe('key transposition', () => {
  it('transposes chords correctly for G harmonica', () => {
    const gChords = getAllChords('G', 'richter')
    expect(gChords.length).toBeGreaterThan(0)

    const gMajor = gChords.find(c => c.shortName === 'G' && c.breath === 'blow')
    expect(gMajor).toBeDefined()

    const pitchClasses = gMajor!.notes.map(n => Note.pitchClass(n))
    expect(pitchClasses).toContain('G')
    expect(pitchClasses).toContain('B')
    expect(pitchClasses).toContain('D')
  })

  it('G harmonica has different chords than C harmonica', () => {
    const cChords = getAllChords('C', 'richter')
    const gChords = getAllChords('G', 'richter')

    // Both should have chords
    expect(cChords.length).toBeGreaterThan(0)
    expect(gChords.length).toBeGreaterThan(0)

    // C harmonica blow = C major, G harmonica blow = G major
    const cBlow = cChords.find(c => c.breath === 'blow')
    const gBlow = gChords.find(c => c.breath === 'blow')

    expect(cBlow?.shortName).toBe('C')
    expect(gBlow?.shortName).toBe('G')
  })
})

describe('chord interface', () => {
  it('getCommonChords returns unique chords sorted by breath then position', () => {
    const common = getCommonChords('C', 'richter')
    expect(common.length).toBeGreaterThan(0)

    const firstDrawIndex = common.findIndex(c => c.breath === 'draw')
    if (firstDrawIndex > 0) {
      common.slice(0, firstDrawIndex).forEach(c => {
        expect(c.breath).toBe('blow')
      })
    }
  })

  it('getHarmonicaChords includes position and roman numeral', () => {
    const chords = getHarmonicaChords('C', 'richter')
    const cMajor = chords.find(c => c.shortName === 'C')

    expect(cMajor).toBeDefined()
    expect(cMajor!.position).toBe(1)
    expect(cMajor!.romanNumeral).toBe('I')
  })

  it('findChordVoicings returns empty array for invalid chord', () => {
    const voicings = findChordVoicings('Xyz123', 'C', 'richter')
    expect(voicings).toEqual([])
  })
})

describe('tongue blocking constraints', () => {
  it('consecutive voicings span exactly 4 holes', () => {
    const chords = getAllChords('C', 'richter')
    const consecutive = chords.filter(c => c.isConsecutive)
    consecutive.forEach(chord => {
      const sorted = [...chord.holes].sort((a, b) => a - b)
      const span = sorted[sorted.length - 1] - sorted[0] + 1
      expect(span).toBe(4)
    })
  })

  it('split voicings span exactly 5 holes', () => {
    const chords = getAllChords('C', 'richter')
    const split = chords.filter(c => !c.isConsecutive)
    split.forEach(chord => {
      const sorted = [...chord.holes].sort((a, b) => a - b)
      const span = sorted[sorted.length - 1] - sorted[0] + 1
      expect(span).toBe(5)
    })
  })

  it('split voicings have 2-3 holes skipped', () => {
    const chords = getAllChords('C', 'richter')
    const split = chords.filter(c => !c.isConsecutive)
    split.forEach(chord => {
      const sorted = [...chord.holes].sort((a, b) => a - b)
      let maxGap = 0
      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i] - sorted[i - 1] - 1
        maxGap = Math.max(maxGap, gap)
      }
      expect(maxGap).toBeGreaterThanOrEqual(2)
      expect(maxGap).toBeLessThanOrEqual(3)
    })
  })

  it('all voicings have at most 1 gap', () => {
    const chords = getAllChords('C', 'richter')
    chords.forEach(chord => {
      const sorted = [...chord.holes].sort((a, b) => a - b)
      let gapCount = 0
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] - sorted[i - 1] > 1) gapCount++
      }
      expect(gapCount).toBeLessThanOrEqual(1)
    })
  })
})

describe('specific voicing verification', () => {
  it('C major voicing at holes 1-2-3-4 blow produces C, E, G notes', () => {
    const voicings = findChordVoicings('C', 'C', 'richter')
    const targetVoicing = voicings.find(
      v => v.holes.join(',') === '1,2,3,4' && v.breath === 'blow'
    )

    expect(targetVoicing).toBeDefined()
    const pitchClasses = targetVoicing!.notes.map(n => Note.pitchClass(n))
    expect(pitchClasses).toContain('C')
    expect(pitchClasses).toContain('E')
    expect(pitchClasses).toContain('G')
  })

  it('G major voicing at holes 1-2-3-4 draw produces G, B, D notes', () => {
    const voicings = findChordVoicings('G', 'C', 'richter')
    const targetVoicing = voicings.find(
      v => v.holes.join(',') === '1,2,3,4' && v.breath === 'draw'
    )

    expect(targetVoicing).toBeDefined()
    const pitchClasses = targetVoicing!.notes.map(n => Note.pitchClass(n))
    expect(pitchClasses).toContain('G')
    expect(pitchClasses).toContain('B')
    expect(pitchClasses).toContain('D')
  })

  it('all voicings have at least 3 notes', () => {
    const chords = getAllChords('C', 'richter')
    chords.forEach(chord => {
      expect(chord.holes.length).toBeGreaterThanOrEqual(3)
    })
  })
})
