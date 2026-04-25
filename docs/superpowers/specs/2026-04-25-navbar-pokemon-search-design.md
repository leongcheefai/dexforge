# Navbar Pokémon Search — Design Spec

**Date:** 2026-04-25

## Goal

Let users search for a Pokémon by name from the navbar and have it set the selection range to that single Pokémon (fromId = toId = selectedId). User still clicks Generate manually to render cards.

## Keyboard Shortcut

- `Ctrl+K` (Windows/Linux) / `Cmd+K` (Mac) opens the search popover
- `Escape` closes without selecting

## Data Layer

**File:** `src/lib/pokemon-name-list.ts`

- Fetches `https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0` once on app mount (background, non-blocking — does not block render)
- Parses response into `{name: string, id: number}[]` (1025 entries)
- Caches result in IndexedDB via `idb-keyval` under key `'pokemon-name-list'`
- On subsequent loads: reads from IndexedDB, no network request
- Exported as `loadPokemonNameList(): Promise<{name: string, id: number}[]>`

## UI Component

**File:** `src/features/selection/NavSearch.tsx`

### Trigger (always visible in navbar)
- Button styled to match navbar: search icon + placeholder text "Search Pokémon…" + keyboard hint (`⌃K` on Mac, `Ctrl K` on others)
- Positioned between the logo and the right-side controls in `App.tsx` navbar

### Popover + Command
- Uses shadcn `<Popover>` + `<Command>` (cmdk)
- Opens on trigger click or Ctrl+K / Cmd+K
- `<CommandInput>` autofocused when popover opens
- `<CommandList>` displays filtered results: `#001 Bulbasaur` format (zero-padded 3-digit ID)
- cmdk handles filtering internally (substring match on display string)
- Max visible items: scrollable list (cmdk default)

### Selection behavior
- Clicking a result: calls `setFromId(id)` + `setToId(id)` from selection store, closes popover
- Does NOT call `generate()` — user clicks Generate manually
- Escape: closes popover, no state change

## Navbar Integration

`App.tsx` header: insert `<NavSearch>` between logo `<div>` and right-side controls `<div>`.

## Performance

- Single 50KB network request, fired once on mount, non-blocking
- IndexedDB cache: instant on repeat visits
- cmdk filters 1025 items synchronously — no debounce needed at this scale
- `NavSearch` calls `loadPokemonNameList()` in its own `useEffect` on mount, stores result in local state — `App.tsx` does not need to know about it

## Files Changed

| File | Change |
|------|--------|
| `src/lib/pokemon-name-list.ts` | New — fetch + cache Pokémon name list |
| `src/features/selection/NavSearch.tsx` | New — search UI component |
| `src/App.tsx` | Add `<NavSearch>` to navbar |
