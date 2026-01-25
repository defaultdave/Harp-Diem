/**
 * Simple hash-based router for client-side navigation.
 * @packageDocumentation
 */
import { useState, useEffect, useCallback } from 'react'

export type Route = '/' | '/quiz'

function parseHash(): Route {
  const hash = window.location.hash
  if (hash === '#/quiz') return '/quiz'
  return '/'
}

/**
 * Hash-based router hook for navigation between pages.
 * Uses hash routing to work with GitHub Pages without server-side rewrites.
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
