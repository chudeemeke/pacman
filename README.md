# Pac-Man PWA (Offline, Mobile-first)

A clean, modern, offline-ready Pac-Man built with Canvas and vanilla ES Modules. Deploys automatically to GitHub Pages.

## CI/CD (GitHub Pages)
- Workflow: `.github/workflows/deploy.yml`
- Triggers: push to `main` or manual dispatch
- Steps: checkout → configure pages → copy `index.html` to `404.html` (SPA fallback) → upload → deploy

## Self-updating PWA
- `sw.js` uses network-first for HTML and stale-while-revalidate for assets.
- `pwa.js` forces the new Service Worker to `skipWaiting` and reloads clients once activated.
- Fresh builds take effect immediately after page load (or within ~30s due to periodic update polling).

## Run locally
- `python -m http.server 8080` or `npx serve -p 8080`
- Visit `http://localhost:8080`
- Add to Home Screen on iPhone for a fullscreen PWA.

## Structure
See repository tree for all files.

## 🤖 CI/CD Auto-Fix

This repository uses Claude AI to automatically fix CI/CD failures.
If builds fail, Claude will automatically create a fix PR.

