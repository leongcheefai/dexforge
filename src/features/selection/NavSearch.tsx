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
  typeof navigator !== 'undefined' &&
  (
    (
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform
    ) ?? ''
  )
    .toLowerCase()
    .startsWith('mac')

export function NavSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<PokemonNameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const { setFromId, setToId } = useSelectionStore()

  useEffect(() => {
    loadPokemonNameList()
      .then(setItems)
      .catch((err) => {
        console.error('[NavSearch] Failed to load Pokémon list', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => { setActiveIndex(-1) }, [query])

  const q = query.trim().toLowerCase()
  const filtered =
    q === ''
      ? items.slice(0, 50)
      : items
          .filter(
            (p) =>
              p.name.includes(q) ||
              String(p.id).includes(q)
          )
          .slice(0, 50)

  function handleSelect(id: number) {
    setFromId(id)
    setToId(id)
    setOpen(false)
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(activeIndex + 1, filtered.length - 1)
      setActiveIndex(next)
      scrollItemIntoView(next)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(activeIndex - 1, -1)
      setActiveIndex(next)
      if (next >= 0) scrollItemIntoView(next)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[activeIndex].id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  function scrollItemIntoView(index: number) {
    const item = listRef.current?.children[index] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }

  const hint = isMac ? '⌘K' : 'Ctrl K'

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('')
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <button
          aria-label="Search Pokémon"
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-input bg-transparent text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:block">Search Pokémon…</span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-border px-1 py-0.5 text-[10px] leading-none text-muted-foreground/60" style={{ fontFamily: "'DM Mono', monospace" }}>
            {hint}
          </kbd>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <div className="border-b border-border px-3 py-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search by name or number…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-activedescendant={activeIndex >= 0 ? `navsearch-item-${activeIndex}` : undefined}
          />
        </div>
        <ul ref={listRef} className="max-h-64 overflow-y-auto py-1" role="listbox">
          {loading ? (
            <li role="option" aria-disabled className="px-3 py-2 text-sm text-muted-foreground">Loading…</li>
          ) : error ? (
            <li role="option" aria-disabled className="px-3 py-2 text-sm text-muted-foreground">Failed to load — check your connection</li>
          ) : filtered.length === 0 ? (
            <li role="option" aria-disabled className="px-3 py-2 text-sm text-muted-foreground">No results</li>
          ) : (
            filtered.map((p, i) => (
              <li key={p.id} id={`navsearch-item-${i}`} role="option" aria-selected={i === activeIndex}>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm focus:outline-none ${
                    i === activeIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => handleSelect(p.id)}
                  onMouseEnter={() => setActiveIndex(i)}
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
