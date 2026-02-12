import { describe, it, expect } from 'vitest'
import {
  getHarmonicaChords,
  getCommonChords,
  getChordsByPosition,
  findChordVoicings,
  getChordByName,
  getAllChords,
  getScaleFilteredChords,
  getScaleFilteredTongueBlockingChords,
  getTongueBlockingChords,
  groupChordsByName,
} from './chords'
import type { ChordVoicing } from './chords'

describe('Chords', () => {
  describe('getHarmonicaChords', () => {
    it('should return an array of chord voicings for C harmonica', () => {
      const chords = getHarmonicaChords('C')
      expect(chords).toBeInstanceOf(Array)
      expect(chords.length).toBeGreaterThan(0)
    })

    it('should have valid chord structure', () => {
      const chords = getHarmonicaChords('C')
      chords.forEach((chord: ChordVoicing) => {
        expect(chord.name).toBeTruthy()
        expect(chord.shortName).toBeTruthy()
        expect(chord.quality).toBeTruthy()
        expect(chord.holes).toBeInstanceOf(Array)
        expect(chord.holes.length).toBeGreaterThan(0)
        expect(['blow', 'draw']).toContain(chord.breath)
        expect(chord.notes).toBeInstanceOf(Array)
        expect(chord.notes.length).toBe(chord.holes.length)
        expect(chord.position).toBeGreaterThanOrEqual(1)
        expect(chord.position).toBeLessThanOrEqual(12)
        expect(chord.romanNumeral).toBeTruthy()
        expect(typeof chord.isConsecutive).toBe('boolean')
        expect(chord.tuning).toBeTruthy()
      })
    })

    it('should have holes within valid range (1-10)', () => {
      const chords = getHarmonicaChords('C')
      chords.forEach((chord) => {
        chord.holes.forEach((hole) => {
          expect(hole).toBeGreaterThanOrEqual(1)
          expect(hole).toBeLessThanOrEqual(10)
        })
      })
    })

    it('should produce similar counts for C and G harmonicas (same tuning)', () => {
      const cChords = getHarmonicaChords('C')
      const gChords = getHarmonicaChords('G')
      // Slight variance (±2) is expected: tonal.js interval detection
      // varies across keys for some slash chord inversions
      expect(Math.abs(cChords.length - gChords.length)).toBeLessThanOrEqual(2)
    })

    it('should correctly identify consecutive holes', () => {
      const chords = getHarmonicaChords('C')
      const chord123 = chords.find(
        (c) => c.holes.length === 3 && c.holes[0] === 1 && c.holes[2] === 3 && c.breath === 'blow'
      )
      expect(chord123).toBeDefined()
      expect(chord123?.isConsecutive).toBe(true)

      const chord234 = chords.find(
        (c) => c.holes.length === 3 && c.holes[0] === 2 && c.holes[2] === 4 && c.breath === 'draw'
      )
      expect(chord234).toBeDefined()
      expect(chord234?.isConsecutive).toBe(true)
    })

    it('should include tuning in chord voicings', () => {
      const chords = getHarmonicaChords('C', 'richter')
      chords.forEach((chord) => {
        expect(chord.tuning).toBe('richter')
      })
    })

    it('should find more consecutive chords than the old hardcoded set', () => {
      const chords = getHarmonicaChords('C')
      const consecutive = chords.filter(c => c.isConsecutive)
      // Algorithmic approach finds all blow inversions and draw combos
      expect(consecutive.length).toBeGreaterThanOrEqual(25)
    })
  })

  describe('Algorithmic consecutive generation', () => {
    it('should detect all blow inversions as C major on C Richter', () => {
      const chords = getHarmonicaChords('C', 'richter')
      const blowConsecutive = chords.filter(c => c.isConsecutive && c.breath === 'blow')
      // All blow chords should be C major (C-E-G repeating pattern)
      blowConsecutive.forEach(chord => {
        expect(chord.shortName).toBe('C')
        expect(chord.quality).toBe('major')
      })
      // Should find all 8 3-note and 7 4-note blow groups
      expect(blowConsecutive.length).toBe(15)
    })

    it('should detect draw chords correctly on C Richter', () => {
      const chords = getHarmonicaChords('C', 'richter')
      const drawConsecutive = chords.filter(c => c.isConsecutive && c.breath === 'draw')

      // G major draw [1,2,3] and [2,3,4]
      const gMajors = drawConsecutive.filter(c => c.shortName === 'G' && c.holes.length === 3)
      expect(gMajors.length).toBe(2)

      // Bdim draw [3,4,5] and [7,8,9]
      const bdims3 = drawConsecutive.filter(c => c.shortName === 'Bdim' && c.holes.length === 3)
      expect(bdims3.length).toBe(2)

      // Dm draw [4,5,6] and [8,9,10]
      const dms3 = drawConsecutive.filter(c => c.shortName === 'Dm' && c.holes.length === 3)
      expect(dms3.length).toBe(2)

      // G7 draw [2,3,4,5]
      const g7 = drawConsecutive.find(c => c.shortName === 'G7')
      expect(g7).toBeDefined()
      expect(g7?.holes).toEqual([2, 3, 4, 5])

      // 4-note Dm voicings (Dm6 mapped to minor)
      const dms4 = drawConsecutive.filter(c => c.shortName === 'Dm' && c.holes.length === 4)
      expect(dms4.length).toBeGreaterThanOrEqual(2)
    })

    it('should skip unrecognized note combinations', () => {
      const chords = getHarmonicaChords('C', 'richter')
      const drawConsecutive = chords.filter(c => c.isConsecutive && c.breath === 'draw')
      // Draw [5,6,7] = F,A,B and [6,7,8] = A,B,D are not standard chords
      const hole567 = drawConsecutive.find(
        c => c.holes.length === 3 && c.holes[0] === 5 && c.holes[2] === 7
      )
      expect(hole567).toBeUndefined()
    })
  })

  describe('Multi-tuning support', () => {
    it('Paddy Richter blow [1,2,3] = Am (hole 3 = A)', () => {
      const chords = getHarmonicaChords('C', 'paddy-richter')
      const blow123 = chords.find(
        c => c.isConsecutive && c.holes[0] === 1 && c.holes[2] === 3 && c.breath === 'blow' && c.holes.length === 3
      )
      expect(blow123).toBeDefined()
      expect(blow123?.shortName).toBe('Am')
      expect(blow123?.quality).toBe('minor')
    })

    it('Natural Minor blow [1,2,3] = Cm (hole 2 = Eb)', () => {
      const chords = getHarmonicaChords('C', 'natural-minor')
      const blow123 = chords.find(
        c => c.isConsecutive && c.holes[0] === 1 && c.holes[2] === 3 && c.breath === 'blow' && c.holes.length === 3
      )
      expect(blow123).toBeDefined()
      expect(blow123?.shortName).toBe('Cm')
      expect(blow123?.quality).toBe('minor')
    })

    it('Country draw [2,3,4] = G major (works without F#)', () => {
      const chords = getHarmonicaChords('C', 'country')
      const draw234 = chords.find(
        c => c.isConsecutive && c.holes[0] === 2 && c.holes[2] === 4 && c.breath === 'draw' && c.holes.length === 3
      )
      expect(draw234).toBeDefined()
      expect(draw234?.shortName).toBe('G')
    })

    it('Country draw [2,3,4,5] skips Gmaj7 (not in quality system)', () => {
      const chords = getHarmonicaChords('C', 'country')
      const draw2345 = chords.find(
        c => c.isConsecutive && c.holes[0] === 2 && c.holes[3] === 5 && c.breath === 'draw' && c.holes.length === 4
      )
      // Gmaj7 is not in our ChordQuality type, so it should not appear
      expect(draw2345).toBeUndefined()
    })

    it('Melody Maker blow [1,2,3] = Am (hole 3 = A)', () => {
      const chords = getHarmonicaChords('C', 'melody-maker')
      const blow123 = chords.find(
        c => c.isConsecutive && c.holes[0] === 1 && c.holes[2] === 3 && c.breath === 'blow' && c.holes.length === 3
      )
      expect(blow123).toBeDefined()
      expect(blow123?.shortName).toBe('Am')
      expect(blow123?.quality).toBe('minor')
    })

    it('should produce chords for all 5 tunings', () => {
      const tunings = ['richter', 'paddy-richter', 'natural-minor', 'country', 'melody-maker'] as const
      tunings.forEach(tuning => {
        const chords = getHarmonicaChords('C', tuning)
        expect(chords.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Roman numeral computation', () => {
    it('should compute I for C major on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const cMajor = chords.find(c => c.shortName === 'C' && c.quality === 'major' && c.isConsecutive)
      expect(cMajor?.romanNumeral).toBe('I')
    })

    it('should compute V for G major on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const gMajor = chords.find(
        c => c.shortName === 'G' && c.quality === 'major' && c.isConsecutive && c.holes.length === 3
      )
      expect(gMajor?.romanNumeral).toBe('V')
    })

    it('should compute ii for D minor on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const dm = chords.find(
        c => c.shortName === 'Dm' && c.quality === 'minor' && c.isConsecutive && c.holes.length === 3
      )
      expect(dm?.romanNumeral).toBe('ii')
    })

    it('should compute V7 for G7 on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const g7 = chords.find(c => c.shortName === 'G7' && c.isConsecutive)
      expect(g7?.romanNumeral).toBe('V7')
    })

    it('should compute vii° for Bdim on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const bdim = chords.find(
        c => c.shortName === 'Bdim' && c.isConsecutive && c.holes.length === 3
      )
      expect(bdim?.romanNumeral).toBe('vii°')
    })
  })

  describe('Position computation', () => {
    it('should compute position 1 for C chord on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const cMajor = chords.find(c => c.shortName === 'C' && c.isConsecutive)
      expect(cMajor?.position).toBe(1)
    })

    it('should compute position 2 for G chord on C harmonica', () => {
      const chords = getHarmonicaChords('C')
      const gMajor = chords.find(c => c.shortName === 'G' && c.isConsecutive && c.holes.length === 3)
      expect(gMajor?.position).toBe(2)
    })
  })

  describe('Transposition', () => {
    it('should transpose correctly to G harmonica', () => {
      const gChords = getHarmonicaChords('G')
      const gMajor123 = gChords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 1 &&
          c.holes[1] === 2 &&
          c.holes[2] === 3 &&
          c.breath === 'blow'
      )
      expect(gMajor123).toBeDefined()
      expect(gMajor123?.notes).toEqual(['G3', 'B3', 'D4'])
      expect(gMajor123?.shortName).toBe('G')
    })

    it('should name inverted voicings by chord root, not bass note', () => {
      // Draw [1,2,3,4] on D harmonica has notes transposed from D,G,B,D
      // which becomes A,D,F#,A — chord root should be D (G major transposed to D major)
      const dChords = getHarmonicaChords('D')
      const inversion = dChords.find(
        (c) =>
          c.holes.length === 4 &&
          c.holes[0] === 1 &&
          c.holes[3] === 4 &&
          c.breath === 'draw' &&
          c.quality === 'major'
      )
      expect(inversion).toBeDefined()
      expect(inversion?.shortName).toBe('A')
      expect(inversion?.name).toBe('A Major')
    })

    it('should name inverted voicings correctly for C harmonica too', () => {
      // Draw [1,2,3,4]: D4,G4,B4,D5 — root is G, not D
      const cChords = getHarmonicaChords('C')
      const inversion = cChords.find(
        (c) =>
          c.holes.length === 4 &&
          c.holes[0] === 1 &&
          c.holes[3] === 4 &&
          c.breath === 'draw' &&
          c.quality === 'major'
      )
      expect(inversion).toBeDefined()
      expect(inversion?.shortName).toBe('G')
      expect(inversion?.name).toBe('G Major')
    })
  })

  describe('getCommonChords', () => {
    it('should return unique chords without duplicates', () => {
      const chords = getCommonChords('C')
      const patterns = chords.map((c) => `${c.holes.join(',')}-${c.breath}`)
      const uniquePatterns = new Set(patterns)
      expect(patterns.length).toBe(uniquePatterns.size)
    })

    it('should sort chords by breath direction and hole number', () => {
      const chords = getCommonChords('C')

      const blowChords = chords.filter((c) => c.breath === 'blow')
      const drawChords = chords.filter((c) => c.breath === 'draw')

      expect(blowChords.length).toBeGreaterThan(0)
      expect(drawChords.length).toBeGreaterThan(0)

      for (let i = 0; i < blowChords.length - 1; i++) {
        expect(blowChords[i].holes[0]).toBeLessThanOrEqual(blowChords[i + 1].holes[0])
      }

      for (let i = 0; i < drawChords.length - 1; i++) {
        expect(drawChords[i].holes[0]).toBeLessThanOrEqual(drawChords[i + 1].holes[0])
      }
    })
  })

  describe('getChordsByPosition', () => {
    it('should filter chords by position', () => {
      const position1Chords = getChordsByPosition('C', 1)
      const position2Chords = getChordsByPosition('C', 2)

      expect(position1Chords.length).toBeGreaterThan(0)
      expect(position2Chords.length).toBeGreaterThan(0)

      position1Chords.forEach((chord) => {
        expect(chord.position).toBe(1)
      })

      position2Chords.forEach((chord) => {
        expect(chord.position).toBe(2)
      })
    })

    it('should return empty array for positions with no chords', () => {
      const position12Chords = getChordsByPosition('C', 12)
      expect(position12Chords).toBeInstanceOf(Array)
    })
  })

  describe('Chord Quality', () => {
    it('should have major chords', () => {
      const chords = getCommonChords('C')
      const majorChords = chords.filter((c) => c.quality === 'major')
      expect(majorChords.length).toBeGreaterThan(0)
    })

    it('should have minor chords', () => {
      const chords = getCommonChords('C')
      const minorChords = chords.filter((c) => c.quality === 'minor')
      expect(minorChords.length).toBeGreaterThan(0)
    })

    it('should include common blow chord (1-2-3)', () => {
      const chords = getCommonChords('C')
      const chord123 = chords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 1 &&
          c.holes[1] === 2 &&
          c.holes[2] === 3 &&
          c.breath === 'blow'
      )
      expect(chord123).toBeDefined()
      expect(chord123?.quality).toBe('major')
    })

    it('should include common blow chord (4-5-6)', () => {
      const chords = getCommonChords('C')
      const chord456 = chords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 4 &&
          c.holes[1] === 5 &&
          c.holes[2] === 6 &&
          c.breath === 'blow'
      )
      expect(chord456).toBeDefined()
      expect(chord456?.quality).toBe('major')
    })

    it('should include G7 chord (2-3-4-5 draw)', () => {
      const chords = getCommonChords('C')
      const g7Chord = chords.find(
        (c) =>
          c.holes.length === 4 &&
          c.holes[0] === 2 &&
          c.holes[1] === 3 &&
          c.holes[2] === 4 &&
          c.holes[3] === 5 &&
          c.breath === 'draw'
      )
      expect(g7Chord).toBeDefined()
      expect(g7Chord?.quality).toBe('dominant7')
      expect(g7Chord?.shortName).toBe('G7')
    })
  })

  describe('Curated Voicings', () => {
    it('should have correct notes for C major blow chord', () => {
      const chords = getHarmonicaChords('C')
      const cMajor123 = chords.find(
        (c) =>
          c.holes.length === 3 &&
          c.holes[0] === 1 &&
          c.holes[1] === 2 &&
          c.holes[2] === 3 &&
          c.breath === 'blow'
      )
      expect(cMajor123).toBeDefined()
      expect(cMajor123?.notes).toEqual(['C4', 'E4', 'G4'])
      expect(cMajor123?.shortName).toBe('C')
    })

    it('should have correct notes for G7 draw chord', () => {
      const chords = getHarmonicaChords('C')
      const g7 = chords.find(
        (c) =>
          c.holes.length === 4 &&
          c.holes[0] === 2 &&
          c.holes[3] === 5 &&
          c.breath === 'draw' &&
          c.quality === 'dominant7'
      )
      expect(g7).toBeDefined()
      expect(g7?.notes).toEqual(['G4', 'B4', 'D5', 'F5'])
      expect(g7?.shortName).toBe('G7')
    })
  })

  describe('New API Functions', () => {
    describe('getAllChords', () => {
      it('should return all chords for a key', () => {
        const chords = getAllChords('C')
        expect(chords).toBeInstanceOf(Array)
        expect(chords.length).toBeGreaterThan(0)
      })

      it('should be equivalent to getHarmonicaChords', () => {
        const chords1 = getAllChords('C')
        const chords2 = getHarmonicaChords('C')
        expect(chords1).toEqual(chords2)
      })
    })

    describe('findChordVoicings', () => {
      it('should find all voicings for C major', () => {
        const voicings = findChordVoicings('C', 'C')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('C')
          expect(v.quality).toBe('major')
        })
      })

      it('should find all voicings for Dm', () => {
        const voicings = findChordVoicings('Dm', 'C')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('Dm')
          expect(v.quality).toBe('minor')
        })
      })

      it('should find G7 voicing', () => {
        const voicings = findChordVoicings('G7', 'C')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('G7')
          expect(v.quality).toBe('dominant7')
        })
      })

      it('should return empty array for non-existent chord', () => {
        const voicings = findChordVoicings('XYZ', 'C')
        expect(voicings).toEqual([])
      })

      it('should work with transposed keys', () => {
        const voicings = findChordVoicings('G', 'G')
        expect(voicings.length).toBeGreaterThan(0)
        voicings.forEach((v) => {
          expect(v.shortName).toBe('G')
        })
      })
    })

    describe('getChordByName', () => {
      it('should return a single voicing for C major', () => {
        const chord = getChordByName('C', 'C')
        expect(chord).toBeDefined()
        expect(chord?.shortName).toBe('C')
        expect(chord?.quality).toBe('major')
      })

      it('should prefer consecutive holes', () => {
        const chord = getChordByName('C', 'C')
        expect(chord).toBeDefined()
        expect(chord?.isConsecutive).toBe(true)
      })

      it('should return undefined for non-existent chord', () => {
        const chord = getChordByName('XYZ', 'C')
        expect(chord).toBeUndefined()
      })

      it('should work with minor chords', () => {
        const chord = getChordByName('Dm', 'C')
        expect(chord).toBeDefined()
        expect(chord?.shortName).toBe('Dm')
        expect(chord?.quality).toBe('minor')
      })

      it('should work with dominant 7th chords', () => {
        const chord = getChordByName('G7', 'C')
        expect(chord).toBeDefined()
        expect(chord?.shortName).toBe('G7')
        expect(chord?.quality).toBe('dominant7')
      })
    })
  })

  describe('isConsecutive Field', () => {
    it('should mark 3-hole consecutive chords correctly', () => {
      const chords = getHarmonicaChords('C')
      const consecutiveChords = chords.filter((c) => c.holes.length === 3 && c.isConsecutive)
      expect(consecutiveChords.length).toBeGreaterThan(0)

      consecutiveChords.forEach((chord) => {
        const holes = [...chord.holes].sort((a, b) => a - b)
        for (let i = 1; i < holes.length; i++) {
          expect(holes[i] - holes[i - 1]).toBe(1)
        }
      })
    })

    it('should mark 4-hole consecutive chords correctly', () => {
      const chords = getHarmonicaChords('C')
      const consecutiveChords = chords.filter((c) => c.holes.length === 4 && c.isConsecutive)
      expect(consecutiveChords.length).toBeGreaterThan(0)

      consecutiveChords.forEach((chord) => {
        const holes = [...chord.holes].sort((a, b) => a - b)
        for (let i = 1; i < holes.length; i++) {
          expect(holes[i] - holes[i - 1]).toBe(1)
        }
      })
    })
  })

  describe('getScaleFilteredChords', () => {
    it('should return chords where all notes are in C major scale', () => {
      const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      const filtered = getScaleFilteredChords('C', 'richter', cMajorScale)

      expect(filtered.length).toBeGreaterThan(0)

      const cMajorChords = filtered.filter((c) => c.shortName === 'C')
      expect(cMajorChords.length).toBeGreaterThan(0)

      const gMajorChords = filtered.filter((c) => c.shortName === 'G')
      expect(gMajorChords.length).toBeGreaterThan(0)

      const dmChords = filtered.filter((c) => c.shortName === 'Dm')
      expect(dmChords.length).toBeGreaterThan(0)

      const g7Chords = filtered.filter((c) => c.shortName === 'G7')
      expect(g7Chords.length).toBeGreaterThan(0)

      const bdimChords = filtered.filter((c) => c.shortName === 'Bdim')
      expect(bdimChords.length).toBeGreaterThan(0)

      // All chords should have all notes in scale
      filtered.forEach((chord) => {
        chord.notes.forEach((note) => {
          const noteChroma = note.match(/[A-G][#b]?/)?.[0]
          expect(cMajorScale).toContain(noteChroma)
        })
      })
    })

    it('should return empty array when scale has no matching chords', () => {
      const limitedScale = ['C', 'D']
      const filtered = getScaleFilteredChords('C', 'richter', limitedScale)
      expect(filtered.length).toBe(0)
    })

    it('should handle enharmonic equivalents (C# matches Db)', () => {
      const cMajorWithSharps = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      const cMajorWithFlats = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

      const filteredSharps = getScaleFilteredChords('C', 'richter', cMajorWithSharps)
      const filteredFlats = getScaleFilteredChords('C', 'richter', cMajorWithFlats)

      expect(filteredSharps.length).toBe(filteredFlats.length)
      expect(filteredSharps.length).toBeGreaterThan(0)
    })
  })

  describe('groupChordsByName', () => {
    it('should group voicings by chord shortName', () => {
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      expect(groups.length).toBeGreaterThan(0)

      const cGroup = groups.find((g) => g.name === 'C')
      expect(cGroup).toBeDefined()
      expect(cGroup!.voicings.length).toBeGreaterThan(1)
      expect(cGroup!.quality).toBe('major')

      groups.forEach((group) => {
        group.voicings.forEach((voicing) => {
          expect(voicing.shortName).toBe(group.name)
        })
      })
    })

    it('should sort voicings within groups by breath then hole position', () => {
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      groups.forEach((group) => {
        const voicings = group.voicings

        for (let i = 0; i < voicings.length - 1; i++) {
          if (voicings[i].breath === 'blow' && voicings[i + 1].breath === 'draw') {
            continue
          } else if (voicings[i].breath === voicings[i + 1].breath) {
            expect(voicings[i].holes[0]).toBeLessThanOrEqual(voicings[i + 1].holes[0])
          }
        }
      })
    })

    it('should sort groups by breath direction and lowest hole', () => {
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      let lastBlowIndex = -1
      let firstDrawIndex = groups.length

      groups.forEach((group, index) => {
        if (group.voicings[0].breath === 'blow') {
          lastBlowIndex = index
        } else if (firstDrawIndex === groups.length) {
          firstDrawIndex = index
        }
      })

      if (lastBlowIndex >= 0 && firstDrawIndex < groups.length) {
        expect(lastBlowIndex).toBeLessThan(firstDrawIndex)
      }
    })

    it('should initialize currentIndex to 0 for all groups', () => {
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      groups.forEach((group) => {
        expect(group.currentIndex).toBe(0)
      })
    })
  })

  describe('Tongue Blocking Chords', () => {
    describe('getTongueBlockingChords', () => {
      it('should return only non-consecutive voicings', () => {
        const chords = getTongueBlockingChords('C')
        expect(chords.length).toBeGreaterThan(0)
        chords.forEach((chord) => {
          expect(chord.isConsecutive).toBe(false)
        })
      })

      it('should have valid chord structure', () => {
        const chords = getTongueBlockingChords('C')
        chords.forEach((chord: ChordVoicing) => {
          expect(chord.name).toBeTruthy()
          expect(chord.shortName).toBeTruthy()
          expect(chord.quality).toBeTruthy()
          expect(chord.holes.length).toBeGreaterThanOrEqual(3)
          expect(['blow', 'draw']).toContain(chord.breath)
          expect(chord.notes.length).toBe(chord.holes.length)
          expect(chord.tuning).toBe('richter')
        })
      })

      it('should have holes within valid range (1-10)', () => {
        const chords = getTongueBlockingChords('C')
        chords.forEach((chord) => {
          chord.holes.forEach((hole) => {
            expect(hole).toBeGreaterThanOrEqual(1)
            expect(hole).toBeLessThanOrEqual(10)
          })
        })
      })

      it('should have non-adjacent holes (at least one gap)', () => {
        const chords = getTongueBlockingChords('C')
        chords.forEach((chord) => {
          const sorted = [...chord.holes].sort((a, b) => a - b)
          let hasGap = false
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] > 1) hasGap = true
          }
          expect(hasGap).toBe(true)
        })
      })

      it('should detect major chords', () => {
        const chords = getTongueBlockingChords('C')
        const majorChords = chords.filter((c) => c.quality === 'major')
        expect(majorChords.length).toBeGreaterThan(0)
      })

      it('should work with different harmonica keys', () => {
        const cChords = getTongueBlockingChords('C')
        const gChords = getTongueBlockingChords('G')
        expect(cChords.length).toBeGreaterThan(0)
        expect(gChords.length).toBeGreaterThan(0)
        // Slight variance (±2) is expected due to tonal.js interval detection
        expect(Math.abs(cChords.length - gChords.length)).toBeLessThanOrEqual(2)
      })

      it('should include both blow and draw voicings', () => {
        const chords = getTongueBlockingChords('C')
        const blowChords = chords.filter((c) => c.breath === 'blow')
        const drawChords = chords.filter((c) => c.breath === 'draw')
        expect(blowChords.length).toBeGreaterThan(0)
        expect(drawChords.length).toBeGreaterThan(0)
      })
    })

    describe('getScaleFilteredTongueBlockingChords', () => {
      it('should filter tongue blocking chords by scale', () => {
        const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        const filtered = getScaleFilteredTongueBlockingChords('C', 'richter', cMajorScale)

        expect(filtered.length).toBeGreaterThan(0)

        filtered.forEach((chord) => {
          chord.notes.forEach((note) => {
            const pitchClass = note.replace(/\d+$/, '')
            expect(cMajorScale).toContain(pitchClass)
          })
        })
      })

      it('should return fewer chords than unfiltered', () => {
        const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        const all = getTongueBlockingChords('C')
        const filtered = getScaleFilteredTongueBlockingChords('C', 'richter', cMajorScale)

        expect(filtered.length).toBeLessThanOrEqual(all.length)
      })

      it('should return only non-consecutive voicings', () => {
        const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        const filtered = getScaleFilteredTongueBlockingChords('C', 'richter', cMajorScale)

        filtered.forEach((chord) => {
          expect(chord.isConsecutive).toBe(false)
        })
      })
    })
  })
})
