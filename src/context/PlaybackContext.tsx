/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Note } from 'tonal'

interface PlaybackContextValue {
  currentlyPlayingNote: string | null
  isPlaying: boolean
  setCurrentlyPlayingNote: (note: string | null) => void
  setIsPlaying: (playing: boolean) => void
  isNoteCurrentlyPlaying: (note: string) => boolean
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null)

interface PlaybackProviderProps {
  children: ReactNode
}

export function PlaybackProvider({ children }: PlaybackProviderProps) {
  const [currentlyPlayingNote, setCurrentlyPlayingNote] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const isNoteCurrentlyPlaying = useCallback(
    (note: string): boolean => {
      if (!currentlyPlayingNote) return false
      const playingChroma = Note.chroma(currentlyPlayingNote)
      const noteChroma = Note.chroma(note)
      return playingChroma !== undefined && playingChroma === noteChroma
    },
    [currentlyPlayingNote]
  )

  return (
    <PlaybackContext.Provider
      value={{
        currentlyPlayingNote,
        isPlaying,
        setCurrentlyPlayingNote,
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
