import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from './App'

// Mock matchMedia for theme hook
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  })
})

// Clean up localStorage after each test
afterEach(() => {
  localStorage.clear()
})

describe('App - ChordExplorer Collapse', () => {
  it('chord panel is collapsed by default', () => {
    render(<App />)

    // Should not show ChordExplorer content initially
    expect(screen.queryByRole('region', { name: /chord explorer/i })).not.toBeInTheDocument()

    // Toggle button should say expand
    const toggleButton = screen.getByRole('button', { name: /expand chord panel/i })
    expect(toggleButton).toBeInTheDocument()
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking toggle button expands chord panel', () => {
    render(<App />)

    // Click toggle to expand
    const toggleButton = screen.getByRole('button', { name: /expand chord panel/i })
    fireEvent.click(toggleButton)

    // Should show ChordExplorer
    expect(screen.getByRole('region', { name: /chord explorer/i })).toBeInTheDocument()

    // Toggle button should now say collapse
    const collapseButton = screen.getByRole('button', { name: /collapse chord panel/i })
    expect(collapseButton).toBeInTheDocument()
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking toggle again collapses chord panel', () => {
    render(<App />)

    // Expand first
    fireEvent.click(screen.getByRole('button', { name: /expand chord panel/i }))
    expect(screen.getByRole('region', { name: /chord explorer/i })).toBeInTheDocument()

    // Click toggle to collapse
    fireEvent.click(screen.getByRole('button', { name: /collapse chord panel/i }))

    // Chord panel should be gone
    expect(screen.queryByRole('region', { name: /chord explorer/i })).not.toBeInTheDocument()

    // Toggle should say expand again
    const toggleButton = screen.getByRole('button', { name: /expand chord panel/i })
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('applies collapsed CSS class when panel is closed', () => {
    render(<App />)

    const harmonicaDisplay = screen.getByRole('region', {
      name: /C Diatonic Harmonica visualization/i,
    })
    const scaleContent = harmonicaDisplay.parentElement

    // Should have collapsed class initially
    expect(scaleContent?.className).toMatch(/scaleContentCollapsed/)

    // Expand panel
    fireEvent.click(screen.getByRole('button', { name: /expand chord panel/i }))
    expect(scaleContent?.className).not.toMatch(/scaleContentCollapsed/)

    // Collapse again
    fireEvent.click(screen.getByRole('button', { name: /collapse chord panel/i }))
    expect(scaleContent?.className).toMatch(/scaleContentCollapsed/)
  })

  it('chord selection works when panel is expanded', () => {
    render(<App />)

    // Expand panel
    fireEvent.click(screen.getByRole('button', { name: /expand chord panel/i }))

    // Find and click a chord
    const chordExplorer = screen.getByRole('region', { name: /chord explorer/i })
    const cChordButton = within(chordExplorer).getByRole('button', { name: /C Major chord/i })
    fireEvent.click(cChordButton)

    expect(cChordButton).toBeInTheDocument()
  })
})
