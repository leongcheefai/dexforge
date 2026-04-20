import { useState, useEffect } from 'react'
import { useCardSettingsStore, spriteUrl } from '@/features/customization/store'
import { useSelectionStore } from '@/features/selection/store'
import { typeColor } from '@/lib/pokemon-types'
import { loadSprite, getCachedBlobUrl } from '@/lib/sprite-cache'

const pokemonCache = new Map<number, { name: string; types: string[] }>()

async function fetchPokemonData(id: number): Promise<void> {
  if (pokemonCache.has(id)) return
  try {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
    const raw: string = data.name ?? ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pokemonCache.set(id, { name: raw.charAt(0).toUpperCase() + raw.slice(1), types: (data.types ?? []).map((t: any) => t.type.name as string) })
  } catch { /* ignore */ }
}

export async function prefetchRange(from: number, to: number, concurrency = 12): Promise<void> {
  const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i).filter((id) => !pokemonCache.has(id))
  for (let i = 0; i < ids.length; i += concurrency) {
    await Promise.all(ids.slice(i, i + concurrency).map(fetchPokemonData))
  }
}

const FONT_FAMILIES = [
  'Inter', 'Geist', 'Roboto', 'Merriweather', 'Space Mono', 'Lobster',
] as const

function isFontFamily(v: string): v is (typeof FONT_FAMILIES)[number] {
  return (FONT_FAMILIES as readonly string[]).includes(v)
}

function borderClass(style: string): string {
  if (style === 'solid') return 'border-2'
  if (style === 'dashed') return 'border-2 border-dashed'
  if (style === 'rounded') return 'border-2 rounded-xl'
  return ''
}

function padId(id: number): string {
  return String(id).padStart(3, '0')
}

interface PokemonCardProps {
  pokemonId?: number
  mini?: boolean
}

export function PokemonCard({ mini = false, pokemonId }: PokemonCardProps) {
  const { borderStyle, borderColor, backgroundColor, fontFamily, showName, showNumber, showTypeBadges, imageStyle } =
    useCardSettingsStore()
  const { fromId } = useSelectionStore()
  const id = pokemonId ?? fromId

  const rawUrl = spriteUrl(id, imageStyle)
  const [blobUrl, setBlobUrl] = useState<string | null>(() => rawUrl ? (getCachedBlobUrl(rawUrl) ?? null) : null)
  const [loaded, setLoaded] = useState(() => rawUrl ? !!getCachedBlobUrl(rawUrl) : false)
  const [name, setName] = useState<string | null>(() => pokemonCache.get(id)?.name ?? null)
  const [types, setTypes] = useState<string[]>(() => pokemonCache.get(id)?.types ?? [])
  const url = blobUrl ?? rawUrl

  useEffect(() => {
    if (!rawUrl) {
      setBlobUrl(null)
      setLoaded(false)
      return
    }
    const cached = getCachedBlobUrl(rawUrl)
    if (cached) {
      setBlobUrl(cached)
      setLoaded(true)
      return
    }
    setBlobUrl(null)
    setLoaded(false)
    let cancelled = false
    loadSprite(rawUrl).then((resolved) => {
      if (!cancelled) {
        setBlobUrl(resolved)
        setLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [rawUrl])

  useEffect(() => {
    const cached = pokemonCache.get(id)
    if (cached) {
      setName(cached.name)
      setTypes(cached.types)
      return
    }
    setName(null)
    setTypes([])
    let cancelled = false
    setName(null)
    setTypes([])
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const raw: string = data.name ?? ''
          const name = raw.charAt(0).toUpperCase() + raw.slice(1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const types = (data.types ?? []).map((t: any) => t.type.name as string)
          pokemonCache.set(id, { name, types })
          setName(name)
          setTypes(types)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [id])

  const resolvedFont = isFontFamily(fontFamily) ? fontFamily : 'Inter'
  const isSilhouette = imageStyle === 'silhouette'

  return (
    <div
      className={`flex w-full flex-col items-center justify-between overflow-hidden p-2 ${borderClass(borderStyle)}`}
      style={{ aspectRatio: '63/88', borderColor, backgroundColor, fontFamily: resolvedFont }}
    >
      {showNumber && (
        <span className={`self-start ${mini ? 'text-[6px]' : 'text-xs'}`}>#{padId(id)}</span>
      )}
      <div className="flex flex-1 w-full items-center justify-center">
        {url ? (
          <>
            {!loaded && (
              <div className="w-3/5 aspect-square animate-pulse rounded bg-gray-200" />
            )}
            <img
              src={url ?? undefined}
              alt={`Pokémon #${id}`}
              crossOrigin="anonymous"
              className={`w-3/5 object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
              style={isSilhouette ? { filter: 'brightness(0)' } : undefined}
            />
          </>
        ) : (
          <div className="w-3/5 aspect-square" />
        )}
      </div>
      <div className={`flex flex-col items-center gap-0.5 w-full ${mini ? 'gap-0' : 'gap-1'}`}>
        {showTypeBadges && types.length > 0 && (
          <div className="flex gap-1 justify-center">
            {types.map((t) => (
              <span
                key={t}
                className={`rounded-full font-semibold uppercase tracking-wide text-white ${mini ? 'text-[4px] px-1 py-px' : 'text-[9px] px-2 py-0.5'}`}
                style={{ backgroundColor: typeColor(t) }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {showName && (
          <span className={`font-medium ${mini ? 'text-[8px]' : 'text-sm'}`}>
            {name ?? `#${padId(id)}`}
          </span>
        )}
      </div>
    </div>
  )
}
