# TXT File Viewer

A lightweight React + TypeScript single-page app for uploading and viewing `.txt` files with in-file search, inspired by ChatGPT-like layout.

## Scripts

- `pnpm dev` — Start Vite dev server
- `pnpm build` — Type-check and build production bundle
- `pnpm preview` — Preview built app
- `pnpm test` — Run unit/integration tests (Vitest)
- `pnpm lint` — Lint with ESLint
- `pnpm format` — Format with Prettier

## Features

- Upload `.txt` with validation (type and 5MB limit)
- Sidebar file list; active state and hover effects
- Content bubbles with monospace font and paragraph splitting
- Per-file scroll position memory
- In-file search with highlighting and navigation
- Keyboard shortcuts: Cmd/Ctrl+F, Enter/Shift+Enter

## Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow to deploy to GitHub Pages when pushing to `main`.

If your repository uses project pages (e.g., `https://<user>.github.io/<repo>`), set a repository secret `BASE_URL` to `/<repo>/` so assets resolve correctly. Otherwise, default base `/` is used.

1. Push to `main`.
2. The workflow builds and publishes `dist/` to Pages.

## Notes

- No backend required; all data resides in memory.
- Tested with modern browsers.
- For large files near 5MB, UI remains responsive but search/highlighting may take longer.

