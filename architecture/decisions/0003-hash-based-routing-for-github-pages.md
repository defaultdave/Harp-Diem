# ADR-0003: Hash-Based Routing for GitHub Pages

## Status
Accepted

## Context
The application is deployed to GitHub Pages, which serves static files and does not support server-side URL rewrites. Standard client-side routing (e.g., `/quiz`) would result in 404 errors on page refresh because GitHub Pages looks for a literal `/quiz/index.html` file.

Options considered:
1. **React Router with BrowserRouter** - Requires 404.html hack or server config
2. **React Router with HashRouter** - Uses URL hash (`/#/quiz`)
3. **Custom hash router** - Minimal implementation for simple needs
4. **Next.js/Gatsby** - SSG frameworks with built-in routing

## Decision
Implement a **custom hash-based router** via `useHashRouter` hook.

Routes use the URL hash:
- `/#/` or `/#` - Home page (harmonica visualization)
- `/#/quiz` - Quiz page

The hook:
- Listens to `hashchange` events
- Parses `window.location.hash`
- Returns current route for conditional rendering

## Consequences

### Positive
- Works perfectly with GitHub Pages (no server config needed)
- Zero dependencies (no react-router)
- Minimal code (~50 lines)
- URLs are shareable and bookmarkable
- Page refresh works correctly

### Negative
- Hash in URL is less "clean" than path-based routing
- SEO implications (though minimal for this app)
- Limited compared to full routing library (no nested routes, params parsing)

### Neutral
- Could migrate to React Router HashRouter if routing needs grow
- Hash portion not sent to server (irrelevant for static hosting)

---
*Created: 2026-01-25 by [architect]*
