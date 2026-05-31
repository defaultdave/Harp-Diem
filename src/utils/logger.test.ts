import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reportError, setErrorReporter, logDebug, logWarn, initErrorReporting } from './logger'

describe('logger', () => {
  beforeEach(() => {
    // Drain any buffered reports left by a previous test, then clear the reporter.
    setErrorReporter(() => {})
    setErrorReporter(null)
  })
  afterEach(() => {
    setErrorReporter(null)
    vi.restoreAllMocks()
  })

  describe('reportError', () => {
    it('forwards the error and context to a registered reporter', () => {
      const reporter = vi.fn()
      setErrorReporter(reporter)
      const err = new Error('boom')

      reportError(err, { context: 'test' })

      expect(reporter).toHaveBeenCalledWith(err, { context: 'test' })
    })

    it('does not forward after the reporter is cleared', () => {
      const reporter = vi.fn()
      setErrorReporter(reporter)
      setErrorReporter(null)

      reportError(new Error('x'))

      expect(reporter).not.toHaveBeenCalled()
    })

    it('never throws even if the reporter itself throws', () => {
      setErrorReporter(() => {
        throw new Error('reporter exploded')
      })

      expect(() => reportError(new Error('x'))).not.toThrow()
    })

    it('logs to console.error in development', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      reportError(new Error('logged'))

      expect(spy).toHaveBeenCalled()
    })

    it('buffers errors reported before a reporter is registered, then flushes on registration', () => {
      reportError(new Error('early'), { phase: 'startup' })
      const reporter = vi.fn()

      setErrorReporter(reporter)

      expect(reporter).toHaveBeenCalledWith(expect.any(Error), { phase: 'startup' })
    })
  })

  describe('logDebug / logWarn', () => {
    it('logDebug writes to console.log in dev', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
      logDebug('hi')
      expect(spy).toHaveBeenCalledWith('hi')
    })

    it('logWarn writes to console.warn in dev', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      logWarn('careful')
      expect(spy).toHaveBeenCalledWith('careful')
    })
  })

  describe('initErrorReporting', () => {
    it('registers global error and unhandledrejection listeners', () => {
      const spy = vi.spyOn(window, 'addEventListener')

      initErrorReporting()

      const events = spy.mock.calls.map((call) => call[0])
      expect(events).toContain('error')
      expect(events).toContain('unhandledrejection')
    })

    it('logs an uncaught error when no external reporter is registered', () => {
      initErrorReporting()
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      window.dispatchEvent(new ErrorEvent('error', { error: new Error('global'), message: 'global' }))

      expect(spy).toHaveBeenCalled()
    })
  })
})
