import { useState, useEffect } from 'react'
import { useCardSettingsStore, spriteUrl } from '@/features/customization/store'
import { useSelectionStore } from '@/features/selection/store'

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
  const { borderStyle, borderColor, backgroundColor, fontFamily, showName, showNumber, imageStyle } =
    useCardSettingsStore()
  const { fromId } = useSelectionStore()
  const id = pokemonId ?? fromId

  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const url = spriteUrl(id, imageStyle)

  useEffect(() => { setLoaded(false) }, [url])

  useEffect(() => {
    let cancelled = false
    setName(null)
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const raw: string = data.name ?? ''
          setName(raw.charAt(0).toUpperCase() + raw.slice(1))
        }
      })
      .catch(() => { /* silently fall back to no name */ })
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
              key={url}
              src={url}
              alt={`Pokémon #${id}`}
              crossOrigin="anonymous"
              className={`w-3/5 object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
              style={isSilhouette ? { filter: 'brightness(0)' } : undefined}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="w-3/5 aspect-square" />
        )}
      </div>
      {showName && (
        <span className={`font-medium ${mini ? 'text-[8px]' : 'text-sm'}`}>
          {name ?? `#${padId(id)}`}
        </span>
      )}
    </div>
  )
}
