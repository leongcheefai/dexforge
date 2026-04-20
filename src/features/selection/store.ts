import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GenerationPreset =
  | 'custom'
  | 'all'
  | 'gen1'
  | 'gen2'
  | 'gen3'
  | 'gen4'
  | 'gen5'
  | 'gen6'
  | 'gen7'
  | 'gen8'
  | 'gen9'

export interface GenerationRange {
  label: string
  from: number
  to: number
}

export const GENERATION_PRESETS: Record<Exclude<GenerationPreset, 'custom'>, GenerationRange> = {
  all:  { label: 'All Pokémon (1–1025)',    from: 1,   to: 1025 },
  gen1: { label: 'Generation I (1–151)',    from: 1,   to: 151  },
  gen2: { label: 'Generation II (152–251)', from: 152, to: 251  },
  gen3: { label: 'Generation III (252–386)',from: 252, to: 386  },
  gen4: { label: 'Generation IV (387–493)', from: 387, to: 493  },
  gen5: { label: 'Generation V (494–649)',  from: 494, to: 649  },
  gen6: { label: 'Generation VI (650–721)', from: 650, to: 721  },
  gen7: { label: 'Generation VII (722–809)',from: 722, to: 809  },
  gen8: { label: 'Generation VIII (810–905)',from: 810, to: 905 },
  gen9: { label: 'Generation IX (906–1025)',from: 906, to: 1025 },
}

interface SelectionState {
  preset: GenerationPreset
  fromId: number
  toId: number
  isGenerated: boolean
  setPreset: (preset: GenerationPreset) => void
  setFromId: (id: number) => void
  setToId: (id: number) => void
  generate: () => void
  resetGenerated: () => void
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set) => ({
      preset: 'gen1',
      fromId: 1,
      toId: 151,
      isGenerated: false,
      setPreset: (preset) => {
        if (preset === 'custom') {
          set({ preset, isGenerated: false })
        } else {
          const { from, to } = GENERATION_PRESETS[preset]
          set({ preset, fromId: from, toId: to, isGenerated: false })
        }
      },
      setFromId: (fromId) => set({ fromId, preset: 'custom', isGenerated: false }),
      setToId: (toId) => set({ toId, preset: 'custom', isGenerated: false }),
      generate: () => set({ isGenerated: true }),
      resetGenerated: () => set({ isGenerated: false }),
    }),
    { name: 'pocketpages-selection' },
  ),
)
