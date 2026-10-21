import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// GitHub Pages serves static files only. An unknown path returns 404.html, so
// emit one that stashes the requested path and bounces back into the SPA.
// Without this, every client-side route 404s on a hard refresh or a shared link.
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const base = process.env.BASE_PATH || '/'
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
        sessionStorage.setItem('__spa_redirect', path + l.search + l.hash);
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
  // The base path must match the URL the app is served from:
  //   local dev and Vercel  -> /
  //   GitHub Pages project -> /SmartStudy/
  // It comes from the environment so the same codebase targets both.
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    githubPagesSpaFallback(),
  ],
})
