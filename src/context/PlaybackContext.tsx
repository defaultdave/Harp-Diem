/**
 * Context for managing audio playback state and note highlighting.
 * @packageDocumentation
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Note } from 'tonal'

export interface PlayingChordInfo {
  notes: string[]
  breath: 'blow' | 'draw'
}

interface PlaybackContextValue {
  currentlyPlayingNote: string | null
  currentlyPlayingNotes: string[]
  currentlyPlayingChord: PlayingChordInfo | null
  isPlaying: boolean
  setCurrentlyPlayingNote: (note: string | null) => void
  setCurrentlyPlayingNotes: (notes: string[]) => void
  setCurrentlyPlayingChord: (chord: PlayingChordInfo | null) => void
  setIsPlaying: (playing: boolean) => void
  isNoteCurrentlyPlaying: (note: string, isBlow?: boolean) => boolean
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null)

interface PlaybackProviderProps {
  children: ReactNode
}

/** Provider for audio playback state and note highlighting. */
export function PlaybackProvider({ children }: PlaybackProviderProps) {
  const [currentlyPlayingNote, setCurrentlyPlayingNote] = useState<string | null>(null)
  const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<string[]>([])
  const [currentlyPlayingChord, setCurrentlyPlayingChord] = useState<PlayingChordInfo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const isNoteCurrentlyPlaying = useCallback(
    (note: string, isBlow?: boolean): boolean => {
      const noteMidi = Note.midi(note)
      if (noteMidi === null) return false

      if (currentlyPlayingNote) {
        const playingMidi = Note.midi(currentlyPlayingNote)
        if (playingMidi !== null && playingMidi === noteMidi) return true
      }

      if (currentlyPlayingChord) {
        if (isBlow !== undefined) {
          const chordIsBlow = currentlyPlayingChord.breath === 'blow'
          if (isBlow !== chordIsBlow) return false
        }

        return currentlyPlayingChord.notes.some(playingNote => {
          const playingMidi = Note.midi(playingNote)
          return playingMidi !== null && playingMidi === noteMidi
        })
      }

      if (currentlyPlayingNotes.length > 0) {
        return currentlyPlayingNotes.some(playingNote => {
          const playingMidi = Note.midi(playingNote)
          return playingMidi !== null && playingMidi === noteMidi
        })
      }

      return false
    },
    [currentlyPlayingNote, currentlyPlayingNotes, currentlyPlayingChord]
  )

  return (
    <PlaybackContext.Provider
      value={{
        currentlyPlayingNote,
        currentlyPlayingNotes,
        currentlyPlayingChord,
        isPlaying,
        setCurrentlyPlayingNote,
        setCurrentlyPlayingNotes,
        setCurrentlyPlayingChord,
        setIsPlaying,
        isNoteCurrentlyPlaying,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  )
}

/** Hook to access playback state. Must be used within PlaybackProvider. */
export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext)
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider')
  }
  return context
}
