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
