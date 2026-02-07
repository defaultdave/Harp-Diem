/**
 * Tests for PitchDetector component.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PitchDetector } from './PitchDetector'
import type { PitchResult } from '../../utils/pitchDetection'

// Mock the usePitchDetection hook
vi.mock('../../context/PitchDetectionContext', async () => {
  const actual = await vi.importActual('../../context/PitchDetectionContext')
  return {
    ...actual,
    usePitchDetection: vi.fn(),
  }
})

// Import after mocking
import { usePitchDetection } from '../../context/PitchDetectionContext'

const mockUsePitchDetection = usePitchDetection as ReturnType<typeof vi.fn>

describe('PitchDetector', () => {
  const mockScaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  it('renders mic button', () => {
    mockUsePitchDetection.mockReturnValue({
      isListening: false,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: null,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByRole('button', { name: /start microphone/i })).toBeInTheDocument()
  })

  it('shows "not supported" state when Web Audio API not available', () => {
    mockUsePitchDetection.mockReturnValue({
      isListening: false,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: null,
      error: null,
      isSupported: false,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByText(/not supported/i)).toBeInTheDocument()
  })

  it('shows error state when microphone permission denied', () => {
    mockUsePitchDetection.mockReturnValue({
      isListening: false,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: null,
      error: 'Microphone permission denied',
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Microphone permission denied')
  })

  it('shows detected note when pitch result available', () => {
    const mockPitchResult: PitchResult = {
      frequency: 440.0,
      note: 'A4',
      cents: 0,
      confidence: 0.95,
    }

    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: mockPitchResult,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByText('A4')).toBeInTheDocument()
    expect(screen.getByText('440.0 Hz')).toBeInTheDocument()
    expect(screen.getByText('0 cents')).toBeInTheDocument()
  })

  it('shows "In Scale" indicator when detected note is in scale', () => {
    const mockPitchResult: PitchResult = {
      frequency: 440.0,
      note: 'A4',
      cents: 0,
      confidence: 0.95,
    }

    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: mockPitchResult,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByText('In Scale')).toBeInTheDocument()
  })

  it('shows "Not in Scale" indicator when detected note is not in scale', () => {
    const mockPitchResult: PitchResult = {
      frequency: 466.16,
      note: 'A#4',
      cents: 0,
      confidence: 0.95,
    }

    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: mockPitchResult,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByText('Not in Scale')).toBeInTheDocument()
  })

  it('applies "inTune" category when cents offset is small (±5)', () => {
    const mockPitchResult: PitchResult = {
      frequency: 441.0,
      note: 'A4',
      cents: 4,
      confidence: 0.95,
    }

    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: mockPitchResult,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    const indicator = screen.getByTestId('tuning-indicator')
    expect(indicator).toHaveAttribute('data-tuning-category', 'inTune')
  })

  it('applies "slightlyOff" category when cents offset is moderate (±15)', () => {
    const mockPitchResult: PitchResult = {
      frequency: 443.0,
      note: 'A4',
      cents: 12,
      confidence: 0.95,
    }

    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: mockPitchResult,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    const indicator = screen.getByTestId('tuning-indicator')
    expect(indicator).toHaveAttribute('data-tuning-category', 'slightlyOff')
  })

  it('applies "outOfTune" category when cents offset is large (>15)', () => {
    const mockPitchResult: PitchResult = {
      frequency: 450.0,
      note: 'A4',
      cents: 38,
      confidence: 0.95,
    }

    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: mockPitchResult,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    const indicator = screen.getByTestId('tuning-indicator')
    expect(indicator).toHaveAttribute('data-tuning-category', 'outOfTune')
  })

  it('shows "Listening..." message when mic is on but no pitch detected', () => {
    mockUsePitchDetection.mockReturnValue({
      isListening: true,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: null,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByText(/listening/i)).toBeInTheDocument()
  })

  it('shows start prompt when mic is off', () => {
    mockUsePitchDetection.mockReturnValue({
      isListening: false,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      pitchResult: null,
      error: null,
      isSupported: true,
    })

    render(<PitchDetector scaleNotes={mockScaleNotes} />)

    expect(screen.getByText(/click "start mic"/i)).toBeInTheDocument()
  })
})
