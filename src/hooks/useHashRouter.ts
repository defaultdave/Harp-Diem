/**
 * @packageDocumentation
 * Simple hash-based router for client-side navigation.
 *
 * @remarks
 * Uses hash routing (`#/path`) to enable client-side navigation that works
 * with GitHub Pages without requiring server-side configuration.
 *
 * @category Hooks
 */
import { useState, useEffect, useCallback } from 'react'

/**
 * Available routes in the application.
 *
 * @remarks
 * - `'/'` - Main harmonica visualization page
 * - `'/quiz'` - Key identification quiz page
 */
export type Route = '/' | '/quiz'

/**
 * Parses the current URL hash to determine the active route.
 *
 * @returns The current Route based on window.location.hash
 * @internal
 */
function parseHash(): Route {
  const hash = window.location.hash
  if (hash === '#/quiz') return '/quiz'
  return '/'
}

/**
 * Hook for hash-based client-side routing.
 *
 * @remarks
 * Provides navigation between pages using URL hash fragments (`#/path`).
 * This approach works with static hosting (GitHub Pages) without requiring
 * server-side routing configuration.
 *
 * The hook:
 * - Tracks the current route based on `window.location.hash`
 * - Listens for hash changes to update the route
 * - Provides a `navigate` function for programmatic navigation
 *
 * @returns Object with current route and navigate function
 *
 * @example
 * ```tsx
 * function App() {
 *   const { route, navigate } = useHashRouter()
 *
 *   return (
 *     <div>
 *       <nav>
 *         <button onClick={() => navigate('/')}>Home</button>
 *         <button onClick={() => navigate('/quiz')}>Quiz</button>
 *       </nav>
 *       {route === '/' && <HarmonicaView />}
 *       {route === '/quiz' && <QuizView />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useHashRouter() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((path: Route) => {
    window.location.hash = path === '/' ? '' : path
  }, [])

  return { route, navigate }
}
