/**
 * Lightweight logging and error-reporting seam.
 *
 * Goals:
 * - Suppress debug/info noise in production builds (guarded by `import.meta.env.DEV`).
 * - Provide a single `reportError` entry point that always logs in development and
 *   forwards to an external error-tracking service when one is registered.
 * - Install global safety nets for errors that escape React's `ErrorBoundary`
 *   (uncaught errors and unhandled promise rejections).
 *
 * The app intentionally ships with NO bundled error-tracking vendor. To wire one
 * (e.g. Sentry), install it and call `setErrorReporter()` once during bootstrap:
 *
 * ```ts
 * import * as Sentry from '@sentry/react'
 * Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })
 * setErrorReporter((error, context) =>
 *   Sentry.captureException(error, context ? { extra: context } : undefined))
 * ```
 *
 * @packageDocumentation
 */

const isDev = import.meta.env.DEV

/** A pluggable sink for forwarding errors to an external service. */
export type ErrorReporter = (error: unknown, context?: Record<string, unknown>) => void

let externalReporter: ErrorReporter | null = null

/** Register (or clear with `null`) the external error-reporting sink. */
export function setErrorReporter(reporter: ErrorReporter | null): void {
  externalReporter = reporter
}

/** Debug-level log. Stripped from production builds. */
export function logDebug(...args: unknown[]): void {
  if (isDev) console.log(...args)
}

/** Warning-level log. Stripped from production builds. */
export function logWarn(...args: unknown[]): void {
  if (isDev) console.warn(...args)
}

/**
 * Report an error. Always logs in development; forwards to the registered
 * external reporter (if any) in every environment. Never throws.
 *
 * @param error - The error or value that was thrown.
 * @param context - Optional structured context to attach to the report.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (isDev) {
    console.error('[error]', error, context ?? '')
  }
  try {
    externalReporter?.(error, context)
  } catch {
    // A failing error reporter must never break the app.
  }
}

/**
 * Install global handlers for uncaught errors and unhandled promise rejections.
 * Call once during app bootstrap (see `main.tsx`).
 */
export function initErrorReporting(): void {
  if (typeof window === 'undefined') return

  // These global listeners are a fallback for when no external reporter is wired.
  // A vendor SDK (e.g. Sentry) installs its own richer global handlers, so we skip
  // forwarding once `externalReporter` is set — avoids double-reporting uncaught errors.
  window.addEventListener('error', (event) => {
    if (externalReporter) return
    reportError(event.error ?? event.message, { source: 'window.onerror' })
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (externalReporter) return
    reportError(event.reason, { source: 'unhandledrejection' })
  })
}
