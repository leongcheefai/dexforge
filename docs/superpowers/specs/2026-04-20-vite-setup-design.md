# Vite Setup Design — DexForge

**Date:** 2026-04-20  
**Scope:** Scaffold the root-level Vite + React + TypeScript project, configure Tailwind CSS and shadcn/ui, install all runtime dependencies, and establish the feature-based folder structure.

---

## Architecture

Single-page app scaffolded at the repo root (no monorepo, no backend). The official Vite `react-ts` template provides the baseline. Tailwind CSS v4 (Vite plugin style) and shadcn/ui layer on top. All data is client-side — no server, deployable to any static host.

---

## Scaffold & Config

- `npm create vite@latest . -- --template react-ts` run at repo root
- **Tailwind CSS v4**: installed via `npm install -D tailwindcss @tailwindcss/vite`; Vite plugin added to `vite.config.ts`; `@import "tailwindcss"` in `src/index.css` — no `tailwind.config.ts` needed
- **shadcn/ui**: initialized via `npx shadcn@latest init`; writes `components.json` and `src/lib/utils.ts`; components added on-demand via `npx shadcn@latest add <component>` as features are built
- **Path alias**: `@/` → `src/` configured in both `tsconfig.app.json` (`paths`) and `vite.config.ts` (`resolve.alias`)

---

## Dependencies

**Runtime (installed upfront):**
- `react`, `react-dom` — UI framework
- `zustand` — global state, split into feature slices
- `idb-keyval` — IndexedDB cache for sprites and PokéAPI name responses
- `lucide-react` — icons

**Lazy-loaded (dynamic import, not in initial bundle):**
- `pdf-lib` — loaded only when the export modal opens, keeping initial bundle under 500KB gzipped

**Dev:**
- `typescript`, `@types/react`, `@types/react-dom`
- `tailwindcss`, `@tailwindcss/vite`
- `vite`, `@vitejs/plugin-react`

---

## Folder Structure

```
/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── components.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/
    │   └── utils.ts
    ├── components/
    │   └── ui/               # shadcn-generated components
    ├── features/
    │   ├── selection/        # Pokémon selection controls
    │   ├── customization/    # Card design controls
    │   ├── preview/          # Live card + page preview
    │   └── export/           # PDF export modal + logic
    └── store/
        └── index.ts          # Zustand store root (feature slices)
```

`App.tsx` renders the top-bar + sidebar + preview canvas shell with empty feature placeholders. The first milestone (Bulbasaur card preview) is implemented in `features/preview/`.

---

## Boilerplate Cleanup

Remove the default Vite boilerplate from `src/App.tsx`, `src/App.css`, and `src/assets/` after scaffolding — replace with the minimal shell layout.

---

## Out of Scope

- Feature implementation (selection, customization, PDF export)
- PWA / service worker setup
- ESLint / Prettier configuration
- CI/CD pipeline
