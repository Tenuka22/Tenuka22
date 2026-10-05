# Handover

Personal portfolio site for **Tenuka Omaljith** — website developer, systems engineer, backend architect.

Stack: TanStack Start (React 19, SSR, file-based routing) on Vite, Tailwind v4, Motion, Lenis. Deployed to Vercel via Nitro.

---

## Getting started

```bash
bun install
bun run dev          # http://localhost:4001
```

| Script                | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `bun run dev`         | Dev server on port 4001                             |
| `bun run build`       | Production build                                    |
| `bun run check`       | Ultracite lint + format check                       |
| `bun run fix`         | Ultracite lint + format autofix                     |
| `bun run typecheck`   | `tsc --noEmit`                                      |
| `bun run test`        | Vitest                                              |
| `bun run screenshots` | Re-capture project card screenshots                 |
| `bun run brand`       | Regenerate every brand asset from `public/logo.png` |

Both asset scripts need a local Chrome/Chromium. They look at `CHROME_PATH` first, then the usual per-OS install paths.

---

## Layout

```
public/
  logo.png            source raster, 623x623 — the single source of truth
  logo.svg            traced vector mark, fill:currentColor
  favicon.svg         same mark on a filled tile
  favicon.ico         16/32/48/64 multi-resolution
  icon-192/512.png    manifest icons
  icon-maskable.png   manifest icon, mark inset for circular masks
  apple-touch-icon.png
  og-image.png        1200x630 social card
  manifest.json
  projects/*.webp     1280x720 screenshots, one per project
scripts/
  lib/chrome.ts       Chrome resolution + launch, shared by both scripts
  capture-project-screenshots.ts
  generate-brand-assets.ts
src/
  data/projects.ts    project case-study content
  components/         site-nav, navigation-footer, motion/, sections/
  routes/             __root.tsx (head/manifest), index.tsx
  styles.css          design tokens, light + dark
```

---

## Two things worth knowing before you change anything

### 1. Project content lives in one file

`src/data/projects.ts` is the only place project content is defined. Each entry carries its own `url`, `image`, requirements list and build notes, and drives both the card and the slide-out drawer.

To add a project: add an entry, then run `bun run screenshots <slug>` to capture its card image. The card links `url` directly, so the new project must be live before you screenshot it.

Entries added this session:

- `aloysiusadmissions` — Grade 1 admissions portal, `admissions.aloysiuscollege.lk`
- `lithon` — statically-typed Python-syntax language compiler, `project-lithon.github.io`

`stephanstyremart` now sits last in the array; the order is the display order.

### 2. Brand assets are generated, not hand-drawn

`public/logo.png` is the source. `bun run brand` traces it and writes every other brand file. **Do not hand-edit the generated files** — the next run overwrites them.

The trace is a real vectorisation, not an approximation:

1. Chrome decodes the PNG to a 512×512 luminance field.
2. Marching squares finds every contour above luminance 128, interpolating crossings along each edge so curves stay round.
3. Douglas-Peucker simplification at 0.9px tolerance reduces the result to ~300 points across 9 contours.
4. The SVG is rasterised by Chrome at each icon size and packed into the ICO.

Two details that are load-bearing, both found by looking at broken output:

- **Contours chain by grid-edge identity, not by coordinates.** Each crossing sits on a grid edge shared by exactly two cells. Matching on coordinates instead lets contours at an ambiguous lattice vertex join unrelated regions, which showed up as diagonal slashes across the mark.
- **The two saddle cases (5 and 10) are resolved by the cell's centre sample.** Those are the only configurations where four edges are crossed and the pairing is genuinely ambiguous. The centre lies inside the cell, so every cell reaches the same verdict.

If you change `TRACE_SIZE`, `SIMPLIFY_TOLERANCE` or `THRESHOLD` at the top of the script, re-run and actually look at `icon-512.png`. Both bugs above produced a plausible-looking trace count and visibly wrong artwork.

### Colour

The mark is white-on-near-black (`#0b0b0d` tile, `#f4f4f5` stroke), so the favicon holds up on both light and dark browser chrome. The site theme independently follows `prefers-color-scheme` with a manual override.

---

## Current state

Verified: `bun run typecheck` passes, `bun run check` reports no errors in any file touched this session. Nav renders correctly in both themes.

Outstanding, not started:

- Pre-existing lint errors unrelated to this work: `no-giant-component` on `ShapeGrid` (`src/components/motion/shape-grid.tsx`), and `no-permanent-will-change` warnings in `animated-badge.tsx` and `expandable-tabs.tsx`.
- No tests cover the project card or drawer.
- `src/logo.svg` is still the unused TanStack starter logo, left in place deliberately — deleting it is a separate call.
- `SITE_URL` in `src/routes/__root.tsx` is a placeholder. Canonical and Open Graph URLs will point somewhere wrong until the real domain is set.
