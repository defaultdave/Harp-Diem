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

    it('returns true for same note in different octave (chroma match)', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C4')
      })

      expect(result.current.isNoteCurrentlyPlaying('C5')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('C3')).toBe(true)
    })

    it('handles enharmonic equivalents correctly', () => {
      const { result } = renderHook(() => usePlayback(), { wrapper })

      act(() => {
        result.current.setCurrentlyPlayingNote('C#4')
      })

      expect(result.current.isNoteCurrentlyPlaying('Db4')).toBe(true)
      expect(result.current.isNoteCurrentlyPlaying('Db5')).toBe(true)
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

    it('handles all enharmonic pairs', () => {
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

  describe('Error Handling', () => {
    it('throws error when usePlayback is used outside of PlaybackProvider', () => {
      expect(() => {
        renderHook(() => usePlayback())
      }).toThrow('usePlayback must be used within a PlaybackProvider')
    })
  })
})
