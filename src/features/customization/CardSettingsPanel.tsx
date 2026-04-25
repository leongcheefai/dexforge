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
import { Layers, Image as ImageLucide, Square, Palette, Type, Eye, LayoutGrid, Plus, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-3 w-3 text-primary/50 shrink-0" strokeWidth={2.5} />
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground" style={MONO}>
        {children}
      </p>
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-border">
      {children}
    </div>
  )
}

function ColorPickerRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground/70">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/50 tabular-nums" style={MONO}>
          {value.toUpperCase()}
        </span>
        <label className="cursor-pointer group relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <div
            className="h-7 w-7 rounded-md border-2 border-border/60 ring-offset-background group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-1 transition-all hover:border-primary/50 hover:scale-105 active:scale-95"
            style={{ backgroundColor: value }}
          />
        </label>
      </div>
    </div>
  )
}

function NumberStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
        {label}
      </span>
      <div className="flex items-stretch rounded-md border border-input overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border-r border-input shrink-0"
        >
          <Minus className="h-2.5 w-2.5" />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          className="flex-1 min-w-0 bg-input/60 px-2 py-2 text-sm text-foreground text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="px-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border-l border-input shrink-0"
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
      </div>
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
  const count = toId - fromId + 1

  return (
    <Section>
      <SectionLabel icon={Layers}>Pokémon Range</SectionLabel>
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
          <NumberStepper
            label="From #"
            value={fromId}
            min={1}
            max={toId}
            onChange={setFromId}
          />
          <NumberStepper
            label="To #"
            value={toId}
            min={fromId}
            max={1025}
            onChange={setToId}
          />
        </div>
        <div className="flex items-center justify-center py-1.5 rounded-md bg-muted/30 border border-border/40">
          <span className="text-[11px] text-muted-foreground" style={MONO}>
            <span className="text-foreground font-medium">{count}</span>
            {' '}Pokémon · {Math.ceil(count / 9)} page{count !== 9 ? 's' : ''}
          </span>
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

  const count = toId - fromId + 1
  const rangeLabel =
    fromId === toId
      ? `#${String(fromId).padStart(3, '0')}`
      : `#${String(fromId).padStart(3, '0')}–#${String(toId).padStart(3, '0')}`

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
          <SectionLabel icon={ImageLucide}>Image Style</SectionLabel>
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
          <SectionLabel icon={Square}>Border</SectionLabel>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-1.5">
              {BORDER_STYLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => store.setBorderStyle(value)}
                  className={`flex flex-col items-center gap-2 pt-2.5 pb-2 px-1 rounded-md transition-all duration-150 ${
                    store.borderStyle === value
                      ? 'bg-primary/10 ring-1 ring-primary/50'
                      : 'bg-muted/40 hover:bg-muted/70'
                  }`}
                >
                  {value === 'none' ? (
                    <div className="w-6 h-4 flex items-center justify-center">
                      <div className="w-4 h-px bg-muted-foreground/30" />
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-4 ${
                        value === 'dashed'
                          ? 'border-dashed'
                          : 'border-solid'
                      } ${value === 'rounded' ? 'rounded-sm' : ''} border-[1.5px] ${
                        store.borderStyle === value
                          ? 'border-primary'
                          : 'border-muted-foreground/50'
                      }`}
                    />
                  )}
                  <span
                    className={`text-[9px] uppercase tracking-wide font-medium ${
                      store.borderStyle === value ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    style={MONO}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <ColorPickerRow
              label="Color"
              value={borderColorDraft}
              onChange={setBorderColorDraft}
            />
          </div>
        </Section>

        <Section>
          <SectionLabel icon={Palette}>Background</SectionLabel>
          <ColorPickerRow
            label="Color"
            value={bgColorDraft}
            onChange={setBgColorDraft}
          />
        </Section>

        <Section>
          <SectionLabel icon={Type}>Typography</SectionLabel>
          <Select value={store.fontFamily} onValueChange={(v: string) => store.setFontFamily(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        <Section>
          <SectionLabel icon={Eye}>Display</SectionLabel>
          <div className="flex flex-col divide-y divide-border/40">
            {[
              { id: 'show-name', label: 'Show Name', checked: store.showName, onChange: store.setShowName },
              { id: 'show-number', label: 'Show Number', checked: store.showNumber, onChange: store.setShowNumber },
              { id: 'show-type-badges', label: 'Show Type Badges', checked: store.showTypeBadges, onChange: store.setShowTypeBadges },
            ].map(({ id, label, checked, onChange }) => (
              <div key={id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <Label
                  htmlFor={id}
                  className="text-sm text-foreground/70 cursor-pointer font-normal"
                >
                  {label}
                </Label>
                <Switch id={id} checked={checked} onCheckedChange={onChange} />
              </div>
            ))}
          </div>
        </Section>

        <Section>
          <SectionLabel icon={LayoutGrid}>Layout</SectionLabel>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
              Grid Gap (mm)
            </span>
            <div className="flex items-stretch rounded-md border border-input overflow-hidden">
              <button
                type="button"
                onClick={() => store.setGridGap(Math.max(0, store.gridGap - 1))}
                className="px-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border-r border-input shrink-0"
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <input
                type="number"
                min={0}
                max={20}
                step={1}
                value={store.gridGap}
                onChange={(e) =>
                  store.setGridGap(Math.max(0, Math.min(20, parseFloat(e.target.value) || 0)))
                }
                className="flex-1 min-w-0 bg-input/60 px-2 py-2 text-sm text-foreground text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => store.setGridGap(Math.min(20, store.gridGap + 1))}
                className="px-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border-l border-input shrink-0"
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </Section>
      </div>

      <div className="px-5 py-4 border-t border-border shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] text-muted-foreground/50" style={MONO}>
              {count} Pokémon · {Math.ceil(count / 9)} page{count !== 9 ? 's' : ''}
            </span>
            <span className="text-[10px] text-muted-foreground/50" style={MONO}>
              {rangeLabel}
            </span>
          </div>
          <Button
            className="w-full uppercase tracking-widest text-[11px] font-semibold h-9"
            onClick={generate}
          >
            Generate {rangeLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
