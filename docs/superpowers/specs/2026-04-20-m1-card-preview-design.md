# DexForge M1 — Card Preview + Export Design

**Date:** 2026-04-20
**Scope:** Milestone 1 — single Bulbasaur card preview with basic design controls, 3×3 page thumbnail, and full PDF export modal. Hardcoded to Pokémon #1; no selection or multi-card generation.

---

## Architecture

M1 introduces two feature slices (`preview`, `customization`) and a stub of the `export` slice. A single Zustand store slice (`cardSettings`) drives all three.

**New files:**
```
src/features/preview/
  PokemonCard.tsx        # Card component: sprite + name + number
  PageThumbnail.tsx      # 3×3 grid — slot 1 filled, slots 2–9 empty outlines
  PreviewCanvas.tsx      # Mounts PokemonCard (large) + PageThumbnail (small)

src/features/customization/
  CardSettingsPanel.tsx  # Sidebar section: border, colors, font, toggles
  store.ts               # Zustand slice for card settings

src/features/export/
  ExportModal.tsx        # Modal: paper size, crop marks, cover page, page range
  pdf.ts                 # pdf-lib logic (dynamically imported)

src/lib/
  useDebounce.ts         # Generic debounce hook (200ms)
```

`App.tsx` mounts `CardSettingsPanel` in the existing sidebar slot and `PreviewCanvas` in the existing main area slot. The "Export PDF" button in the top bar opens `ExportModal`.

---

## State

**`cardSettings` Zustand slice** (`src/features/customization/store.ts`):

```ts
interface CardSettings {
  borderStyle: 'solid' | 'dashed' | 'rounded' | 'none'
  borderColor: string       // hex, e.g. '#000000'
  backgroundColor: string   // hex, e.g. '#ffffff'
  fontFamily: string        // one of 6 curated options
  showName: boolean
  showNumber: boolean
}
```

Default values: solid border, black border color, white background, Inter font, both name and number shown.

All sidebar controls write to this slice. `PokemonCard` and `PageThumbnail` read from it. Color picker changes (`borderColor`, `backgroundColor`) are debounced 200ms via `useDebounce` since the picker fires on every drag pixel; all other controls update immediately.

---

## Card Component

`PokemonCard` renders a single card at `aspect-ratio: 63/88`. Hardcoded to Pokémon #1 (Bulbasaur) in M1. Reads all visual settings from the `cardSettings` store.

**Sprite URL:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png`

**Layout (top to bottom):**
1. Pokémon number (`#001`) — hidden when `showNumber` is false
2. Sprite image — centered, ~60% of card height; loading skeleton shown while fetching from GitHub CDN
3. Pokémon name (`Bulbasaur`) — hidden when `showName` is false

**Styling:**
- `borderStyle` maps to Tailwind border classes: `border` (solid), `border border-dashed` (dashed), `rounded-xl border` (rounded), `border-0` (none)
- `borderColor` and `backgroundColor` applied as inline styles — arbitrary user colors cannot use Tailwind classes
- `fontFamily` applied as inline `fontFamily` style

Name and number are hardcoded strings in M1. PokéAPI fetching and IndexedDB caching are deferred to the selection milestone.

**Sprite CORS:** `raw.githubusercontent.com` serves `Access-Control-Allow-Origin: *`. The `<img>` element must set `crossOrigin="anonymous"` so the sprite can be drawn to an offscreen canvas without tainting it. For pdf-lib, the sprite is fetched as `ArrayBuffer` via `fetch()` (same CORS headers apply).

---

## Customization Sidebar

`CardSettingsPanel` is a collapsible sidebar section (shadcn/ui `Collapsible`) with heading "Card Design". All changes are live — no Apply button.

| Setting | UI Control |
|---|---|
| Border style | 4-button group: Solid / Dashed / Rounded / None |
| Border color | `<input type="color">` |
| Background color | `<input type="color">` |
| Font family | `<select>` — Inter, Geist, Roboto, Merriweather, Space Mono, Lobster |
| Show name | shadcn/ui `Switch` |
| Show number | shadcn/ui `Switch` |

Changes to `borderColor` and `backgroundColor` are debounced 200ms (color picker fires on every drag pixel). The 6 font families (Inter, Geist, Roboto, Merriweather, Space Mono, Lobster) are loaded via a single Google Fonts `<link>` in `index.html`.

---

## 3×3 Page Thumbnail

`PageThumbnail` renders a ~240px wide read-only preview of the printed page. A 3×3 CSS grid (`grid-cols-3`) of card-aspect-ratio slots with small gaps representing print gutters. Slot 1 renders a miniature `PokemonCard`; slots 2–9 show dashed-border empty outlines. Sits below the large card in `PreviewCanvas`, with a "Page preview" label.

---

## Export Modal + PDF Generation

`ExportModal` is a shadcn/ui `Dialog` opened by the "Export PDF" top-bar button and `Cmd/Ctrl+E`.

**Modal controls:**

| Setting | UI |
|---|---|
| Paper size | Radio group: A4 / Letter |
| Include crop marks | Checkbox |
| Include cover page | Checkbox |
| Page range | Text input — pre-filled `1` and disabled in M1 (only 1 page) |
| Generate PDF | Primary button with spinner |

**PDF generation** (`export/pdf.ts`):
- `pdf-lib` is dynamically imported on modal open (`await import('pdf-lib')`) — keeps initial bundle under 500KB
- Card rendered to PNG via offscreen `<canvas>` using current `cardSettings`
- Page dimensions: A4 = 595.28 × 841.89pt, Letter = 612 × 792pt
- Card placed at exact 63mm × 88mm — converted to points via `mm × 2.8346`
- Crop marks: thin lines (0.5pt) drawn at each card corner if enabled
- Cover page (if enabled): blank page with "DexForge" title and fan-made disclaimer
- Success: browser file download (`dexforge.pdf`) + toast notification
- Failure: toast notification with error message

---

## Out of Scope (deferred to later milestones)

- Pokémon selection controls (all 1025, by gen, custom range, search)
- PokéAPI name fetching and IndexedDB caching
- Multi-card PDF generation and progress indicator
- Image style picker (sprite variants)
- Preset save/load
- PWA / service worker
- Language support
- Generation badge toggle
- Silhouette mode
