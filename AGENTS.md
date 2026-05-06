# AGENTS.md

## Project overview

This repository is the static GitHub Pages site for `https://esoltys.github.io` / Eric James Soltys. It is a small hand-authored front-end project: no package manager, no build step, and no framework.

Primary files:

- `index.html` — complete page markup, metadata, Open Graph tags, Schema.org JSON-LD, content sections, and external asset links.
- `styles.css` — all visual styling, responsive layout, color tokens, animation keyframes, light/dark theme handling, and component classes.
- `script.js` — small progressive-enhancement layer for reveal animations, desktop parallax, album-art hover motion, smooth anchor scrolling, and console branding.
- `images/` — committed production images referenced by `index.html`.
- `favicon.ico` — site favicon.
- `tmp/` — local scratch/source assets; ignored locally and not part of the production site.

## Commands

There is currently no install/build/test pipeline.

Useful local commands:

- Preview the site locally:
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000/`
- Check repository state before and after edits:
  - `git status --short`
- Find project references quickly:
  - `rg "search text" index.html styles.css script.js`
- Optional ad-hoc HTML validation if Node/npm is available:
  - `npx --yes html-validate index.html`
- Optional link/accessibility/browser checks should be run manually in a browser because this is a static page with external services and CDN assets.

## Deployment

This is the `esoltys.github.io` repository on the `main` branch. GitHub Pages serves the checked-in static files directly. Any committed change to production files can affect the live site after push.

## Coding style

### HTML

- Use semantic HTML sections and clear comments matching the existing structure.
- Keep indentation at 2 spaces.
- Prefer explicit accessibility attributes for icon-only or visually condensed links (`aria-label`, useful `alt` text, `rel="noopener noreferrer"` for new tabs).
- Preserve SEO/social metadata when changing identity, profile, or music content:
  - `<title>` and meta description
  - Open Graph tags
  - Schema.org JSON-LD blocks
- Image paths are relative (`./images/...`) in page content; favicon uses an absolute root path with cache-busting query.
- Add `loading="lazy"` to non-critical images.

### CSS

- The design uses a custom-property token system in `:root` for palette, typography scale, spacing, borders, and easings. Reuse existing variables before adding new constants.
- Dark mode is the default; light mode is handled with `@media (prefers-color-scheme: light)`.
- Keep component styles grouped under the existing section headers.
- Maintain responsive breakpoints at `768px` and `480px` unless there is a strong reason to add another.
- Preserve motion polish, but avoid changes that make the page distracting or inaccessible. Consider `prefers-reduced-motion` if adding larger animations.
- Current typography depends on Google Fonts (`JetBrains Mono`, `DM Serif Text`) and Tabler Icons CDN classes.

### JavaScript

- Use plain browser JavaScript only; do not introduce dependencies for simple interactions.
- Keep JS progressive: the page should remain usable if `script.js` fails or is blocked.
- Guard desktop-only effects with media queries as currently done (`min-width: 769px`).
- Use `requestAnimationFrame` for scroll-driven visual updates.
- Avoid storing user data or adding tracking beyond the existing GoatCounter script unless explicitly requested.

## Content model

The page is a personal landing page with these main areas:

1. Header/profile and location
2. Social links: Instagram, Threads, Bluesky
3. Professional section: senior developer positioning, LinkedIn, GitHub
4. Music section: streaming links, featured album, album list, radio distribution note
5. Other links: Contour, Substack, Redbubble, Imgur

When updating music releases, update all relevant places together:

- Visible album/link markup in `index.html`
- Album cover image in `images/`
- `MusicAlbum` JSON-LD in the second schema block
- Open Graph image if the featured/social image changes
- Any CSS only if layout assumptions change

## External dependencies and services

- Tabler Icons webfont via jsDelivr CDN.
- Google Fonts for typography.
- GoatCounter analytics: `https://esoltys.goatcounter.com/count` loaded from `//gc.zgo.at/count.js`.
- External profile/music links to LinkedIn, GitHub, Instagram, Threads, Bluesky, YouTube Music, Spotify, Apple Music, Bandcamp, !earshot, Substack, Redbubble, and Imgur.

Be careful when editing external URLs: preserve exact playlist/profile IDs and use HTTPS where available.

## Gotchas

- There is no bundler to catch broken paths, missing classes, invalid HTML, or JavaScript syntax errors. Manually preview after changes.
- GitHub Pages is case-sensitive for asset paths; match filenames exactly.
- The site relies on external CDNs, so local preview may look different if offline or blocked.
- `tmp/` contains scratch/source assets and should not be referenced from production HTML or committed unless intentionally promoting an asset into `images/`.
- Keep production images reasonably small; this is a single static page and image weight directly affects load time.
- The repository may contain local/editor-specific state. Always inspect `git status --short` and do not overwrite or revert unrelated user changes.

## Suggested change workflow for agents

1. Read `index.html`, `styles.css`, and `script.js` before broad changes.
2. Make the smallest coherent edit.
3. Run `git status --short`.
4. Preview locally with `python3 -m http.server 8000` for layout/content changes.
5. Check desktop and mobile widths, and both light/dark color schemes when CSS is touched.
6. For content/link changes, verify links and update structured metadata consistently.
