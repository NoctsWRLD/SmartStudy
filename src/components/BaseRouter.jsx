import { BrowserRouter } from 'react-router-dom'

const KEY = '__spa_redirect'

/**
 * BrowserRouter with a basename matching the build's base path, plus the
 * restore step for GitHub Pages.
 *
 * GitHub Pages serves files from disk, so an unknown path returns 404.html.
 * The build emits a 404.html that stashes the requested path in sessionStorage
 * and redirects to the app root. This component reads that stash on boot and
 * navigates there, so a hard refresh or a shared deep link lands on the right
 * route instead of a 404.
 *
 * `import.meta.env.BASE_URL` is whatever Vite resolved for this build
 * ('/' locally and on Vercel, '/Scribe/' on GitHub Pages), so the same
 * code works on every target. It always carries a trailing slash.
 */
export function BaseRouter({ children }) {
  const base = import.meta.env.BASE_URL

  const stored = sessionStorage.getItem(KEY)
  if (stored) {
    sessionStorage.removeItem(KEY)
    // base ends with '/', so strip any leading slash from the stored path
    // before joining to avoid a double slash.
    window.history.replaceState(null, '', base + stored.replace(/^\//, ''))
  }

  return <BrowserRouter basename={base}>{children}</BrowserRouter>
}
