# DexForge — Printable Pokémon Binder Placeholder Generator

**Tagline**: Craft your Pokédex, one printable page at a time.

**Target User**: Pokémon TCG collectors building National Pokédex master sets who want customizable, printable placeholder cards for their binders — with full control over visual style, typography, and layout, without paying $5-10 for a static PDF on Etsy.

## MVP Features

- **Pokémon Selection**: Choose which Pokémon to generate — all 1025, a specific generation (Gen 1–9), a custom number range (e.g. 1–151), or individual Pokémon via multi-select with search-by-name/number.
- **Image Style Picker**: Swap between multiple sprite styles — Gen 5 Black/White (default), Official Artwork, Pokémon HOME 3D renders, Dream World SVG, Showdown animated (static frame), and classic generation sprites (Red/Blue, Gold, Ruby, Diamond, HeartGold, Black/White). All sourced from the public [PokéAPI sprites repo](https://github.com/PokeAPI/sprites).
- **Card Customization**: Live-editable design controls — border style (solid, dashed, rounded, none), border color, background color/gradient, font family (at least 6 curated options), font color, number format (`#001`, `No. 001`, `001/1025`), name display toggle, Pokédex number toggle, generation badge toggle, and silhouette "Who's That Pokémon?" mode.
- **Live Preview**: Real-time card preview as the user adjusts settings. Show 1 large card + a 3×3 page thumbnail so the user sees both card detail and the final printed layout.
- **PDF Export**: Generate a print-ready PDF with exact card dimensions (63mm × 88mm per card, 9 cards per A4/Letter page), crop marks, and optional page numbers. Client-side generation — no server round-trip.
- **Language Support**: Pokémon names in English, Japanese (日本語), German, French, Spanish, Italian, Korean — pulled from PokéAPI.
- **Preset Saving**: Save and load customization presets locally (localStorage) so users can reuse their favorite design across sessions.

## UI/UX Guidelines

**Design Style**: Modern, clean, developer-friendly. Think Linear or Vercel dashboard aesthetic — muted neutrals, one accent color (electric yellow as a Pikachu nod), generous whitespace, sharp typography (Inter or Geist). Dark mode first-class.

**Navigation**: Single-page app with a persistent split-pane layout — no routing needed. Sidebar for controls, main canvas for preview.

**Key Screens**:

- **Main Builder (single view)**:
  - **Left sidebar (320px, scrollable)** — collapsible sections:
    1. *Pokémon Selection* — preset dropdown (All, Gen 1–9, Custom Range, Custom List) + search input + number range inputs
    2. *Image Style* — visual picker with thumbnail previews of each sprite style
    3. *Card Design* — border, colors, fonts, gradients
    4. *Card Content* — toggles for name, number, generation badge, language selector
    5. *Presets* — save/load/delete custom presets
  - **Main area** — single large card preview (centered, ~400px wide) with a smaller 3×3 page thumbnail preview below it showing the printed layout
  - **Top bar** — app logo on the left, dark mode toggle + "Export PDF" primary button on the right
  - **Export modal** — paper size (A4/Letter), include crop marks toggle, include cover page toggle, page range selector, then "Generate PDF" button with progress indicator

**Interactions**:
- Debounced live preview (200ms) as user adjusts controls — no "Apply" button needed
- Virtualized Pokémon list in search (1025 items, render only visible)
- Drag-reorder for custom Pokémon list
- Toast notifications on PDF export success/failure
- Keyboard shortcut `Cmd/Ctrl + E` to open export modal
- Loading skeletons for sprite images (they load from GitHub CDN)

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Zustand (simple, avoids Redux boilerplate for a single-screen app)
- **PDF Generation**: `pdf-lib` (client-side, embeds images as PNG)
- **Data Source**: Direct fetch from `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/...` for images + [PokéAPI](https://pokeapi.co/) for localized names. Cache responses in IndexedDB via `idb-keyval` to avoid re-fetching on reload.
- **Persistence**: localStorage for user presets, IndexedDB for sprite/name cache
- **Icons**: lucide-react
- **Architecture**: Feature-based folder structure — `src/features/{selection,customization,preview,export}/` each with their own components, hooks, and store slice
- **Deployment**: Vercel or Cloudflare Pages (static site, no backend)

**Sprite URL patterns to support** (all public, no auth required):

```
Default (Gen 5 B/W):     /sprites/pokemon/{id}.png
Official Artwork:        /sprites/pokemon/other/official-artwork/{id}.png
Pokémon HOME:            /sprites/pokemon/other/home/{id}.png
Dream World (SVG):       /sprites/pokemon/other/dream-world/{id}.svg
Showdown (animated):     /sprites/pokemon/other/showdown/{id}.gif
Gen 1 Red/Blue:          /sprites/pokemon/versions/generation-i/red-blue/{id}.png
Gen 2 Gold:              /sprites/pokemon/versions/generation-ii/gold/{id}.png
Gen 3 Ruby/Sapphire:     /sprites/pokemon/versions/generation-iii/ruby-sapphire/{id}.png
Gen 4 Diamond/Pearl:     /sprites/pokemon/versions/generation-iv/diamond-pearl/{id}.png
Gen 5 Black/White:       /sprites/pokemon/versions/generation-v/black-white/{id}.png
```

Base URL: `https://raw.githubusercontent.com/PokeAPI/sprites/master`

**Style coverage by Pokémon ID**:

| Style | Coverage | Notes |
|---|---|---|
| Default pixel (BW-style) | #1–1025 ✅ | Full coverage — Gen 6–9 are fan-made in the repo, consistent with Gen 5 look |
| Official Artwork | #1–1025 ✅ | Full coverage |
| Pokémon HOME 3D | #1–1025 ✅ | Full coverage |
| Dream World SVG | #1–649 | Gen 1–5 only |
| Gen 1 Red/Blue | #1–151 | Kanto only (by design) |
| Gen 2 Gold | #1–251 | Up to Johto |
| Gen 3 Ruby/Sapphire | #1–386 | Up to Hoenn |
| Gen 4 Diamond/Pearl | #1–493 | Up to Sinnoh |
| Gen 5 Black/White | #1–649 | Up to Unova |

The five "classic generation" sprite options are **intentionally era-locked** — they represent how the Pokédex looked at that moment in history, so a Kanto-only Red/Blue binder is a feature, not a bug. When a user picks, say, "Gen 3 Ruby/Sapphire" and their selection includes Pokémon #387+, show a friendly warning ("Ruby/Sapphire sprites only exist for #1–386; later Pokémon will fall back to default pixel style") and auto-fallback to the default path for out-of-range IDs.

## Constraints

- **No backend**. Pure client-side SPA — PokéAPI + GitHub raw URLs provide all data. Keep it deployable on any static host.
- **Preserve card dimensions exactly** when exporting — 63mm × 88mm (standard Pokémon card size). Use `mm` units in pdf-lib, do not scale to fit.
- **Performance**: Handle 1025 images without melting the browser. Lazy-load sprites in the preview grid, virtualize the Pokémon selection list, generate PDF in chunks with progress updates for large exports (1025 cards ≈ 114 pages).
- **Offline-capable** after first load — cache sprites in IndexedDB, make the app a PWA with a service worker.
- **Respect fan content guidelines**: Include a footer disclaimer — fan-made, non-commercial, not affiliated with Nintendo/Game Freak/The Pokémon Company. No paywalls, no selling the output.
- **Accessibility**: Keyboard-navigable controls, visible focus states, `aria-label` on icon buttons, sufficient color contrast in both light and dark modes.
- **Mobile responsive**: Sidebar collapses to a bottom sheet below 768px; preview fills the screen.
- **Bundle size**: Keep under 500KB gzipped for the initial JS bundle. Lazy-load `pdf-lib` only when the user opens the export modal.

## Nice-to-haves (post-MVP)

- Export as PNG images (not just PDF) for sharing
- Import collection from Pokémon TCG Pocket / Pokémon HOME to auto-mark owned
- "Missing only" mode — generate placeholders only for Pokémon the user doesn't own
- Shareable URL — encode preset + selection into a link for trading designs with friends
- Paid tier: AI-upscaled sprites, custom border art packs, bulk preset library (feeds into the Praxor/Offero indie-hacker playbook)

## First Implementation Step

Start by scaffolding the Vite + React + TS project, setting up Tailwind and shadcn/ui, and wiring a minimal preview — render a single card for Pokémon #1 (Bulbasaur) using the default sprite URL. Confirm the sprite loads, the card renders at correct aspect ratio, and the PDF export produces a single-page A4 with the card at 63mm × 88mm. Only then add the controls, selection, and multi-card generation.
