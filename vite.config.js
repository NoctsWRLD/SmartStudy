import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The base path must match the URL the app is served from:
//   local dev and Vercel  -> /
//   GitHub Pages project -> /SmartStudy/
// It comes from the environment so the same codebase targets both.
//
// Vite keeps `base` verbatim in import.meta.env.BASE_URL. A base without a
// trailing slash therefore produces a broken join in the router
// ("/SmartStudy" + "dashboard" -> "/SmartStudydashboard"), so normalise once
// here and use the same value everywhere.
function normalizeBase(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : `${path}/`
}

// GitHub Pages serves static files only. An unknown path returns 404.html, so
// emit one that stashes the requested path and bounces back into the SPA.
// Without this, every client-side route 404s on a hard refresh or a shared link.
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const base = normalizeBase(process.env.BASE_PATH)
      // ESM: __dirname does not exist. Resolve from import.meta.url instead.
      const out = fileURLToPath(new URL('./dist/404.html', import.meta.url))
      writeFileSync(
        out,
        `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script>
      (function () {
        var base = ${JSON.stringify(base)};
        var l = window.location;
        var path = l.pathname.indexOf(base) === 0 ? l.pathname.slice(base.length) : l.pathname;
        if (path) sessionStorage.setItem('__spa_redirect', path + l.search + l.hash);
        l.replace(base);
      })();
    </script>
  </head>
  <body><p>Redirecting&hellip;</p></body>
</html>
`
      )
    },
  }
}

export default defineConfig({
  base: normalizeBase(process.env.BASE_PATH),
  plugins: [
    react(),
    tailwindcss(),
    githubPagesSpaFallback(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
})
