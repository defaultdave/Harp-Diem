import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChordExplorer } from './ChordExplorer'
import { ChordCard } from './ChordCard'
import { MiniHarmonica } from './MiniHarmonica'
import { PlaybackProvider } from '../../context'
import type { ChordGroup, ChordVoicing } from '../../data'

// Wrapper with required providers
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <PlaybackProvider>{children}</PlaybackProvider>
)

describe('ChordExplorer - Component', () => {
  it('renders without collapse button (toggle is in parent)', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    // ChordExplorer should not have its own collapse button
    const collapseButton = screen.queryByRole('button', { name: /collapse chord panel/i })
    expect(collapseButton).not.toBeInTheDocument()

    // But should render its content
    expect(screen.getByText('Chords in Scale')).toBeInTheDocument()
  })
})

describe('ChordExplorer', () => {
  it('renders chord cards for C major scale', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    // Should have header
    expect(screen.getByText('Chords in Scale')).toBeInTheDocument()

    // Should have C major chord
    expect(screen.getByText('C')).toBeInTheDocument()

    // Should have other scale chords
    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('Dm')).toBeInTheDocument()
  })

  it('shows empty state when no chords match', () => {
    const limitedScale = ['C', 'D']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={limitedScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    expect(
      screen.getByText(/No chords available for this scale/i)
    ).toBeInTheDocument()
  })

  it('renders quality legend', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    expect(screen.getByText('Chord Quality:')).toBeInTheDocument()
    expect(screen.getByText('Major')).toBeInTheDocument()
    expect(screen.getByText('Minor')).toBeInTheDocument()
    expect(screen.getByText('Dominant 7th')).toBeInTheDocument()
    expect(screen.getByText('Diminished')).toBeInTheDocument()
  })
})

describe('ChordCard', () => {
  const mockChordGroup: ChordGroup = {
    name: 'C',
    quality: 'major',
    voicings: [
      {
        name: 'C Major',
        shortName: 'C',
        quality: 'major',
        holes: [1, 2, 3],
        breath: 'blow',
        notes: ['C4', 'E4', 'G4'],
        position: 1,
        romanNumeral: 'I',
        isConsecutive: true,
        tuning: 'richter',
      },
      {
        name: 'C Major',
        shortName: 'C',
        quality: 'major',
        holes: [4, 5, 6],
        breath: 'blow',
        notes: ['C5', 'E5', 'G5'],
        position: 1,
        romanNumeral: 'I',
        isConsecutive: true,
        tuning: 'richter',
      },
    ],
    currentIndex: 0,
  }

  it('renders chord name and voicing count', () => {
    render(<ChordCard chordGroup={mockChordGroup} />, { wrapper: Wrapper })

    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('C Major')).toBeInTheDocument()
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })

  it('shows voicing navigation buttons when multiple voicings exist', () => {
    render(<ChordCard chordGroup={mockChordGroup} />, { wrapper: Wrapper })

    const prevButton = screen.getByLabelText('Previous voicing')
    const nextButton = screen.getByLabelText('Next voicing')

    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('navigates between voicings with arrow buttons', () => {
    render(<ChordCard chordGroup={mockChordGroup} />, { wrapper: Wrapper })

    // Initially at voicing 1
    expect(screen.getByText('1 of 2')).toBeInTheDocument()

    // Click next
    const nextButton = screen.getByLabelText('Next voicing')
    fireEvent.click(nextButton)

    // Should be at voicing 2
    expect(screen.getByText('2 of 2')).toBeInTheDocument()

    // Click prev
    const prevButton = screen.getByLabelText('Previous voicing')
    fireEvent.click(prevButton)

    // Should be back at voicing 1
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })

  it('calls onChordSelect when card is clicked', () => {
    const onChordSelect = vi.fn()

    render(<ChordCard chordGroup={mockChordGroup} onChordSelect={onChordSelect} />, {
      wrapper: Wrapper,
    })

    const card = screen.getByRole('button', { name: /C Major chord/ })
    fireEvent.click(card)

    // Should be called with the chord
    expect(onChordSelect).toHaveBeenCalledWith(mockChordGroup.voicings[0])
  })

  it('hides voicing navigation for single-voicing chords', () => {
    const singleVoicingGroup: ChordGroup = {
      ...mockChordGroup,
      voicings: [mockChordGroup.voicings[0]],
    }

    render(<ChordCard chordGroup={singleVoicingGroup} />, { wrapper: Wrapper })

    // Should not show navigation
    expect(screen.queryByLabelText('Previous voicing')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next voicing')).not.toBeInTheDocument()
  })

  it('shows TB badge for tongue blocking chords', () => {
    const tongueBlockingGroup: ChordGroup = {
      ...mockChordGroup,
      voicings: [
        {
          ...mockChordGroup.voicings[0],
          holes: [1, 3, 5],
          isConsecutive: false,
        },
      ],
    }

    render(<ChordCard chordGroup={tongueBlockingGroup} />, { wrapper: Wrapper })
    expect(screen.getByText('TB')).toBeInTheDocument()
  })

  it('does not show TB badge for consecutive chords', () => {
    render(<ChordCard chordGroup={mockChordGroup} />, { wrapper: Wrapper })
    expect(screen.queryByText('TB')).not.toBeInTheDocument()
  })
})

describe('Tongue Blocking UI', () => {
  it('renders tongue blocking toggle button', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    expect(screen.getByText('Show Tongue Blocking')).toBeInTheDocument()
  })

  it('toggles tongue blocking section on and off', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    // Toggle on
    fireEvent.click(screen.getByText('Show Tongue Blocking'))
    expect(screen.getByText('Hide Tongue Blocking')).toBeInTheDocument()

    // Toggle off
    fireEvent.click(screen.getByText('Hide Tongue Blocking'))
    expect(screen.getByText('Show Tongue Blocking')).toBeInTheDocument()
  })

  it('shows tongue blocking chord section when enabled', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    fireEvent.click(screen.getByText('Show Tongue Blocking'))

    // Should show the tongue blocking section header
    expect(screen.getByText('Tongue Blocking')).toBeInTheDocument()
  })

  it('does not show parameter controls (simplified API)', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

    render(
      <ChordExplorer
        harmonicaKey="C"
        tuning="richter"
        scaleNotes={cMajorScale}
        onChordSelect={vi.fn()}
      />,
      { wrapper: Wrapper }
    )

    fireEvent.click(screen.getByText('Show Tongue Blocking'))

    // Should NOT show parameter controls (removed in this PR)
    expect(screen.queryByLabelText('Max Span')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Min Skip')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Max Skip')).not.toBeInTheDocument()
  })
})

describe('MiniHarmonica - Blocked Holes', () => {
  it('shows blocked holes for tongue blocking chords', () => {
    const tongueBlockingVoicing: ChordVoicing = {
      name: 'C Major',
      shortName: 'C',
      quality: 'major',
      holes: [1, 3, 5],
      breath: 'blow',
      notes: ['C4', 'G4', 'E5'],
      position: 1,
      romanNumeral: '',
      isConsecutive: false,
      tuning: 'richter',
    }

    render(<MiniHarmonica voicing={tongueBlockingVoicing} />)

    // Holes 2 and 4 should be blocked (shown as ×)
    const blockedHoles = screen.getAllByText('×')
    expect(blockedHoles).toHaveLength(2)
  })

  it('does not show blocked holes for consecutive chords', () => {
    const consecutiveVoicing: ChordVoicing = {
      name: 'C Major',
      shortName: 'C',
      quality: 'major',
      holes: [1, 2, 3],
      breath: 'blow',
      notes: ['C4', 'E4', 'G4'],
      position: 1,
      romanNumeral: 'I',
      isConsecutive: true,
      tuning: 'richter',
    }

    render(<MiniHarmonica voicing={consecutiveVoicing} />)

    expect(screen.queryByText('×')).not.toBeInTheDocument()
  })
})
