/**
 * @packageDocumentation
 * Context for managing audio playback state and note highlighting.
 *
 * @remarks
 * This context tracks which notes are currently being played and provides
 * methods to check if specific notes should be highlighted in the UI.
 *
 * @category Context
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Note } from 'tonal'

/**
 * Information about a chord currently being played.
 *
 * @remarks
 * Used to highlight the correct notes on the harmonica visualization
 * when a chord is played, including the breath direction to distinguish
 * between blow and draw notes of the same pitch.
 */
export interface PlayingChordInfo {
  /** Notes in the chord with octaves (e.g., ["C4", "E4", "G4"]) */
  notes: string[]
  /** Breath direction for proper highlighting */
  breath: 'blow' | 'draw'
}

/**
 * Context value for playback state management.
 */
interface PlaybackContextValue {
  /** Single note currently playing (scale playback) */
  currentlyPlayingNote: string | null
  /** Multiple notes currently playing (legacy chord support) */
  currentlyPlayingNotes: string[]
  /** Chord currently playing with breath info */
  currentlyPlayingChord: PlayingChordInfo | null
  /** Whether any playback is active */
  isPlaying: boolean
  /** Set the currently playing single note */
  setCurrentlyPlayingNote: (note: string | null) => void
  /** Set multiple currently playing notes */
  setCurrentlyPlayingNotes: (notes: string[]) => void
  /** Set the currently playing chord */
  setCurrentlyPlayingChord: (chord: PlayingChordInfo | null) => void
  /** Set overall playing state */
  setIsPlaying: (playing: boolean) => void
  /** Check if a specific note should be highlighted */
  isNoteCurrentlyPlaying: (note: string, isBlow?: boolean) => boolean
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null)

interface PlaybackProviderProps {
  children: ReactNode
}

/**
 * Provider component for playback state context.
 *
 * @remarks
 * Manages the state of audio playback and provides functions to check
 * if notes should be highlighted. The `isNoteCurrentlyPlaying` function
 * uses MIDI number comparison for enharmonic equivalence.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <PlaybackProvider>
 *       <HarmonicaView />
 *       <ScalePlaybackControls />
 *     </PlaybackProvider>
 *   )
 * }
 * ```
 */
export function PlaybackProvider({ children }: PlaybackProviderProps) {
  const [currentlyPlayingNote, setCurrentlyPlayingNote] = useState<string | null>(null)
  const [currentlyPlayingNotes, setCurrentlyPlayingNotes] = useState<string[]>([])
  const [currentlyPlayingChord, setCurrentlyPlayingChord] = useState<PlayingChordInfo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const isNoteCurrentlyPlaying = useCallback(
    (note: string, isBlow?: boolean): boolean => {
      const noteMidi = Note.midi(note)
      if (noteMidi === null) return false

      // Check single note (for scale playback)
      if (currentlyPlayingNote) {
        const playingMidi = Note.midi(currentlyPlayingNote)
        if (playingMidi !== null && playingMidi === noteMidi) return true
      }

      // Check chord playback with breath direction filtering
      if (currentlyPlayingChord) {
        // If breath direction is provided, only match if it matches the chord's breath
        if (isBlow !== undefined) {
          const chordIsBlow = currentlyPlayingChord.breath === 'blow'
          if (isBlow !== chordIsBlow) return false
        }

        return currentlyPlayingChord.notes.some(playingNote => {
          const playingMidi = Note.midi(playingNote)
          return playingMidi !== null && playingMidi === noteMidi
        })
      }

      // Check multiple notes without breath info (legacy support)
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

/**
 * Hook to access playback state context.
 *
 * @remarks
 * Must be used within a {@link PlaybackProvider}.
 *
 * @returns The playback context value
 * @throws Error if used outside of PlaybackProvider
 *
 * @example
 * ```tsx
 * function NoteCell({ note, isBlow }: Props) {
 *   const { isNoteCurrentlyPlaying } = usePlayback()
 *   const isPlaying = isNoteCurrentlyPlaying(note, isBlow)
 *
 *   return (
 *     <div className={isPlaying ? 'playing' : ''}>
 *       {note}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext)
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider')
  }
  return context
}
