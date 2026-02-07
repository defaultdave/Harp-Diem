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

/** Minimum confidence threshold for considering a detection valid.
 *  Real-world microphone input with background noise typically produces
 *  confidence in the 0.3-0.6 range. 0.9 was unrealistically strict. */
const MIN_CONFIDENCE = 0.25

/** Minimum frequency to detect (roughly C1) */
const MIN_FREQUENCY = 32

/** Maximum frequency to detect (roughly C8) */
const MAX_FREQUENCY = 4200

/** Debug info returned alongside pitch result for diagnostics */
export interface PitchDebugInfo {
  rms: number
  bestLag: number
  bestCorrelation: number
  confidence: number
  frequency: number | null
  rejectedReason: string | null
  sampleRate: number
  bufferSize: number
}

/**
 * Autocorrelation-based pitch detection algorithm.
 * Finds the fundamental frequency by detecting periodicity in the time-domain signal.
 *
 * @param dataArray - Float32Array of time-domain audio samples from AnalyserNode
 * @param sampleRate - Sample rate of the audio context (e.g., 44100 Hz)
 * @param debug - If provided, debug info is written into this object
 * @returns PitchResult with detected frequency and note, or null if no clear pitch detected
 */
export function detectPitch(dataArray: Float32Array, sampleRate: number, debug?: PitchDebugInfo): PitchResult | null {
  // Calculate autocorrelation for different lags
  const bufferSize = dataArray.length
  const correlations = new Float32Array(bufferSize)

  if (debug) {
    debug.sampleRate = sampleRate
    debug.bufferSize = bufferSize
    debug.rejectedReason = null
    debug.frequency = null
    debug.bestLag = -1
    debug.bestCorrelation = -1
    debug.confidence = 0
  }

  // Compute RMS to detect silence
  let rms = 0
  for (let i = 0; i < bufferSize; i++) {
    const val = dataArray[i]
    rms += val * val
  }
  rms = Math.sqrt(rms / bufferSize)

  if (debug) debug.rms = rms

  // Silence threshold - if too quiet, don't detect pitch
  if (rms < 0.01) {
    if (debug) debug.rejectedReason = `silence (rms=${rms.toFixed(6)} < 0.01)`
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

  // Find the strongest correlation peak in the valid frequency range
  const minLag = Math.floor(sampleRate / MAX_FREQUENCY)
  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY)
  const searchEnd = Math.min(maxLag, bufferSize - 1)

  let bestLag = -1
  let bestCorrelation = -1

  // Find the highest peak (local maximum) across all valid lags
  for (let lag = minLag; lag < searchEnd; lag++) {
    const isLocalMax = correlations[lag] > correlations[lag - 1] && correlations[lag] > correlations[lag + 1]
    if (isLocalMax && correlations[lag] > bestCorrelation) {
      bestCorrelation = correlations[lag]
      bestLag = lag
    }
  }

  if (debug) {
    debug.bestLag = bestLag
    debug.bestCorrelation = bestCorrelation
  }

  if (bestLag === -1) {
    if (debug) debug.rejectedReason = `no_peak (searched lags ${minLag}-${searchEnd})`
    return null
  }

  // Calculate confidence as the ratio of peak correlation to zero-lag correlation
  const confidence = bestCorrelation / correlations[0]

  // Always compute frequency so debug shows it even if confidence is too low
  const frequency = sampleRate / bestLag

  if (debug) {
    debug.confidence = confidence
    debug.frequency = frequency
  }

  if (confidence < MIN_CONFIDENCE) {
    if (debug) debug.rejectedReason = `low_confidence (${confidence.toFixed(4)} < ${MIN_CONFIDENCE})`
    return null
  }

  // Sanity check frequency range
  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    if (debug) debug.rejectedReason = `out_of_range (${frequency.toFixed(1)} Hz outside ${MIN_FREQUENCY}-${MAX_FREQUENCY})`
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
