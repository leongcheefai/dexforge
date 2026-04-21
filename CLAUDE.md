# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b && vite build
npm run lint      # ESLint (flat config)
npm run preview   # Preview production build
```

Run `npm run build` before commit/push — catch TypeScript + build errors.

No test framework yet.

## Architecture

**PaperDex** — fully client-side SPA for generating customizable printable Pokémon card placeholder PDFs (binder placeholders). No backend.

**Stack**: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui (radix-nova preset) + Zustand v5 + pdf-lib + idb-keyval

**Feature-based structure** under `src/features/`:
- `selection/` — Pokémon picking UI (presets, search, range picker, multi-select)
- `customization/` — Card design controls (border, colors, fonts, gradients, toggles)
- `preview/` — Live canvas (single card + 3×3 page layout)
- `export/` — PDF generation with `pdf-lib`

Each feature owns own Zustand slice (e.g., `src/features/selection/store.ts`). Global store composition in `src/store/index.ts`.

**Data**: PokéAPI for names (multi-language), raw GitHub sprite URLs (PokeAPI/sprites repo, 7 style variants). Sprites + API responses cached in IndexedDB via `idb-keyval`; presets in localStorage.

**Key decisions**:
- `pdf-lib` lazy-loaded at export time — keeps initial bundle small
- Sprite styles (Gen 1–5 pixel art) auto-fallback to wider-coverage style when Pokémon not in that era
- Path alias `@/` → `src/`
- shadcn/ui uses radix-nova style (non-default), CSS variables, dark mode first-class