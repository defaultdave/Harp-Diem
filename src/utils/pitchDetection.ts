/**
 * Pitch detection utility using autocorrelation algorithm.
 * @packageDocumentation
 */

import { Note } from 'tonal'

/** Result of pitch detection including frequency, note name, cents offset, and confidence score */
export interface PitchResult {
  /** Detected frequency in Hz */
  frequency: number
  /** Note name (e.g., 'A4', 'C#5') */
  note: string
  /** Cents offset from the nearest note (-50 to +50, where 100 cents = 1 semitone) */
  cents: number
  /** Confidence score between 0 and 1 (higher is more confident) */
  confidence: number
}

/** Minimum confidence threshold for considering a detection valid */
const MIN_CONFIDENCE = 0.9

/** Minimum frequency to detect (roughly C1) */
const MIN_FREQUENCY = 32

/** Maximum frequency to detect (roughly C8) */
const MAX_FREQUENCY = 4200

/**
 * Autocorrelation-based pitch detection algorithm.
 * Finds the fundamental frequency by detecting periodicity in the time-domain signal.
 *
 * @param dataArray - Float32Array of time-domain audio samples from AnalyserNode
 * @param sampleRate - Sample rate of the audio context (e.g., 44100 Hz)
 * @returns PitchResult with detected frequency and note, or null if no clear pitch detected
 */
export function detectPitch(dataArray: Float32Array, sampleRate: number): PitchResult | null {
  // Calculate autocorrelation for different lags
  const bufferSize = dataArray.length
  const correlations = new Float32Array(bufferSize)

  // Compute RMS to detect silence
  let rms = 0
  for (let i = 0; i < bufferSize; i++) {
    const val = dataArray[i]
    rms += val * val
  }
  rms = Math.sqrt(rms / bufferSize)

  // Silence threshold - if too quiet, don't detect pitch
  if (rms < 0.01) {
    return null
  }

  // Compute autocorrelation
  for (let lag = 0; lag < bufferSize; lag++) {
    let sum = 0
    for (let i = 0; i < bufferSize - lag; i++) {
      sum += dataArray[i] * dataArray[i + lag]
    }
    correlations[lag] = sum
  }

  // Find the first peak after lag 0
  // Skip initial samples to avoid detecting too high frequencies
  const minLag = Math.floor(sampleRate / MAX_FREQUENCY)
  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY)

  let bestLag = -1
  let bestCorrelation = -1

  // Start from minLag to find first significant peak
  for (let lag = minLag; lag < Math.min(maxLag, bufferSize); lag++) {
    if (correlations[lag] > bestCorrelation && correlations[lag] > correlations[lag - 1] && correlations[lag] > correlations[lag + 1]) {
      bestCorrelation = correlations[lag]
      bestLag = lag
      break // Take the first peak for fundamental frequency
    }
  }

  if (bestLag === -1) {
    return null
  }

  // Calculate confidence as the ratio of peak correlation to zero-lag correlation
  const confidence = bestCorrelation / correlations[0]

  if (confidence < MIN_CONFIDENCE) {
    return null
  }

  // Convert lag to frequency
  const frequency = sampleRate / bestLag

  // Sanity check frequency range
  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    return null
  }

  // Convert frequency to note
  const { note, cents } = frequencyToNote(frequency)

  return {
    frequency,
    note,
    cents,
    confidence,
  }
}

/**
 * Convert a frequency to the nearest musical note with cents offset.
 *
 * @param frequency - Frequency in Hz
 * @returns Object with note name and cents offset from that note
 */
export function frequencyToNote(frequency: number): { note: string; cents: number } {
  // Use tonal.js to get the nearest note (using sharps)
  const note = Note.fromFreqSharps(frequency)

  // Get the frequency of the detected note
  const noteFreq = Note.freq(note)

  if (!noteFreq) {
    // Fallback for invalid frequencies
    return { note: 'N/A', cents: 0 }
  }

  // Calculate cents offset
  // Formula: cents = 1200 * log2(f1/f2)
  const cents = Math.round(1200 * Math.log2(frequency / noteFreq))

  return { note, cents }
}
