/**
 * Tests for PitchDetector component - always-visible tuner strip.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PitchDetector } from './PitchDetector'
import type { PitchResult } from '../../utils/pitchDetection'

vi.mock('../../context/PitchDetectionContext', async () => {
  const actual = await vi.importActual('../../context/PitchDetectionContext')
  return {
    ...actual,
    usePitchDetection: vi.fn(),
  }
})

import { usePitchDetection } from '../../context/PitchDetectionContext'

const mockUsePitchDetection = usePitchDetection as ReturnType<typeof vi.fn>

const defaultMock = {
  isListening: false,
  startListening: vi.fn(),
  stopListening: vi.fn(),
  pitchResult: null,
  error: null,
  isSupported: true,
}

describe('PitchDetector', () => {
  const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  it('renders mic button', () => {
    mockUsePitchDetection.mockReturnValue(defaultMock)
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByRole('button', { name: /start microphone/i })).toBeInTheDocument()
  })

  it('shows "not supported" when Web Audio API unavailable', () => {
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isSupported: false })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByText(/not supported/i)).toBeInTheDocument()
  })

  it('shows error when microphone permission denied', () => {
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, error: 'Microphone permission denied' })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Microphone permission denied')
  })

  it('shows dash placeholder when no note detected', () => {
    mockUsePitchDetection.mockReturnValue(defaultMock)
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows note name (pitch class) when pitch detected', () => {
    const pitchResult: PitchResult = { frequency: 440, note: 'A4', cents: 0, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    // Should show "A" (pitch class), not "A4"
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows cents readout with sign', () => {
    const pitchResult: PitchResult = { frequency: 445, note: 'A4', cents: 20, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByText('+20¢')).toBeInTheDocument()
  })

  it('applies "inTune" category when cents ±5', () => {
    const pitchResult: PitchResult = { frequency: 441, note: 'A4', cents: 4, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByTestId('tuning-indicator')).toHaveAttribute('data-tuning-category', 'inTune')
  })

  it('applies "slightlyOff" category when cents ±15', () => {
    const pitchResult: PitchResult = { frequency: 443, note: 'A4', cents: 12, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByTestId('tuning-indicator')).toHaveAttribute('data-tuning-category', 'slightlyOff')
  })

  it('applies "outOfTune" category when cents >15', () => {
    const pitchResult: PitchResult = { frequency: 450, note: 'A4', cents: 38, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    expect(screen.getByTestId('tuning-indicator')).toHaveAttribute('data-tuning-category', 'outOfTune')
  })

  it('positions marker left of center when flat', () => {
    const pitchResult: PitchResult = { frequency: 435, note: 'A4', cents: -20, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    render(<PitchDetector scaleNotes={scaleNotes} />)
    const marker = screen.getByTestId('tuning-indicator')
    // -20 cents -> ((−20+50)/100)*100 = 30%
    expect(marker.style.left).toBe('30%')
  })

  it('highlights note label green when note is in scale', () => {
    const pitchResult: PitchResult = { frequency: 440, note: 'A4', cents: 0, confidence: 0.95 }
    mockUsePitchDetection.mockReturnValue({ ...defaultMock, isListening: true, pitchResult })
    const { container } = render(<PitchDetector scaleNotes={scaleNotes} />)
    const noteLabel = container.querySelector('[class*="noteLabel"]')
    expect(noteLabel?.className).toMatch(/inScale/)
  })
})
