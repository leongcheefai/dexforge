import { create } from 'zustand'

export interface CardSettings {
  borderStyle: 'solid' | 'dashed' | 'rounded' | 'none'
  borderColor: string
  backgroundColor: string
  fontFamily: string
  showName: boolean
  showNumber: boolean
}

interface CardSettingsStore extends CardSettings {
  setBorderStyle: (v: CardSettings['borderStyle']) => void
  setBorderColor: (v: string) => void
  setBackgroundColor: (v: string) => void
  setFontFamily: (v: string) => void
  setShowName: (v: boolean) => void
  setShowNumber: (v: boolean) => void
}

export const useCardSettingsStore = create<CardSettingsStore>((set) => ({
  borderStyle: 'solid',
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  showName: true,
  showNumber: true,
  setBorderStyle: (v) => set({ borderStyle: v }),
  setBorderColor: (v) => set({ borderColor: v }),
  setBackgroundColor: (v) => set({ backgroundColor: v }),
  setFontFamily: (v) => set({ fontFamily: v }),
  setShowName: (v) => set({ showName: v }),
  setShowNumber: (v) => set({ showNumber: v }),
}))
