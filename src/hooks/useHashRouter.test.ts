import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHashRouter } from './useHashRouter'

describe('useHashRouter', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('defaults to "/" when there is no hash', () => {
    const { result } = renderHook(() => useHashRouter())
    expect(result.current.route).toBe('/')
  })

  it('parses #/quiz as the quiz route on initial load', () => {
    window.location.hash = '#/quiz'
    const { result } = renderHook(() => useHashRouter())
    expect(result.current.route).toBe('/quiz')
  })

  it('falls back to "/" for unknown hashes', () => {
    window.location.hash = '#/does-not-exist'
    const { result } = renderHook(() => useHashRouter())
    expect(result.current.route).toBe('/')
  })

  it('navigate("/quiz") sets the hash to #/quiz', () => {
    const { result } = renderHook(() => useHashRouter())
    act(() => {
      result.current.navigate('/quiz')
    })
    expect(window.location.hash).toBe('#/quiz')
  })

  it('navigate("/") clears the hash', () => {
    window.location.hash = '#/quiz'
    const { result } = renderHook(() => useHashRouter())
    act(() => {
      result.current.navigate('/')
    })
    expect(window.location.hash).toBe('')
  })

  it('reacts to external hashchange events', () => {
    const { result } = renderHook(() => useHashRouter())
    act(() => {
      window.location.hash = '#/quiz'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current.route).toBe('/quiz')
  })
})
