# M1 Card Preview + Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the DexForge M1 milestone — a live Bulbasaur card preview with border/color/font/toggle controls, a 3×3 page layout thumbnail, and a full PDF export modal that generates a print-ready A4/Letter PDF with the card at exactly 63mm × 88mm.

**Architecture:** Vertical slices — card component first, then customization state + sidebar, then page thumbnail, then export modal + PDF logic. A single Zustand slice (`cardSettings`) drives the preview and PDF renderer. No automated test framework is configured; each task uses `npx tsc --noEmit` + browser smoke tests for verification.

**Tech Stack:** React 19, TypeScript 6 (strict, verbatimModuleSyntax), Tailwind CSS v4, shadcn/ui (radix-nova style), Zustand v5, pdf-lib (lazy), canvas API for card-to-PNG rendering

> **shadcn style note:** This project uses `"style": "radix-nova"` in `components.json`. All `npx shadcn@latest add` commands will install radix-nova-styled components. The component APIs match the shadcn docs — only the visual styling differs.

> **TypeScript note:** `verbatimModuleSyntax: true` is enabled. Use `import type` for type-only imports and `export type` for type-only re-exports throughout.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Modify | Add Google Fonts `<link>` for the 6 card font families |
| `src/lib/useDebounce.ts` | Create | Generic debounce hook — used by CardSettingsPanel for color inputs |
| `src/features/customization/store.ts` | Create | Zustand `cardSettings` slice — single source of truth for all card design state |
| `src/features/preview/PokemonCard.tsx` | Create | Card component at 63:88 aspect ratio, reads from `cardSettings` store |
| `src/features/preview/PreviewCanvas.tsx` | Create | Mounts large PokemonCard; updated in Task 6 to also mount PageThumbnail |
| `src/features/customization/CardSettingsPanel.tsx` | Create | Collapsible sidebar section — border, colors, font, name/number toggles |
| `src/features/preview/PageThumbnail.tsx` | Create | 3×3 grid — slot 1 = miniature PokemonCard, slots 2–9 = empty outlines |
| `src/features/export/ExportModal.tsx` | Create | shadcn Dialog — paper size, crop marks, cover page, page range, Generate PDF |
| `src/features/export/pdf.ts` | Create | Canvas card-to-PNG renderer + pdf-lib PDF assembler (lazy-imported) |
| `src/App.tsx` | Modify | Mount all features, add modal open state, keyboard shortcut, `<Toaster />` |
| `src/components/ui/*.tsx` | Create (shadcn) | button, switch, collapsible, dialog, radio-group, checkbox, label, sonner |

---

### Task 1: Install shadcn components, Sonner, and Google Fonts

**Files:**
- Create: `src/components/ui/button.tsx`, `switch.tsx`, `collapsible.tsx`, `dialog.tsx`, `radio-group.tsx`, `checkbox.tsx`, `label.tsx`, `sonner.tsx` (all via shadcn CLI)
- Create: `src/lib/useDebounce.ts`
- Modify: `index.html`

- [ ] **Step 1: Install shadcn components**

```bash
cd /Users/leongcheefai/Documents/private/projects/dexforge
npx shadcn@latest add button switch collapsible dialog radio-group checkbox label sonner
```

Answer any interactive prompts by accepting defaults (press Enter). Expected output ends with each component listed as added.

- [ ] **Step 2: Verify component files exist**

```bash
ls src/components/ui/
```

Expected: output includes `button.tsx`, `switch.tsx`, `collapsible.tsx`, `dialog.tsx`, `radio-group.tsx`, `checkbox.tsx`, `label.tsx`, `sonner.tsx`.

- [ ] **Step 3: Add Google Fonts to index.html**

Replace `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DexForge</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700&family=Lobster&family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

> Inter is a system font (ships with most OSes and browsers); no Google Fonts entry needed.

- [ ] **Step 4: Create useDebounce hook**

Create `src/lib/useDebounce.ts`:

```ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 6: Commit**

```bash
git add index.html src/components/ui/ src/lib/useDebounce.ts package.json package-lock.json
git commit -m "chore: install shadcn components, sonner, add google fonts and useDebounce"
```

---

### Task 2: cardSettings Zustand slice

**Files:**
- Create: `src/features/customization/store.ts`
- Delete: `src/features/customization/.gitkeep`

- [ ] **Step 1: Create the store**

Create `src/features/customization/store.ts`:

```ts
import { create } from 'zustand'

export interface CardSettings {
  borderStyle: 'solid' | 'dashed' | 'rounded' | 'none'
  borderColor: string
  backgroundColor: string
  fontFamily: string
  showName: boolean
  showNumber: boolean
}

interface CardSettingsStore extends CardSettings {
  setBorderStyle: (v: CardSettings['borderStyle']) => void
  setBorderColor: (v: string) => void
  setBackgroundColor: (v: string) => void
  setFontFamily: (v: string) => void
  setShowName: (v: boolean) => void
  setShowNumber: (v: boolean) => void
}

export const useCardSettingsStore = create<CardSettingsStore>((set) => ({
  borderStyle: 'solid',
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  showName: true,
  showNumber: true,
  setBorderStyle: (v) => set({ borderStyle: v }),
  setBorderColor: (v) => set({ borderColor: v }),
  setBackgroundColor: (v) => set({ backgroundColor: v }),
  setFontFamily: (v) => set({ fontFamily: v }),
  setShowName: (v) => set({ showName: v }),
  setShowNumber: (v) => set({ showNumber: v }),
}))
```

- [ ] **Step 2: Remove .gitkeep**

```bash
rm src/features/customization/.gitkeep
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/features/customization/
git commit -m "feat: add cardSettings Zustand slice"
```

---

### Task 3: PokemonCard component

**Files:**
- Create: `src/features/preview/PokemonCard.tsx`

- [ ] **Step 1: Create PokemonCard**

Create `src/features/preview/PokemonCard.tsx`:

```tsx
import { useState } from 'react'
import { useCardSettingsStore } from '@/features/customization/store'

const SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'

const FONT_FAMILIES = [
  'Inter',
  'Geist',
  'Roboto',
  'Merriweather',
  'Space Mono',
  'Lobster',
] as const

// Verify the font family is one of the allowed options at runtime
function isFontFamily(v: string): v is (typeof FONT_FAMILIES)[number] {
  return (FONT_FAMILIES as readonly string[]).includes(v)
}

function borderClass(style: string): string {
  if (style === 'solid') return 'border-2'
  if (style === 'dashed') return 'border-2 border-dashed'
  if (style === 'rounded') return 'border-2 rounded-xl'
  return '' // 'none'
}

interface PokemonCardProps {
  mini?: boolean
}

export function PokemonCard({ mini = false }: PokemonCardProps) {
  const { borderStyle, borderColor, backgroundColor, fontFamily, showName, showNumber } =
    useCardSettingsStore()
  const [loaded, setLoaded] = useState(false)

  const resolvedFont = isFontFamily(fontFamily) ? fontFamily : 'Inter'

  return (
    <div
      className={`flex w-full flex-col items-center justify-between overflow-hidden p-2 ${borderClass(borderStyle)}`}
      style={{ aspectRatio: '63/88', borderColor, backgroundColor, fontFamily: resolvedFont }}
    >
      {showNumber && (
        <span className={`self-start ${mini ? 'text-[6px]' : 'text-xs'}`}>#001</span>
      )}
      <div className="flex flex-1 w-full items-center justify-center">
        {!loaded && (
          <div className="w-3/5 aspect-square animate-pulse rounded bg-gray-200" />
        )}
        <img
          src={SPRITE_URL}
          alt="Bulbasaur"
          crossOrigin="anonymous"
          className={`w-3/5 object-contain ${loaded ? 'block' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {showName && (
        <span className={`font-medium ${mini ? 'text-[8px]' : 'text-sm'}`}>Bulbasaur</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/features/preview/PokemonCard.tsx
git commit -m "feat: add PokemonCard component with sprite loading skeleton"
```

---

### Task 4: PreviewCanvas + initial App wiring

**Files:**
- Create: `src/features/preview/PreviewCanvas.tsx`
- Delete: `src/features/preview/.gitkeep`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create PreviewCanvas**

Create `src/features/preview/PreviewCanvas.tsx`:

```tsx
import { PokemonCard } from './PokemonCard'

export function PreviewCanvas() {
  return (
    <div className="flex w-full flex-col items-center gap-8 overflow-y-auto p-8">
      <div className="w-64">
        <PokemonCard />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Remove .gitkeep**

```bash
rm src/features/preview/.gitkeep
```

- [ ] **Step 3: Update App.tsx to mount PreviewCanvas**

Replace `src/App.tsx` with:

```tsx
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'

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
          {/* CardSettingsPanel mounts here in Task 5 */}
        </aside>
        <main className="flex-1 overflow-y-auto">
          <PreviewCanvas />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 5: Smoke-test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/`. Expected:
- White card (~256px wide) centered in the main area
- Loading skeleton (pulsing gray square) briefly visible, then Bulbasaur sprite appears
- "#001" top-left of card, "Bulbasaur" bottom-center of card
- Solid black border around card

Stop the dev server (`q`).

- [ ] **Step 6: Commit**

```bash
git add src/features/preview/PreviewCanvas.tsx src/App.tsx
git rm src/features/preview/.gitkeep
git commit -m "feat: add PreviewCanvas with Bulbasaur card preview"
```

---

### Task 5: CardSettingsPanel + sidebar wiring

**Files:**
- Create: `src/features/customization/CardSettingsPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create CardSettingsPanel**

Create `src/features/customization/CardSettingsPanel.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useCardSettingsStore } from './store'
import type { CardSettings } from './store'
import { useDebounce } from '@/lib/useDebounce'

const FONT_FAMILIES = [
  'Inter',
  'Geist',
  'Roboto',
  'Merriweather',
  'Space Mono',
  'Lobster',
] as const

const BORDER_STYLES: { value: CardSettings['borderStyle']; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'none', label: 'None' },
]

export function CardSettingsPanel() {
  const store = useCardSettingsStore()
  const [open, setOpen] = useState(true)

  // Local draft state for color pickers — debounced before writing to store
  const [borderColorDraft, setBorderColorDraft] = useState(store.borderColor)
  const [bgColorDraft, setBgColorDraft] = useState(store.backgroundColor)

  const debouncedBorderColor = useDebounce(borderColorDraft, 200)
  const debouncedBgColor = useDebounce(bgColorDraft, 200)

  useEffect(() => {
    useCardSettingsStore.getState().setBorderColor(debouncedBorderColor)
  }, [debouncedBorderColor])

  useEffect(() => {
    useCardSettingsStore.getState().setBackgroundColor(debouncedBgColor)
  }, [debouncedBgColor])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <span className="text-sm font-medium">Card Design</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4 pb-4">
        {/* Border Style */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Border Style</Label>
          <div className="flex gap-1">
            {BORDER_STYLES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => store.setBorderStyle(value)}
                className={`flex-1 rounded border py-1 text-xs capitalize transition-colors ${
                  store.borderStyle === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Border Color */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Border Color</Label>
          <input
            type="color"
            value={borderColorDraft}
            onChange={(e) => setBorderColorDraft(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border-0 p-0"
          />
        </div>

        {/* Background Color */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Background</Label>
          <input
            type="color"
            value={bgColorDraft}
            onChange={(e) => setBgColorDraft(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border-0 p-0"
          />
        </div>

        {/* Font Family */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Font</Label>
          <select
            value={store.fontFamily}
            onChange={(e) => store.setFontFamily(e.target.value)}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Show Name */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-name" className="text-xs text-muted-foreground">
            Show Name
          </Label>
          <Switch
            id="show-name"
            checked={store.showName}
            onCheckedChange={store.setShowName}
          />
        </div>

        {/* Show Number */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-number" className="text-xs text-muted-foreground">
            Show Number
          </Label>
          <Switch
            id="show-number"
            checked={store.showNumber}
            onCheckedChange={store.setShowNumber}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

- [ ] **Step 2: Mount CardSettingsPanel in App.tsx**

Replace the `{/* CardSettingsPanel mounts here in Task 5 */}` comment in `src/App.tsx` with the real import + component:

Replace:
```tsx
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
```
With:
```tsx
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
import { CardSettingsPanel } from '@/features/customization/CardSettingsPanel'
```

Replace:
```tsx
          {/* CardSettingsPanel mounts here in Task 5 */}
```
With:
```tsx
          <CardSettingsPanel />
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Smoke-test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/`. Expected:
- Left sidebar shows "Card Design" collapsible section (open by default)
- Changing Border Style buttons immediately updates card border in the preview
- Dragging the Border Color or Background color pickers updates the card (with 200ms lag on drag)
- Toggling Show Name / Show Number hides/shows those elements on the card
- Changing Font family updates the card text font

Stop the dev server (`q`).

- [ ] **Step 5: Commit**

```bash
git add src/features/customization/CardSettingsPanel.tsx src/App.tsx
git commit -m "feat: add CardSettingsPanel with live card customization controls"
```

---

### Task 6: PageThumbnail + update PreviewCanvas

**Files:**
- Create: `src/features/preview/PageThumbnail.tsx`
- Modify: `src/features/preview/PreviewCanvas.tsx`

- [ ] **Step 1: Create PageThumbnail**

Create `src/features/preview/PageThumbnail.tsx`:

```tsx
import { PokemonCard } from './PokemonCard'

export function PageThumbnail() {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">Page preview</span>
      <div className="grid grid-cols-3 gap-1 w-60">
        <PokemonCard mini />
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="border border-dashed border-muted-foreground/40"
            style={{ aspectRatio: '63/88' }}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add PageThumbnail to PreviewCanvas**

Replace `src/features/preview/PreviewCanvas.tsx` with:

```tsx
import { PokemonCard } from './PokemonCard'
import { PageThumbnail } from './PageThumbnail'

export function PreviewCanvas() {
  return (
    <div className="flex w-full flex-col items-center gap-10 overflow-y-auto p-8">
      <div className="w-64">
        <PokemonCard />
      </div>
      <PageThumbnail />
    </div>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Smoke-test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/`. Expected:
- Large Bulbasaur card at top of preview area
- Below it: "Page preview" label and a 3×3 grid (~240px wide)
- Slot 1 shows a tiny Bulbasaur card; slots 2–9 show dashed empty outlines
- Changing settings in the sidebar updates both the large card and slot 1 of the thumbnail

Stop the dev server (`q`).

- [ ] **Step 5: Commit**

```bash
git add src/features/preview/PageThumbnail.tsx src/features/preview/PreviewCanvas.tsx
git commit -m "feat: add 3x3 page thumbnail preview"
```

---

### Task 7: ExportModal + App wiring

**Files:**
- Create: `src/features/export/ExportModal.tsx`
- Delete: `src/features/export/.gitkeep`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ExportModal**

Create `src/features/export/ExportModal.tsx`:

```tsx
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { GeneratePdfOptions } from './pdf'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [paperSize, setPaperSize] = useState<GeneratePdfOptions['paperSize']>('a4')
  const [cropMarks, setCropMarks] = useState(false)
  const [coverPage, setCoverPage] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { generatePdf } = await import('./pdf')
      const bytes = await generatePdf({ paperSize, cropMarks, coverPage })
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dexforge.pdf'
      a.click()
      URL.revokeObjectURL(url)
      onOpenChange(false)
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Export PDF</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Paper Size */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Paper Size</Label>
            <RadioGroup
              value={paperSize}
              onValueChange={(v) => setPaperSize(v as GeneratePdfOptions['paperSize'])}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a4" id="paper-a4" />
                <Label htmlFor="paper-a4">A4</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="letter" id="paper-letter" />
                <Label htmlFor="paper-letter">Letter</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Crop Marks */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="crop-marks"
              checked={cropMarks}
              onCheckedChange={(v) => setCropMarks(!!v)}
            />
            <Label htmlFor="crop-marks">Include crop marks</Label>
          </div>

          {/* Cover Page */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="cover-page"
              checked={coverPage}
              onCheckedChange={(v) => setCoverPage(!!v)}
            />
            <Label htmlFor="cover-page">Include cover page</Label>
          </div>

          {/* Page Range */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Page Range</Label>
            <input
              type="text"
              value="1"
              disabled
              className="rounded border bg-muted px-2 py-1 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Remove .gitkeep**

```bash
rm src/features/export/.gitkeep
```

- [ ] **Step 3: Update App.tsx — add modal state, keyboard shortcut, Toaster**

Replace `src/App.tsx` with:

```tsx
import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { CardSettingsPanel } from '@/features/customization/CardSettingsPanel'
import { ExportModal } from '@/features/export/ExportModal'
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'

export default function App() {
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        setExportOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-4">
        <span className="font-semibold tracking-tight">DexForge</span>
        <button
          onClick={() => setExportOpen(true)}
          className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Export PDF
        </button>
      </header>
      <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <aside className="w-80 border-r overflow-y-auto p-4 shrink-0">
          <CardSettingsPanel />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <PreviewCanvas />
        </main>
      </div>
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
      <Toaster />
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

> `ExportModal` imports `type GeneratePdfOptions` from `./pdf` — that file doesn't exist yet, so this step will fail with a module-not-found error. That is expected. Continue to Task 8.

- [ ] **Step 5: Commit**

```bash
git add src/features/export/ExportModal.tsx src/App.tsx
git rm src/features/export/.gitkeep
git commit -m "feat: add ExportModal with paper size, crop marks, cover page controls"
```

---

### Task 8: pdf.ts — card-to-PNG renderer + pdf-lib assembler

**Files:**
- Create: `src/features/export/pdf.ts`

- [ ] **Step 1: Create pdf.ts**

Create `src/features/export/pdf.ts`:

```ts
import { useCardSettingsStore } from '@/features/customization/store'
import type { CardSettings } from '@/features/customization/store'

export interface GeneratePdfOptions {
  paperSize: 'a4' | 'letter'
  cropMarks: boolean
  coverPage: boolean
}

const SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'

const MM_TO_PT = 2.8346
const CARD_W_PT = 63 * MM_TO_PT  // 178.58pt
const CARD_H_PT = 88 * MM_TO_PT  // 249.44pt

const PAGE_DIM: Record<GeneratePdfOptions['paperSize'], [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

function borderClassToCanvasStyle(style: CardSettings['borderStyle']): {
  dash: number[]
  rounded: boolean
} {
  return {
    dash: style === 'dashed' ? [15, 8] : [],
    rounded: style === 'rounded',
  }
}

async function renderCardToPng(settings: CardSettings): Promise<Uint8Array> {
  // 10px per mm — 630×880 canvas for a 63×88mm card
  const W = 630
  const H = 880

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = settings.backgroundColor
  ctx.fillRect(0, 0, W, H)

  // Border
  if (settings.borderStyle !== 'none') {
    const { dash, rounded } = borderClassToCanvasStyle(settings.borderStyle)
    ctx.strokeStyle = settings.borderColor
    ctx.lineWidth = 6
    ctx.setLineDash(dash)
    const inset = 3
    if (rounded) {
      ctx.beginPath()
      ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, 24)
      ctx.stroke()
    } else {
      ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2)
    }
    ctx.setLineDash([])
  }

  // Ensure Google Fonts are loaded before drawing text
  await document.fonts.ready

  // Number
  if (settings.showNumber) {
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'left'
    ctx.font = `20px ${settings.fontFamily}, sans-serif`
    ctx.fillText('#001', 20, 44)
  }

  // Sprite — load as Image with crossOrigin so canvas remains un-tainted
  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = W * 0.6
      const x = (W - size) / 2
      const y = (H - size) / 2 - 30
      ctx.drawImage(img, x, y, size, size)
      resolve()
    }
    img.onerror = () => reject(new Error('Failed to load sprite from GitHub CDN'))
    img.src = SPRITE_URL
  })

  // Name
  if (settings.showName) {
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.font = `bold 32px ${settings.fontFamily}, sans-serif`
    ctx.fillText('Bulbasaur', W / 2, H - 28)
  }

  // Export canvas to PNG bytes
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('canvas.toBlob returned null'))
          return
        }
        blob
          .arrayBuffer()
          .then((buf) => resolve(new Uint8Array(buf)))
          .catch(reject)
      },
      'image/png',
    )
  })
}

export async function generatePdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  // pdf-lib is lazy-loaded to keep the initial bundle under 500KB
  const { PDFDocument, rgb } = await import('pdf-lib')

  const settings = useCardSettingsStore.getState()
  const [pageW, pageH] = PAGE_DIM[options.paperSize]
  const doc = await PDFDocument.create()

  // Optional cover page
  if (options.coverPage) {
    const cover = doc.addPage([pageW, pageH])
    cover.drawText('DexForge', {
      x: pageW / 2 - 60,
      y: pageH / 2 + 20,
      size: 36,
    })
    cover.drawText(
      'Fan-made · Non-commercial · Not affiliated with Nintendo / Game Freak / The Pokémon Company',
      { x: 40, y: 40, size: 8 },
    )
  }

  // Render card to PNG and embed
  const pngBytes = await renderCardToPng(settings)
  const pngImage = await doc.embedPng(pngBytes)

  // Card page
  const page = doc.addPage([pageW, pageH])
  const cardX = (pageW - CARD_W_PT) / 2
  const cardY = (pageH - CARD_H_PT) / 2

  page.drawImage(pngImage, { x: cardX, y: cardY, width: CARD_W_PT, height: CARD_H_PT })

  // Crop marks — thin lines at each corner, offset by a small gap
  if (options.cropMarks) {
    const markLen = 14
    const gap = 4
    const black = rgb(0, 0, 0)
    const corners: [number, number][] = [
      [cardX, cardY],
      [cardX + CARD_W_PT, cardY],
      [cardX, cardY + CARD_H_PT],
      [cardX + CARD_W_PT, cardY + CARD_H_PT],
    ]

    for (const [cx, cy] of corners) {
      // Horizontal marks
      page.drawLine({ start: { x: cx - gap - markLen, y: cy }, end: { x: cx - gap, y: cy }, color: black, thickness: 0.5 })
      page.drawLine({ start: { x: cx + gap, y: cy }, end: { x: cx + gap + markLen, y: cy }, color: black, thickness: 0.5 })
      // Vertical marks
      page.drawLine({ start: { x: cx, y: cy - gap - markLen }, end: { x: cx, y: cy - gap }, color: black, thickness: 0.5 })
      page.drawLine({ start: { x: cx, y: cy + gap }, end: { x: cx, y: cy + gap + markLen }, color: black, thickness: 0.5 })
    }
  }

  return doc.save()
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors). Both `ExportModal.tsx` and `pdf.ts` should now resolve cleanly.

- [ ] **Step 3: Smoke-test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/`. Verify the full flow:

1. Click "Export PDF" button (or press `Cmd+E` / `Ctrl+E`) — export modal opens
2. Select **Letter** paper size
3. Check **Include crop marks**
4. Check **Include cover page**
5. Click **Generate PDF** — spinner appears briefly
6. Browser downloads `dexforge.pdf`
7. Toast notification "PDF downloaded!" appears
8. Open the PDF: confirm it has 2 pages (cover + card page), card is centered, crop marks visible at corners

Also verify error path: disconnect network, try export — toast should show "Export failed: Failed to load sprite from GitHub CDN".

Stop the dev server (`q`).

- [ ] **Step 4: Commit**

```bash
git add src/features/export/pdf.ts
git commit -m "feat: add pdf.ts — canvas card renderer and pdf-lib assembler"
```

---

### Task 9: Final verification

**Files:** none — verification only

- [ ] **Step 1: Clean type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: `dist/` created, no errors. Then check bundle sizes:

```bash
ls -lh dist/assets/*.js | sort -k5 -rh | head -5
```

The main bundle (excluding any lazy chunk) should be well under 500KB. `pdf-lib` should appear as a separate chunk (lazy-loaded). If `pdf-lib` ends up in the main bundle, open `src/features/export/ExportModal.tsx` and confirm the import is `await import('./pdf')` (dynamic), not a static import.

- [ ] **Step 3: Full feature smoke-test**

```bash
npm run dev
```

Open `http://localhost:5173/`. Run through the complete M1 checklist:

| Check | Expected |
|---|---|
| Sprite loads | Bulbasaur sprite visible (no broken image) |
| Card aspect ratio | Card is taller than it is wide (~63:88 proportion) |
| Border Style: Dashed | Card border becomes dashed |
| Border Color: red `#ff0000` | Card border turns red |
| Background: blue `#0000ff` | Card background turns blue |
| Font: Merriweather | Card text changes to serif font |
| Show Name: off | "Bulbasaur" text disappears |
| Show Number: off | "#001" text disappears |
| Page thumbnail | 3×3 grid visible below large card; slot 1 mirrors large card settings |
| Export modal: keyboard | `Cmd/Ctrl+E` opens modal |
| Export modal: A4, no extras | Downloads `dexforge.pdf`; card at 63mm × 88mm on A4 page |
| Toast on success | "PDF downloaded!" toast appears |

Stop the dev server (`q`).

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: m1 complete — card preview, customization controls, page thumbnail, pdf export"
```
