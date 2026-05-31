import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components'
import { initErrorReporting, setErrorReporter } from './utils'

// Install global safety nets for uncaught errors and unhandled promise rejections.
initErrorReporting()

// Forward errors to Sentry when a DSN is configured at build time. The dynamic
// import is fully tree-shaken from the bundle when VITE_SENTRY_DSN is unset.
if (import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    })
    setErrorReporter((error, context) =>
      Sentry.captureException(error, context ? { extra: context } : undefined)
    )
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
