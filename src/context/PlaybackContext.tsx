/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Note } from 'tonal'

interface PlaybackContextValue {
  currentlyPlayingNote: string | null
  currentlyPlayingNotes: string[]
  isPlaying: boolean
  setCurrentlyPlayingNote: (note: string | null) => void
  setCurrentlyPlayingNotes: (notes: string[]) => void
  setIsPlaying: (playing: boolean) => void
  isNoteCurrentlyPlaying: (note: string) => boolean
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null)

interface PlaybackProviderProps {
  children: ReactNode
}

export function PlaybackProvider({ children }: PlaybackProviderProps) {
  const [currentlyPlayingNote, setCurrentlyPlayingNote] = useState<string | null>(null)
  const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const isNoteCurrentlyPlaying = useCallback(
    (note: string): boolean => {
      const noteMidi = Note.midi(note)
      if (noteMidi === null) return false

      // Check single note (for scale playback)
      if (currentlyPlayingNote) {
        const playingMidi = Note.midi(currentlyPlayingNote)
        if (playingMidi !== null && playingMidi === noteMidi) return true
      }

      // Check multiple notes (for chord playback)
      if (currentlyPlayingNotes.length > 0) {
        return currentlyPlayingNotes.some(playingNote => {
          const playingMidi = Note.midi(playingNote)
          return playingMidi !== null && playingMidi === noteMidi
        })
      }

      return false
    },
    [currentlyPlayingNote, currentlyPlayingNotes]
  )

  return (
    <PlaybackContext.Provider
      value={{
        currentlyPlayingNote,
        currentlyPlayingNotes,
        isPlaying,
        setCurrentlyPlayingNote,
        setCurrentlyPlayingNotes,
        setIsPlaying,
        isNoteCurrentlyPlaying,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  )
}

export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext)
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider')
  }
  return context
}
