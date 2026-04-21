import { memo, useState, useEffect } from 'react'
import { useCardSettingsStore, spriteUrl } from '@/features/customization/store'
import { useSelectionStore } from '@/features/selection/store'
import { typeColor } from '@/lib/pokemon-types'
import { loadSprite, getCachedBlobUrl } from '@/lib/sprite-cache'
import { getCachedPokemon, fetchPokemonData } from '@/lib/pokemon-data-cache'

export { prefetchRange } from '@/lib/pokemon-data-cache'

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

export const PokemonCard = memo(function PokemonCard({ mini = false, pokemonId }: PokemonCardProps) {
  const { borderStyle, borderColor, backgroundColor, fontFamily, showName, showNumber, showTypeBadges, imageStyle } =
    useCardSettingsStore()
  const { fromId } = useSelectionStore()
  const id = pokemonId ?? fromId

  const rawUrl = spriteUrl(id, imageStyle)
  const [blobUrl, setBlobUrl] = useState<string | null>(() => rawUrl ? (getCachedBlobUrl(rawUrl) ?? null) : null)
  const [loaded, setLoaded] = useState(() => rawUrl ? !!getCachedBlobUrl(rawUrl) : false)
  const [name, setName] = useState<string | null>(() => getCachedPokemon(id)?.name ?? null)
  const [types, setTypes] = useState<string[]>(() => getCachedPokemon(id)?.types ?? [])
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
    const cached = getCachedPokemon(id)
    if (cached) {
      setName(cached.name)
      setTypes(cached.types)
      return
    }
    setName(null)
    setTypes([])
    let cancelled = false
    fetchPokemonData(id).then(() => {
      if (cancelled) return
      const data = getCachedPokemon(id)
      if (data) {
        setName(data.name)
        setTypes(data.types)
      }
    }).catch(() => {})
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
})
