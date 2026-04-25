# Navbar Pokémon Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline navbar search that lets users find a Pokémon by name or number and jump to it (sets fromId = toId), triggered by clicking the search bar or pressing Ctrl+K / Cmd+K.

**Architecture:** Three new files: a data utility that fetches and caches the full Pokémon name list from PokeAPI, a Popover UI primitive wrapping Radix (matching existing shadcn patterns), and a NavSearch component that wires them together. App.tsx navbar is updated to include NavSearch.

**Tech Stack:** React 19, TypeScript, Radix UI (via `radix-ui` unified package), idb-keyval, Zustand, Tailwind CSS v4, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/pokemon-name-list.ts` | Create | Fetch Pokémon list from PokeAPI, cache in IndexedDB |
| `src/components/ui/popover.tsx` | Create | Radix Popover primitive wrapped as shadcn component |
| `src/features/selection/NavSearch.tsx` | Create | Search trigger, popover, filtered list, keyboard shortcut |
| `src/App.tsx` | Modify | Add `<NavSearch />` to navbar header |

---

## Task 1: Pokémon Name List Utility

**Files:**
- Create: `src/lib/pokemon-name-list.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/pokemon-name-list.ts
import { get, set } from 'idb-keyval'

export type PokemonNameEntry = { name: string; id: number }

const CACHE_KEY = 'pokemon-name-list'

export async function loadPokemonNameList(): Promise<PokemonNameEntry[]> {
  const cached = await get<PokemonNameEntry[]>(CACHE_KEY)
  if (cached) return cached

  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0')
  const data = (await res.json()) as { results: { name: string; url: string }[] }

  const entries: PokemonNameEntry[] = data.results
    .map(({ name, url }) => ({
      name,
      id: parseInt(url.split('/').filter(Boolean).pop()!, 10),
    }))
    .filter((e) => e.id >= 1 && e.id <= 1025)

  await set(CACHE_KEY, entries)
  return entries
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: no errors in `src/lib/pokemon-name-list.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/pokemon-name-list.ts
git commit -m "feat: add pokemon name list fetcher with IndexedDB cache"
```

---

## Task 2: Popover UI Primitive

**Files:**
- Create: `src/components/ui/popover.tsx`

- [ ] **Step 1: Create the file**

Follow the same Radix import pattern used in `select.tsx` and `dialog.tsx` (import from `"radix-ui"` unified package).

```tsx
// src/components/ui/popover.tsx
import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: no errors in `src/components/ui/popover.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/popover.tsx
git commit -m "feat: add Popover UI primitive"
```

---

## Task 3: NavSearch Component

**Files:**
- Create: `src/features/selection/NavSearch.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/features/selection/NavSearch.tsx
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSelectionStore } from '@/features/selection/store'
import { loadPokemonNameList, type PokemonNameEntry } from '@/lib/pokemon-name-list'

function formatId(id: number) {
  return `#${String(id).padStart(3, '0')}`
}

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const isMac =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

export function NavSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<PokemonNameEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { setFromId, setToId } = useSelectionStore()

  useEffect(() => {
    loadPokemonNameList().then(setItems)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
    }
  }, [open])

  const filtered =
    query.trim() === ''
      ? items.slice(0, 50)
      : items
          .filter(
            (p) =>
              p.name.includes(query.toLowerCase()) ||
              String(p.id).includes(query.trim())
          )
          .slice(0, 50)

  function handleSelect(id: number) {
    setFromId(id)
    setToId(id)
    setOpen(false)
  }

  const hint = isMac ? '⌘K' : 'Ctrl K'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Search Pokémon"
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-input bg-transparent text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:block">Search Pokémon…</span>
          <span
            className="hidden sm:block text-[10px] tracking-widest text-muted-foreground/60"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {hint}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <div className="border-b border-border px-3 py-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or number…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
          ) : (
            filtered.map((p) => (
              <li key={p.id} role="option">
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                  onClick={() => handleSelect(p.id)}
                >
                  <span
                    className="text-muted-foreground text-xs w-10 shrink-0"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {formatId(p.id)}
                  </span>
                  <span>{formatName(p.name)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: no errors in `src/features/selection/NavSearch.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/features/selection/NavSearch.tsx
git commit -m "feat: add NavSearch component with Ctrl+K shortcut"
```

---

## Task 4: Wire NavSearch Into Navbar

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add NavSearch import and update navbar layout**

Current navbar in `App.tsx` uses `justify-between` for logo + right controls. Adding NavSearch requires restructuring to three elements. Replace `justify-between` with a gap-based layout and add a `flex-1` spacer so controls stay right-aligned.

Replace the entire `<header>` element:

```tsx
// Add import at top of file
import { NavSearch } from '@/features/selection/NavSearch'
```

Replace the `<header>` opening tag and its direct children (logo `<h1>` and right controls `<div>`):

```tsx
<header
  className="h-16 flex items-center gap-4 px-6 shrink-0 border-b border-border"
  style={{
    background: 'linear-gradient(to bottom, oklch(1 0 0), oklch(0.97 0.006 22))',
    boxShadow: '0 1px 0 oklch(0.52 0.22 25 / 0.18)',
  }}
>
  <h1 className="flex items-center gap-0.5 m-0 shrink-0" style={{ fontFamily: "'Cinzel', serif" }}>
    <span className="text-base font-semibold tracking-[0.18em] text-primary">
      PAPER
    </span>
    <span className="text-base font-light tracking-[0.18em] text-foreground/40 ml-1">
      DEX
    </span>
  </h1>

  <NavSearch />

  <div className="flex-1" />

  <div className="flex items-center gap-3">
    <span className="text-[10px] tracking-widest text-muted-foreground uppercase hidden sm:block" style={{ fontFamily: "'DM Mono', monospace" }}>
      ⌘P to print
    </span>
    <button
      onClick={() => setSupportOpen(true)}
      aria-label="Support PaperDex"
      className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-4 h-8 text-black font-semibold text-[11px] uppercase tracking-widest border border-black focus:outline-none"
      style={{ background: '#FFDD00' }}
    >
      ☕ support
    </button>
    <Button
      onClick={() => window.print()}
      disabled={printDisabled}
      size="sm"
      className="gap-1.5 uppercase tracking-widest text-[11px] font-semibold h-8 px-4"
    >
      <Download className="h-3 w-3" />
      {isPrefetching ? 'Loading…' : 'Print'}
    </Button>
  </div>
</header>
```

- [ ] **Step 2: Run build and verify no errors**

Run: `npm run build`
Expected: clean build, no TypeScript errors

- [ ] **Step 3: Start dev server and manually test**

Run: `npm run dev`

Test these scenarios:
1. Page loads → search bar visible in navbar between logo and right controls
2. Click search bar → popover opens with input focused, first 50 Pokémon listed
3. Type "pika" → list filters to show Pikachu (#025)
4. Type "25" → list shows Pokémon with "25" in their ID or name
5. Click a result → popover closes, fromId and toId are set (check sidebar shows custom range with that ID)
6. Press Ctrl+K (or Cmd+K on Mac) from anywhere on page → popover opens
7. Press Escape → popover closes without changing selection
8. Refresh page → name list loads from IndexedDB (check Network tab: no PokeAPI list request)

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add NavSearch to navbar with Ctrl+K shortcut"
```
