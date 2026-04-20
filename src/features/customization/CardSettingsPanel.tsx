import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCardSettingsStore, IMAGE_STYLE_OPTIONS } from './store'
import type { CardSettings, ImageStyle } from './store'
import { useDebounce } from '@/lib/useDebounce'
import { useSelectionStore, GENERATION_PRESETS } from '@/features/selection/store'
import type { GenerationPreset } from '@/features/selection/store'

const MONO = { fontFamily: "'DM Mono', monospace" }

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3" style={MONO}>
      {children}
    </p>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-border">
      {children}
    </div>
  )
}

const PRESET_OPTIONS: { value: GenerationPreset; label: string }[] = [
  { value: 'custom', label: 'Custom Range' },
  ...Object.entries(GENERATION_PRESETS).map(([key, { label }]) => ({
    value: key as GenerationPreset,
    label,
  })),
]

function RangeSection() {
  const { preset, fromId, toId, setPreset, setFromId, setToId } = useSelectionStore()

  return (
    <Section>
      <SectionLabel>Pokémon Range</SectionLabel>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
            Preset
          </span>
          <Select value={preset} onValueChange={(v: string) => setPreset(v as GenerationPreset)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESET_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
              From #
            </span>
            <input
              type="number"
              min={1}
              max={toId}
              value={fromId}
              onChange={(e) => setFromId(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-md border border-input bg-input/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-background focus:ring-offset-1"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
              To #
            </span>
            <input
              type="number"
              min={fromId}
              max={1025}
              value={toId}
              onChange={(e) => setToId(Math.min(1025, parseInt(e.target.value) || 1))}
              className="w-full rounded-md border border-input bg-input/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-background focus:ring-offset-1"
            />
          </div>
        </div>
      </div>
    </Section>
  )
}

export function CardSettingsPanel() {
  const store = useCardSettingsStore()
  const { fromId, toId, generate } = useSelectionStore()

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
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-primary/70 font-medium" style={MONO}>
          Card Design
        </h2>
      </div>

      <div className="flex flex-col overflow-y-auto flex-1">
        <RangeSection />

        <Section>
          <SectionLabel>Image Style</SectionLabel>
          <Select value={store.imageStyle} onValueChange={(v: string) => store.setImageStyle(v as ImageStyle)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_STYLE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        <Section>
          <SectionLabel>Border</SectionLabel>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-1.5">
              {BORDER_STYLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => store.setBorderStyle(value)}
                  className={`rounded-md py-1.5 text-[11px] font-medium tracking-wide transition-all duration-150 ${
                    store.borderStyle === value
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/70">Color</span>
              <label className="cursor-pointer group relative">
                <input
                  type="color"
                  value={borderColorDraft}
                  onChange={(e) => setBorderColorDraft(e.target.value)}
                  className="sr-only"
                />
                <div
                  className="h-8 w-8 rounded-md border-2 border-border/60 ring-offset-background group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2 transition-all hover:border-primary/50"
                  style={{ backgroundColor: borderColorDraft }}
                />
              </label>
            </div>
          </div>
        </Section>

        <Section>
          <SectionLabel>Background</SectionLabel>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/70">Color</span>
            <label className="cursor-pointer group relative">
              <input
                type="color"
                value={bgColorDraft}
                onChange={(e) => setBgColorDraft(e.target.value)}
                className="sr-only"
              />
              <div
                className="h-8 w-8 rounded-md border-2 border-border/60 ring-offset-background group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2 transition-all hover:border-primary/50"
                style={{ backgroundColor: bgColorDraft }}
              />
            </label>
          </div>
        </Section>

        <Section>
          <SectionLabel>Typography</SectionLabel>
          <Select value={store.fontFamily} onValueChange={(v: string) => store.setFontFamily(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        <Section>
          <SectionLabel>Display</SectionLabel>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-name" className="text-sm text-foreground/70 cursor-pointer font-normal">
                Show Name
              </Label>
              <Switch
                id="show-name"
                checked={store.showName}
                onCheckedChange={store.setShowName}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-number" className="text-sm text-foreground/70 cursor-pointer font-normal">
                Show Number
              </Label>
              <Switch
                id="show-number"
                checked={store.showNumber}
                onCheckedChange={store.setShowNumber}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-type-badges" className="text-sm text-foreground/70 cursor-pointer font-normal">
                Show Type Badges
              </Label>
              <Switch
                id="show-type-badges"
                checked={store.showTypeBadges}
                onCheckedChange={store.setShowTypeBadges}
              />
            </div>
          </div>
        </Section>
      </div>

      <div className="px-5 py-4 border-t border-border shrink-0">
        <Button
          className="w-full uppercase tracking-widest text-[11px] font-semibold h-9"
          onClick={generate}
        >
          Generate #{String(fromId).padStart(3, '0')}–#{String(toId).padStart(3, '0')}
        </Button>
      </div>
    </div>
  )
}
