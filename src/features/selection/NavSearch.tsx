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
