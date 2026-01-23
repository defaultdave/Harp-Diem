import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { PlaybackProvider, usePlayback } from './PlaybackContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <PlaybackProvider>{children}</PlaybackProvider>
)

describe('PlaybackContext', () => {
  describe('Initial State', () => {
    it('provides null as initial currentlyPlayingNote', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })
      expect(result.current.currentlyPlayingNote).toBeNull()
    })

    it('provides false as initial isPlaying', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })
      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('setCurrentlyPlayingNote', () => {
    it('updates currentlyPlayingNote state', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C4')
      })

      expect(result.current.currentlyPlayingNote).toBe('C4')
    })

    it('can be set back to null', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C4')
      })
      expect(result.current.currentlyPlayingNote).toBe('C4')

      act(() => {
        result.current.setCurrentlyPlayingNote(null)
      })
      expect(result.current.currentlyPlayingNote).toBeNull()
    })
  })

  describe('setIsPlaying', () => {
    it('updates isPlaying state to true', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setIsPlaying(true)
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('updates isPlaying state back to false', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setIsPlaying(true)
      })
      expect(result.current.isPlaying).toBe(true)

      act(() => {
        result.current.setIsPlaying(false)
      })
      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('isNoteCurrentlyPlaying', () => {
    it('returns false when no note is playing', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      expect(result.current.isNoteCurrentlyPlaying('C4')).toBe(false)
    })

    it('returns true when the exact note is playing', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C4')
      })

      expect(result.current.isNoteCurrentlyPlaying('C4')).toBe(true)
    })

    it('returns false for same note in different octave (exact octave match required)', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C4')
      })

      expect(result.current.isNoteCurrentlyPlaying('C5')).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('C3')).toBe(false)
    })

    it('handles enharmonic equivalents in same octave correctly', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C#4')
      })

      expect(result.current.isNoteCurrentlyPlaying('Db4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('Db5')).toBe(false)
    })

    it('returns false for different pitch classes', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C4')
      })

      expect(result.current.isNoteCurrentlyPlaying('D4')).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('B3')).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('C#4')).toBe(false)
    })

    it('handles all enharmonic pairs in same octave', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })
      const enharmonicPairs = [
        ['C#4', 'Db4'],
        ['D#4', 'Eb4'],
        ['F#4', 'Gb4'],
        ['G#4', 'Ab4'],
        ['A#4', 'Bb4'],
      ]

      enharmonicPairs.forEach(([sharp, flat]) => {
        act(() => {
          result.current.setCurrentlyPlayingNote(sharp)
        })
        expect(result.current.isNoteCurrentlyPlaying(flat)).toBe(true)

        act(() => {
          result.current.setCurrentlyPlayingNote(flat)
        })
        expect(result.current.isNoteCurrentlyPlaying(sharp)).toBe(true)
      })
    })
  })

  describe('setCurrentlyPlayingNotes (chord support)', () => {
    it('provides empty array as initial currentlyPlayingNotes', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })
      expect(result.current.currentlyPlayingNotes).toEqual([])
    })

    it('updates currentlyPlayingNotes state', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNotes(['C4', 'E4', 'G4'])
      })

      expect(result.current.currentlyPlayingNotes).toEqual(['C4', 'E4', 'G4'])
    })

    it('can be set back to empty array', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNotes(['C4', 'E4', 'G4'])
      })
      expect(result.current.currentlyPlayingNotes).toEqual(['C4', 'E4', 'G4'])

      act(() => {
        result.current.setCurrentlyPlayingNotes([])
      })
      expect(result.current.currentlyPlayingNotes).toEqual([])
    })
  })

  describe('isNoteCurrentlyPlaying with multiple notes', () => {
    it('returns true when note is in currentlyPlayingNotes array', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNotes(['C4', 'E4', 'G4'])
      })

      expect(result.current.isNoteCurrentlyPlaying('C4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('E4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('G4')).toBe(true)
    })

    it('returns false for notes not in the array', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNotes(['C4', 'E4', 'G4'])
      })

      expect(result.current.isNoteCurrentlyPlaying('D4')).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('C5')).toBe(false)
    })

    it('handles enharmonic equivalents in chord notes', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNotes(['C#4', 'F4', 'G#4'])
      })

      expect(result.current.isNoteCurrentlyPlaying('Db4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('Ab4')).toBe(true)
    })

    it('prioritizes single note check when both are set', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('D4')
        result.current.setCurrentlyPlayingNotes(['C4', 'E4', 'G4'])
      })

      // Both should work - D4 from single note, C4/E4/G4 from array
      expect(result.current.isNoteCurrentlyPlaying('D4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('C4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('E4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('G4')).toBe(true)
    })
  })

  describe('setCurrentlyPlayingChord (breath-aware chord support)', () => {
    it('provides null as initial currentlyPlayingChord', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })
      expect(result.current.currentlyPlayingChord).toBeNull()
    })

    it('updates currentlyPlayingChord state', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
      })

      expect(result.current.currentlyPlayingChord).toEqual({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
    })

    it('can be set back to null', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
      })
      expect(result.current.currentlyPlayingChord).not.toBeNull()

      act(() => {
        result.current.setCurrentlyPlayingChord(null)
      })
      expect(result.current.currentlyPlayingChord).toBeNull()
    })
  })

  describe('isNoteCurrentlyPlaying with breath-aware chord', () => {
    it('returns true for note in chord with matching breath direction', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
      })

      // Blow note should match blow chord
      expect(result.current.isNoteCurrentlyPlaying('C4', true)).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('E4', true)).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('G4', true)).toBe(true)
    })

    it('returns false for note in chord with mismatched breath direction', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
      })

      // Draw notes should NOT match blow chord, even if same pitch
      expect(result.current.isNoteCurrentlyPlaying('C4', false)).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('E4', false)).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('G4', false)).toBe(false)
    })

    it('returns false for notes not in chord regardless of breath', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
      })

      expect(result.current.isNoteCurrentlyPlaying('D4', true)).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('D4', false)).toBe(false)
    })

    it('works with draw chords', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['D4', 'G4', 'B4'], breath: 'draw' })
      })

      // Draw notes should match draw chord
      expect(result.current.isNoteCurrentlyPlaying('D4', false)).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('G4', false)).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('B4', false)).toBe(true)

      // Blow notes should NOT match draw chord
      expect(result.current.isNoteCurrentlyPlaying('D4', true)).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('G4', true)).toBe(false)
      expect(result.current.isNoteCurrentlyPlaying('B4', true)).toBe(false)
    })

    it('matches any note without breath parameter for backward compatibility', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
      })

      // Without breath param, should still match (for backward compatibility)
      expect(result.current.isNoteCurrentlyPlaying('C4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('E4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('G4')).toBe(true)
    })

    it('prioritizes chord over currentlyPlayingNotes when both are set', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingChord({ notes: ['C4', 'E4', 'G4'], breath: 'blow' })
        result.current.setCurrentlyPlayingNotes(['D4', 'F4', 'A4'])
      })

      // Chord notes should match with correct breath
      expect(result.current.isNoteCurrentlyPlaying('C4', true)).toBe(true)
      // But not with wrong breath
      expect(result.current.isNoteCurrentlyPlaying('C4', false)).toBe(false)
      // Notes only in currentlyPlayingNotes array should not match when chord is set
      expect(result.current.isNoteCurrentlyPlaying('D4', true)).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('throws error when usePlayback is used outside of PlaybackProvider', () => {
      expect(() => {
        renderHook(() => usePlayback())
      }).toThrow('usePlayback must be used within a PlaybackProvider')
    })
  })
})
