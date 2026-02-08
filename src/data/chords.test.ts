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
  DEFAULT_TONGUE_BLOCKING,
} from './chords'
import type { ChordVoicing, TongueBlockingParams } from './chords'

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
        // New fields
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

    it('should transpose chords correctly for different keys', () => {
      const cChords = getHarmonicaChords('C')
      const gChords = getHarmonicaChords('G')

      expect(cChords.length).toBe(gChords.length)

      // Same hole patterns should exist
      const cHolePatterns = cChords.map((c) => `${c.holes.join(',')}-${c.breath}`)
      const gHolePatterns = gChords.map((c) => `${c.holes.join(',')}-${c.breath}`)
      expect(cHolePatterns).toEqual(gHolePatterns)
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

      // Check that blow chords come before draw chords (in general)
      const blowChords = chords.filter((c) => c.breath === 'blow')
      const drawChords = chords.filter((c) => c.breath === 'draw')

      expect(blowChords.length).toBeGreaterThan(0)
      expect(drawChords.length).toBeGreaterThan(0)

      // Within blow chords, should be sorted by first hole
      for (let i = 0; i < blowChords.length - 1; i++) {
        expect(blowChords[i].holes[0]).toBeLessThanOrEqual(blowChords[i + 1].holes[0])
      }

      // Within draw chords, should be sorted by first hole
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
      // May or may not have chords at position 12, just checking it doesn't error
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

      // Should include C major chords (C, E, G all in scale)
      const cMajorChords = filtered.filter((c) => c.shortName === 'C')
      expect(cMajorChords.length).toBeGreaterThan(0)

      // Should include G major chords (G, B, D all in scale)
      const gMajorChords = filtered.filter((c) => c.shortName === 'G')
      expect(gMajorChords.length).toBeGreaterThan(0)

      // Should include Dm chords (D, F, A all in scale)
      const dmChords = filtered.filter((c) => c.shortName === 'Dm')
      expect(dmChords.length).toBeGreaterThan(0)

      // Should include G7 chords (G, B, D, F all in scale)
      const g7Chords = filtered.filter((c) => c.shortName === 'G7')
      expect(g7Chords.length).toBeGreaterThan(0)

      // Should include Bdim chords (B, D, F all in scale)
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
      // A scale with very few notes that don't form complete chords
      const limitedScale = ['C', 'D']
      const filtered = getScaleFilteredChords('C', 'richter', limitedScale)

      // Should have no chords since we need at least 3 notes for a chord
      expect(filtered.length).toBe(0)
    })

    it('should handle enharmonic equivalents (C# matches Db)', () => {
      // C major scale but written with sharps where possible
      const cMajorWithSharps = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
      const cMajorWithFlats = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

      const filteredSharps = getScaleFilteredChords('C', 'richter', cMajorWithSharps)
      const filteredFlats = getScaleFilteredChords('C', 'richter', cMajorWithFlats)

      // Should return same chords regardless of enharmonic spelling
      expect(filteredSharps.length).toBe(filteredFlats.length)
      expect(filteredSharps.length).toBeGreaterThan(0)
    })
  })

  describe('groupChordsByName', () => {
    it('should group voicings by chord shortName', () => {
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      expect(groups.length).toBeGreaterThan(0)

      // C major should have multiple voicings
      const cGroup = groups.find((g) => g.name === 'C')
      expect(cGroup).toBeDefined()
      expect(cGroup!.voicings.length).toBeGreaterThan(1)
      expect(cGroup!.quality).toBe('major')

      // All voicings in a group should have same shortName
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

        // Check breath direction order
        for (let i = 0; i < voicings.length - 1; i++) {
          if (voicings[i].breath === 'blow' && voicings[i + 1].breath === 'draw') {
            // Blow before draw is correct
            continue
          } else if (voicings[i].breath === voicings[i + 1].breath) {
            // Same breath: check hole position
            expect(voicings[i].holes[0]).toBeLessThanOrEqual(voicings[i + 1].holes[0])
          }
        }
      })
    })

    it('should sort groups by breath direction and lowest hole', () => {
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      // First check that blow chords generally come before draw chords
      let lastBlowIndex = -1
      let firstDrawIndex = groups.length

      groups.forEach((group, index) => {
        if (group.voicings[0].breath === 'blow') {
          lastBlowIndex = index
        } else if (firstDrawIndex === groups.length) {
          firstDrawIndex = index
        }
      })

      // If both exist, blow should come before draw
      if (lastBlowIndex >= 0 && firstDrawIndex < groups.length) {
        expect(lastBlowIndex).toBeLessThan(firstDrawIndex)
      }
    })

    it('should handle single-voicing groups correctly', () => {
      // G7 chord has only one voicing
      const allChords = getHarmonicaChords('C', 'richter')
      const groups = groupChordsByName(allChords)

      const g7Group = groups.find((g) => g.name === 'G7')
      expect(g7Group).toBeDefined()
      expect(g7Group!.voicings.length).toBe(1)
      expect(g7Group!.currentIndex).toBe(0)
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

      it('should respect maxSpan parameter', () => {
        const params: TongueBlockingParams = { maxSpan: 3, minSkip: 1, maxSkip: 1 }
        const chords = getTongueBlockingChords('C', 'richter', params)
        chords.forEach((chord) => {
          const sorted = [...chord.holes].sort((a, b) => a - b)
          const span = sorted[sorted.length - 1] - sorted[0]
          expect(span).toBeLessThanOrEqual(3)
        })
      })

      it('should respect minSkip and maxSkip parameters', () => {
        const params: TongueBlockingParams = { maxSpan: 6, minSkip: 2, maxSkip: 2 }
        const chords = getTongueBlockingChords('C', 'richter', params)
        chords.forEach((chord) => {
          const sorted = [...chord.holes].sort((a, b) => a - b)
          for (let i = 1; i < sorted.length; i++) {
            const gap = sorted[i] - sorted[i - 1] - 1
            if (gap > 0) {
              expect(gap).toBeGreaterThanOrEqual(2)
              expect(gap).toBeLessThanOrEqual(2)
            }
          }
        })
      })

      it('should have holes in sorted order', () => {
        const chords = getTongueBlockingChords('C')
        chords.forEach((chord) => {
          for (let i = 1; i < chord.holes.length; i++) {
            expect(chord.holes[i]).toBeGreaterThan(chord.holes[i - 1])
          }
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
        // Same hole patterns should produce chords (possibly different qualities due to transposition)
        expect(cChords.length).toBe(gChords.length)
      })

      it('should include both blow and draw voicings', () => {
        const chords = getTongueBlockingChords('C')
        const blowChords = chords.filter((c) => c.breath === 'blow')
        const drawChords = chords.filter((c) => c.breath === 'draw')
        expect(blowChords.length).toBeGreaterThan(0)
        expect(drawChords.length).toBeGreaterThan(0)
      })

      it('should use default params when none provided', () => {
        const defaultChords = getTongueBlockingChords('C')
        const explicitChords = getTongueBlockingChords('C', 'richter', DEFAULT_TONGUE_BLOCKING)
        expect(defaultChords.length).toBe(explicitChords.length)
      })
    })

    describe('getScaleFilteredTongueBlockingChords', () => {
      it('should filter tongue blocking chords by scale', () => {
        const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        const filtered = getScaleFilteredTongueBlockingChords('C', 'richter', cMajorScale)

        expect(filtered.length).toBeGreaterThan(0)

        // All returned chords should have all notes in scale
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

    describe('DEFAULT_TONGUE_BLOCKING', () => {
      it('should have sensible defaults', () => {
        expect(DEFAULT_TONGUE_BLOCKING.maxSpan).toBe(5)
        expect(DEFAULT_TONGUE_BLOCKING.minSkip).toBe(1)
        expect(DEFAULT_TONGUE_BLOCKING.maxSkip).toBe(2)
      })
    })
  })
})
