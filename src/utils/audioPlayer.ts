/**
 * Audio player utility for playing musical notes with piano-like sound using Web Audio API
 */

import { Note } from 'tonal'
import type { ChordInProgression } from '../data/progressions'

/** Delay between arpeggiated notes in milliseconds for a natural strummed sound */
const ARPEGGIATE_DELAY_MS = 30

/** Gap between chords in seconds during progression playback */
const CHORD_GAP_SECONDS = 0.3

/** Default duration for chord playback in seconds */
const DEFAULT_CHORD_DURATION = 1.2

let audioContext: AudioContext | null = null

/**
 * Get or create the AudioContext
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a tone at the specified frequency using piano-like synthesis
 * @param frequency - The frequency in Hz to play
 * @param duration - Duration of the tone in seconds (default: 0.5)
 */
export async function playTone(frequency: number, duration: number = 0.5): Promise<void> {
  try {
    const context = getAudioContext()
    
    // Resume audio context if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      await context.resume()
    }

    const currentTime = context.currentTime
    
    // Create oscillators for a richer piano-like sound (using additive synthesis)
    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []
    
    // Fundamental frequency and harmonics with decreasing amplitudes (piano-like harmonic structure)
    const harmonics = [
      { freq: frequency, gain: 0.4 },           // Fundamental
      { freq: frequency * 2, gain: 0.3 },       // 2nd harmonic
      { freq: frequency * 3, gain: 0.15 },      // 3rd harmonic
      { freq: frequency * 4, gain: 0.08 },      // 4th harmonic
      { freq: frequency * 5, gain: 0.04 },      // 5th harmonic
    ]
    
    // Create master gain for overall volume control
    const masterGain = context.createGain()
    masterGain.connect(context.destination)
    
    // Piano-like envelope (fast attack, quick decay, medium sustain, medium release)
    masterGain.gain.setValueAtTime(0, currentTime)
    masterGain.gain.linearRampToValueAtTime(0.3, currentTime + 0.002) // Very fast attack
    masterGain.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.1) // Quick decay
    masterGain.gain.linearRampToValueAtTime(0.05, currentTime + duration - 0.1) // Sustain
    masterGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration) // Release
    
    // Track completed oscillators for cleanup
    let completedCount = 0
    const totalOscillators = harmonics.length

    // Create harmonics
    harmonics.forEach(({ freq, gain }) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = freq
      gainNode.gain.value = gain

      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      // Cleanup when oscillator finishes
      oscillator.onended = () => {
        oscillator.disconnect()
        gainNode.disconnect()
        completedCount++
        // Disconnect master gain when all oscillators are done
        if (completedCount === totalOscillators) {
          masterGain.disconnect()
        }
      }

      oscillator.start(currentTime)
      oscillator.stop(currentTime + duration)

      oscillators.push(oscillator)
      gainNodes.push(gainNode)
    })
  } catch (error) {
    console.error('Failed to play tone:', error)
  }
}

interface ChordProgressionOptions {
  chordDuration?: number
  arpeggiate?: boolean
}

/**
 * Play a chord progression with optional arpeggio effect
 * @param progression - Array of chords to play
 * @param options - Playback options (chordDuration, arpeggiate)
 * @param signal - Optional AbortSignal for cancellation
 */
export async function playChordProgression(
  progression: ChordInProgression[],
  options?: ChordProgressionOptions,
  signal?: AbortSignal
): Promise<void> {
  const { chordDuration = 1.5, arpeggiate = true } = options ?? {}

  for (const chord of progression) {
    if (signal?.aborted) break

    // Get frequencies for all notes in the chord
    const frequencies = chord.notes
      .map(note => Note.freq(note))
      .filter((freq): freq is number => freq !== null && freq > 0)

    if (frequencies.length === 0) continue

    if (arpeggiate) {
      // Stagger note attacks for a more natural strummed sound
      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          if (!signal?.aborted) {
            playTone(freq, chordDuration)
          }
        }, i * ARPEGGIATE_DELAY_MS)
      })
    } else {
      // Play all notes simultaneously
      frequencies.forEach(freq => playTone(freq, chordDuration))
    }

    // Wait for chord duration plus a small gap before next chord
    const waitTime = (chordDuration + CHORD_GAP_SECONDS) * 1000
    await new Promise(resolve => setTimeout(resolve, waitTime))

    if (signal?.aborted) break
  }
}

export interface PlayChordOptions {
  duration?: number
  arpeggiate?: boolean
  onStart?: () => void
  onEnd?: () => void
}

/**
 * Play a single chord with optional arpeggio effect
 * @param notes - Array of notes with octaves (e.g., ['C4', 'E4', 'G4'])
 * @param options - Playback options
 */
export async function playChord(notes: string[], options?: PlayChordOptions): Promise<void> {
  const { duration = DEFAULT_CHORD_DURATION, arpeggiate = true, onStart, onEnd } = options ?? {}

  // Get frequencies for all notes in the chord
  const frequencies = notes
    .map(note => Note.freq(note))
    .filter((freq): freq is number => freq !== null && freq > 0)

  if (frequencies.length === 0) return

  onStart?.()

  if (arpeggiate) {
    // Stagger note attacks for a more natural strummed sound
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, duration)
      }, i * ARPEGGIATE_DELAY_MS)
    })
  } else {
    // Play all notes simultaneously
    frequencies.forEach(freq => playTone(freq, duration))
  }

  // Wait for chord to finish, then call onEnd
  const totalDuration = arpeggiate
    ? duration * 1000 + (frequencies.length - 1) * ARPEGGIATE_DELAY_MS
    : duration * 1000

  await new Promise(resolve => setTimeout(resolve, totalDuration))
  onEnd?.()
}
