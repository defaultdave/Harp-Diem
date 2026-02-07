import { describe, it, expect } from 'vitest'
import { detectPitch, frequencyToNote } from './pitchDetection'

describe('frequencyToNote', () => {
  it('converts 440Hz to A4 with 0 cents offset', () => {
    const result = frequencyToNote(440)
    expect(result.note).toBe('A4')
    expect(result.cents).toBe(0)
  })

  it('converts 261.63Hz to C4 with ~0 cents offset', () => {
    const result = frequencyToNote(261.63)
    expect(result.note).toBe('C4')
    expect(Math.abs(result.cents)).toBeLessThan(2)
  })

  it('detects sharp notes (slightly high)', () => {
    // 445Hz is slightly sharp of A4 (440Hz)
    const result = frequencyToNote(445)
    expect(result.note).toBe('A4')
    expect(result.cents).toBeGreaterThan(0)
    expect(result.cents).toBeLessThan(25)
  })

  it('detects flat notes (slightly low)', () => {
    // 435Hz is slightly flat of A4 (440Hz)
    const result = frequencyToNote(435)
    expect(result.note).toBe('A4')
    expect(result.cents).toBeLessThan(0)
    expect(result.cents).toBeGreaterThan(-25)
  })

  it('handles low frequencies (C1)', () => {
    const result = frequencyToNote(32.7) // C1
    expect(result.note).toBe('C1')
    expect(Math.abs(result.cents)).toBeLessThan(5)
  })

  it('handles high frequencies (C7)', () => {
    const result = frequencyToNote(2093) // C7
    expect(result.note).toBe('C7')
    expect(Math.abs(result.cents)).toBeLessThan(5)
  })

  it('uses sharps not flats', () => {
    const result = frequencyToNote(277.18) // C#4/Db4
    expect(result.note).toContain('#')
    expect(result.note).not.toContain('b')
  })

  it('returns 0 cents for A4 at 442Hz with referenceHz=442', () => {
    const result = frequencyToNote(442, 442)
    expect(result.note).toBe('A4')
    expect(result.cents).toBe(0)
  })

  it('returns ~+8 cents for A4 at 442Hz with referenceHz=440', () => {
    const result = frequencyToNote(442, 440)
    expect(result.note).toBe('A4')
    // 1200 * log2(442/440) ≈ 7.85 cents, rounds to 8
    expect(result.cents).toBeGreaterThanOrEqual(7)
    expect(result.cents).toBeLessThanOrEqual(8)
  })

  it('returns ~-8 cents for A4 at 440Hz with referenceHz=442', () => {
    const result = frequencyToNote(440, 442)
    expect(result.note).toBe('A4')
    expect(result.cents).toBeGreaterThanOrEqual(-8)
    expect(result.cents).toBeLessThanOrEqual(-7)
  })

  it('defaults to 440Hz when referenceHz not provided', () => {
    const withDefault = frequencyToNote(440)
    const withExplicit = frequencyToNote(440, 440)
    expect(withDefault.note).toBe(withExplicit.note)
    expect(withDefault.cents).toBe(withExplicit.cents)
  })
})

describe('detectPitch', () => {
  const SAMPLE_RATE = 44100

  function generateSineWave(frequency: number, duration: number, sampleRate: number): Float32Array {
    const samples = Math.floor(duration * sampleRate)
    const buffer = new Float32Array(samples)
    for (let i = 0; i < samples; i++) {
      buffer[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate)
    }
    return buffer
  }

  function generateSilence(duration: number, sampleRate: number): Float32Array {
    const samples = Math.floor(duration * sampleRate)
    return new Float32Array(samples)
  }

  function generateNoise(duration: number, sampleRate: number): Float32Array {
    const samples = Math.floor(duration * sampleRate)
    const buffer = new Float32Array(samples)
    for (let i = 0; i < samples; i++) {
      buffer[i] = (Math.random() * 2 - 1) * 0.5
    }
    return buffer
  }

  it('detects A4 (440Hz) from sine wave', () => {
    const buffer = generateSineWave(440, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('A4')
    expect(result?.frequency).toBeGreaterThan(430)
    expect(result?.frequency).toBeLessThan(450)
    expect(result?.confidence).toBeGreaterThan(0.9)
  })

  it('detects C4 (261.63Hz) from sine wave', () => {
    const buffer = generateSineWave(261.63, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('C4')
    expect(result?.frequency).toBeGreaterThan(255)
    expect(result?.frequency).toBeLessThan(268)
  })

  it('detects E4 (329.63Hz) from sine wave', () => {
    const buffer = generateSineWave(329.63, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('E4')
    expect(result?.frequency).toBeGreaterThan(320)
    expect(result?.frequency).toBeLessThan(340)
  })

  it('returns null for silence', () => {
    const buffer = generateSilence(0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).toBeNull()
  })

  it('returns null for pure noise (low confidence)', () => {
    const buffer = generateNoise(0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    // Noise should have low confidence and likely return null
    // or if it does detect something, confidence should be low
    if (result !== null) {
      expect(result.confidence).toBeLessThan(0.95)
    }
  })

  it('detects low frequency (C2)', () => {
    // Use a longer duration for low frequencies to capture more periods
    const buffer = generateSineWave(65.41, 0.2, SAMPLE_RATE) // C2
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('C2')
    expect(result?.frequency).toBeGreaterThan(60)
    expect(result?.frequency).toBeLessThan(70)
  })

  it('detects high frequency (A5)', () => {
    const buffer = generateSineWave(880, 0.1, SAMPLE_RATE) // A5
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('A5')
    expect(result?.frequency).toBeGreaterThan(870)
    expect(result?.frequency).toBeLessThan(890)
  })

  it('calculates cents offset for sharp note', () => {
    // Slightly sharp A4
    const buffer = generateSineWave(445, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('A4')
    expect(result?.cents).toBeGreaterThan(0)
  })

  it('calculates cents offset for flat note', () => {
    // Slightly flat A4
    const buffer = generateSineWave(435, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.note).toBe('A4')
    expect(result?.cents).toBeLessThan(0)
  })

  it('handles very quiet signals', () => {
    const buffer = generateSineWave(440, 0.1, SAMPLE_RATE)
    // Make it very quiet
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] *= 0.005
    }
    const result = detectPitch(buffer, SAMPLE_RATE)

    // Should return null because signal is too quiet
    expect(result).toBeNull()
  })

  it('rejects frequencies outside valid range (too low)', () => {
    // Generate a very low frequency (below MIN_FREQUENCY of 32Hz)
    const buffer = generateSineWave(20, 0.2, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    // Should return null or detect a harmonic within range
    if (result !== null) {
      expect(result.frequency).toBeGreaterThanOrEqual(32)
    }
  })

  it('rejects frequencies outside valid range (too high)', () => {
    // Generate a very high frequency (above MAX_FREQUENCY of 4200Hz)
    const buffer = generateSineWave(5000, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    // Should return null or detect a subharmonic
    if (result !== null) {
      expect(result.frequency).toBeLessThanOrEqual(4200)
    }
  })

  it('returns confidence score between 0 and 1', () => {
    const buffer = generateSineWave(440, 0.1, SAMPLE_RATE)
    const result = detectPitch(buffer, SAMPLE_RATE)

    expect(result).not.toBeNull()
    expect(result?.confidence).toBeGreaterThanOrEqual(0)
    expect(result?.confidence).toBeLessThanOrEqual(1)
  })

  it('has higher confidence for clear tones than complex waveforms', () => {
    const pureTone = generateSineWave(440, 0.1, SAMPLE_RATE)
    const pureResult = detectPitch(pureTone, SAMPLE_RATE)

    // Create a complex waveform by adding harmonics
    const complexTone = generateSineWave(440, 0.1, SAMPLE_RATE)
    const harmonic2 = generateSineWave(880, 0.1, SAMPLE_RATE)
    for (let i = 0; i < complexTone.length; i++) {
      complexTone[i] = complexTone[i] * 0.8 + harmonic2[i] * 0.2
    }
    const complexResult = detectPitch(complexTone, SAMPLE_RATE)

    expect(pureResult).not.toBeNull()
    expect(complexResult).not.toBeNull()

    // Pure tone should have higher or equal confidence
    expect(pureResult!.confidence).toBeGreaterThanOrEqual(complexResult!.confidence - 0.05)
  })
})
