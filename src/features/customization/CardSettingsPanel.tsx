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
