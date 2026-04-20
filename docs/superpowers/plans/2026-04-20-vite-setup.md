# Vite Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a root-level Vite + React 18 + TypeScript project with Tailwind CSS v4, shadcn/ui, and the feature-based folder structure defined in the DexForge spec.

**Architecture:** Single-page app at the repo root — no monorepo, no backend. Vite `react-ts` template is the baseline; Tailwind v4 (via `@tailwindcss/vite` plugin) and shadcn/ui layer on top. All deps installed upfront except `pdf-lib`, which will be dynamically imported later.

**Tech Stack:** Vite 6, React 18, TypeScript 5, Tailwind CSS v4, shadcn/ui, Zustand, idb-keyval, lucide-react, pdf-lib (lazy)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Created by scaffold | App entry point |
| `vite.config.ts` | Created then modified | Vite config — React plugin, Tailwind plugin, `@/` alias |
| `tsconfig.json` | Created by scaffold | TS project references |
| `tsconfig.app.json` | Created then modified | TS compiler options — adds `paths` for `@/` alias |
| `package.json` | Created then modified | Deps and scripts |
| `components.json` | Created by shadcn init | shadcn/ui config |
| `src/main.tsx` | Created by scaffold | React root mount |
| `src/App.tsx` | Created then replaced | Top-bar + sidebar + canvas shell |
| `src/index.css` | Created then replaced | Tailwind import only |
| `src/lib/utils.ts` | Created by shadcn init | `cn()` helper |
| `src/components/ui/` | Created (empty dir) | shadcn component output |
| `src/features/selection/` | Created (empty dir) | Pokémon selection feature |
| `src/features/customization/` | Created (empty dir) | Card design feature |
| `src/features/preview/` | Created (empty dir) | Card preview feature |
| `src/features/export/` | Created (empty dir) | PDF export feature |
| `src/store/index.ts` | Created | Zustand store root stub |

---

### Task 1: Scaffold the Vite project

**Files:**
- Create: `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `package.json`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Run the Vite scaffold command**

```bash
npm create vite@latest . -- --template react-ts
```

The directory already contains `docs/` — Vite will prompt:
> "Current directory is not empty. Please choose how to proceed"

Select: **Ignore files and continue**

Expected output ends with:
```
Done. Now run:
  npm install
  npm run dev
```

- [ ] **Step 2: Verify scaffold files exist**

```bash
ls index.html vite.config.ts tsconfig.json tsconfig.app.json package.json src/main.tsx src/App.tsx src/index.css
```

Expected: all files listed, no "No such file" errors.

- [ ] **Step 3: Install scaffold deps**

```bash
npm install
```

Expected: `node_modules/` created, no peer-dep errors.

- [ ] **Step 4: Confirm dev server starts**

```bash
npm run dev
```

Expected output includes:
```
VITE v6.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Press `q` to stop.

- [ ] **Step 5: Commit**

```bash
git init
git add index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json package.json package-lock.json src/main.tsx src/App.tsx src/App.css src/index.css src/assets/ public/
git commit -m "chore: scaffold vite react-ts project"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json` (npm writes this)

- [ ] **Step 1: Install runtime deps**

```bash
npm install zustand idb-keyval lucide-react pdf-lib
```

Expected: added to `dependencies` in `package.json`, no peer-dep errors.

- [ ] **Step 2: Install @types/node (needed for path resolution in vite.config.ts)**

```bash
npm install -D @types/node
```

- [ ] **Step 3: Verify installs**

```bash
node -e "require('./node_modules/zustand/package.json'); console.log('ok')"
node -e "require('./node_modules/idb-keyval/package.json'); console.log('ok')"
node -e "require('./node_modules/lucide-react/package.json'); console.log('ok')"
node -e "require('./node_modules/pdf-lib/package.json'); console.log('ok')"
```

Expected: four `ok` lines.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install runtime deps (zustand, idb-keyval, lucide-react, pdf-lib)"
```

---

### Task 3: Configure Tailwind CSS v4

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Install Tailwind v4 and its Vite plugin**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Replace vite.config.ts with Tailwind plugin added**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 3: Replace src/index.css with Tailwind import only**

```css
@import "tailwindcss";
```

- [ ] **Step 4: Verify Tailwind classes render**

```bash
npm run dev
```

Open `http://localhost:5173/`. The default Vite page should still render. In the browser console run:

```js
document.body.style.backgroundColor = 'rgb(0,0,0)'
```

Then add `className="bg-red-500 p-4"` to the `<div>` in `src/App.tsx` temporarily — confirm the element turns red in the browser. Revert the change.

Press `q` to stop.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts src/index.css package.json package-lock.json
git commit -m "chore: configure tailwind css v4"
```

---

### Task 4: Configure `@/` path alias

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Update vite.config.ts to add resolve alias**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Update tsconfig.app.json to add paths**

Open `tsconfig.app.json`. It will look roughly like:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

Add `baseUrl` and `paths` inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Verify the alias resolves**

Create a temporary file `src/lib/utils.ts` with content:

```ts
export const hello = 'world'
```

Then in `src/App.tsx`, add at the top:

```ts
import { hello } from '@/lib/utils'
console.log(hello)
```

Run:

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. Then revert the `import` line from `App.tsx` (keep `src/lib/utils.ts` — shadcn will replace it anyway).

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts tsconfig.app.json src/lib/utils.ts
git commit -m "chore: configure @/ path alias"
```

---

### Task 5: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `src/lib/utils.ts` (shadcn overwrites with its own `cn()` version)
- Create: `src/components/ui/` (empty dir, shadcn target)

- [ ] **Step 1: Run shadcn init**

```bash
npx shadcn@latest init
```

Answer the interactive prompts as follows:

| Prompt | Answer |
|---|---|
| Which style would you like to use? | **Default** |
| Which color would you like to use as the base color? | **Neutral** |
| Would you like to use CSS variables for theming? | **Yes** |

shadcn will write `components.json` and update `src/index.css` to add CSS variable definitions and `src/lib/utils.ts` with the `cn()` helper.

- [ ] **Step 2: Verify components.json was created**

```bash
cat components.json
```

Expected: JSON with `"style": "default"`, `"tailwind": { ... }`, `"aliases": { "components": "@/components", ... }`.

- [ ] **Step 3: Verify src/lib/utils.ts contains cn()**

```bash
cat src/lib/utils.ts
```

Expected output:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 5: Commit**

```bash
git add components.json src/lib/utils.ts src/index.css package.json package-lock.json
git commit -m "chore: initialize shadcn/ui"
```

---

### Task 6: Create feature folder structure

**Files:**
- Create: `src/features/selection/.gitkeep`
- Create: `src/features/customization/.gitkeep`
- Create: `src/features/preview/.gitkeep`
- Create: `src/features/export/.gitkeep`
- Create: `src/components/ui/.gitkeep`
- Create: `src/store/index.ts`

- [ ] **Step 1: Create feature directories**

```bash
mkdir -p src/features/selection src/features/customization src/features/preview src/features/export src/components/ui
touch src/features/selection/.gitkeep src/features/customization/.gitkeep src/features/preview/.gitkeep src/features/export/.gitkeep src/components/ui/.gitkeep
```

- [ ] **Step 2: Create Zustand store stub**

Create `src/store/index.ts`:

```ts
// Feature slices are added here as each feature is built.
// Each feature exports a slice: import { useSelectionStore } from '@/features/selection/store'
export {}
```

- [ ] **Step 3: Verify structure**

```bash
find src -type f | sort
```

Expected output includes:
```
src/App.css
src/App.tsx
src/assets/react.svg
src/components/ui/.gitkeep
src/features/customization/.gitkeep
src/features/export/.gitkeep
src/features/preview/.gitkeep
src/features/selection/.gitkeep
src/index.css
src/lib/utils.ts
src/main.tsx
src/store/index.ts
```

- [ ] **Step 4: Commit**

```bash
git add src/features/ src/components/ui/.gitkeep src/store/index.ts
git commit -m "chore: create feature folder structure and store stub"
```

---

### Task 7: Replace boilerplate with App shell

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/App.css`
- Delete: `src/assets/react.svg`

- [ ] **Step 1: Delete boilerplate files**

```bash
rm src/App.css src/assets/react.svg
```

- [ ] **Step 2: Replace src/App.tsx with the minimal shell**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-4">
        <span className="font-semibold tracking-tight">DexForge</span>
        <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Export PDF
        </button>
      </header>
      <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <aside className="w-80 border-r overflow-y-auto p-4 shrink-0">
          {/* Controls sidebar — features/selection, features/customization mount here */}
        </aside>
        <main className="flex-1 flex items-center justify-center">
          {/* Preview canvas — features/preview mounts here */}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Verify shell renders in browser**

```bash
npm run dev
```

Open `http://localhost:5173/`. Expected:
- Dark background (shadcn/ui CSS vars active)
- "DexForge" label top-left
- "Export PDF" button top-right
- Empty sidebar left, empty main area right

Press `q` to stop.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git rm src/App.css src/assets/react.svg
git commit -m "feat: replace vite boilerplate with dexforge app shell"
```

---

### Task 8: Final verification

- [ ] **Step 1: Clean install**

```bash
rm -rf node_modules
npm install
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: `dist/` created, no errors. Check bundle size:

```bash
ls -lh dist/assets/*.js | sort -k5 -rh | head -5
```

The main bundle should be well under 500KB (pdf-lib is not imported yet).

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev
```

Open `http://localhost:5173/`. Confirm:
- App shell renders (DexForge header, Export PDF button, empty panes)
- No console errors

Press `q` to stop.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: verify clean install and build"
```
