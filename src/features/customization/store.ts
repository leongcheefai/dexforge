import { create } from 'zustand'

export type ImageStyle = 'pixels' | 'official-art' | 'shiny' | 'silhouette' | 'pokeball' | 'none'

export const IMAGE_STYLE_OPTIONS: { value: ImageStyle; label: string }[] = [
  { value: 'pixels',       label: 'Pixel Art'          },
  { value: 'official-art', label: 'Color Official Art'  },
  { value: 'shiny',        label: 'Shiny Art'           },
  { value: 'silhouette',   label: 'Silhouette'          },
  { value: 'pokeball',     label: 'Pokéball'            },
  { value: 'none',         label: 'No Image'            },
]

export function spriteUrl(id: number, style: ImageStyle): string | null {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'
  switch (style) {
    case 'pixels':       return `${base}/pokemon/${id}.png`
    case 'official-art': return `${base}/pokemon/other/official-artwork/${id}.png`
    case 'shiny':        return `${base}/pokemon/other/official-artwork/shiny/${id}.png`
    case 'silhouette':   return `${base}/pokemon/${id}.png`
    case 'pokeball':     return `${base}/items/poke-ball.png`
    case 'none':         return null
  }
}

export interface CardSettings {
  borderStyle: 'solid' | 'dashed' | 'rounded' | 'none'
  borderColor: string
  backgroundColor: string
  fontFamily: string
  showName: boolean
  showNumber: boolean
  showTypeBadges: boolean
  imageStyle: ImageStyle
  gridGap: number
}

interface CardSettingsStore extends CardSettings {
  setBorderStyle: (v: CardSettings['borderStyle']) => void
  setBorderColor: (v: string) => void
  setBackgroundColor: (v: string) => void
  setFontFamily: (v: string) => void
  setShowName: (v: boolean) => void
  setShowNumber: (v: boolean) => void
  setShowTypeBadges: (v: boolean) => void
  setImageStyle: (v: ImageStyle) => void
  setGridGap: (v: number) => void
}

export const useCardSettingsStore = create<CardSettingsStore>((set) => ({
  borderStyle: 'solid',
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  showName: true,
  showNumber: true,
  showTypeBadges: true,
  imageStyle: 'pixels',
  gridGap: 2,
  setBorderStyle: (v) => set({ borderStyle: v }),
  setBorderColor: (v) => set({ borderColor: v }),
  setBackgroundColor: (v) => set({ backgroundColor: v }),
  setFontFamily: (v) => set({ fontFamily: v }),
  setShowName: (v) => set({ showName: v }),
  setShowNumber: (v) => set({ showNumber: v }),
  setShowTypeBadges: (v) => set({ showTypeBadges: v }),
  setImageStyle: (v) => set({ imageStyle: v }),
  setGridGap: (v) => set({ gridGap: v }),
}))
