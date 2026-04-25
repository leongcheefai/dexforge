import { useSelectionStore } from '@/features/selection/store'
import { useCardSettingsStore } from '@/features/customization/store'
import { PokemonCard } from '@/features/preview/PokemonCard'

const CARDS_PER_PAGE = 9

export function PrintSheet() {
  const { fromId, toId, isGenerated, isPrefetching } = useSelectionStore()
  const gridGap = useCardSettingsStore((s) => s.gridGap)
  const ready = isGenerated && !isPrefetching

  const ids = ready ? Array.from({ length: toId - fromId + 1 }, (_, i) => fromId + i) : []
  const pages: number[][] = []
  for (let i = 0; i < ids.length; i += CARDS_PER_PAGE) {
    pages.push(ids.slice(i, i + CARDS_PER_PAGE))
  }

  return (
    <div id="print-sheet" style={{ display: 'none' }}>
      {pages.map((pageIds, pageIdx) => (
        <div
          key={pageIdx}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 63mm)',
            gridTemplateRows: 'repeat(3, 88mm)',
            gap: `${gridGap}mm`,
            pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'avoid',
            width: 'fit-content',
          }}
        >
          {pageIds.map((id) => (
            <div key={id} style={{ width: '63mm', height: '88mm', overflow: 'hidden' }}>
              <PokemonCard pokemonId={id} />
            </div>
          ))}
          {pageIds.length < CARDS_PER_PAGE &&
            Array.from({ length: CARDS_PER_PAGE - pageIds.length }, (_, i) => (
              <div key={`empty-${i}`} style={{ width: '63mm', height: '88mm' }} />
            ))}
        </div>
      ))}
    </div>
  )
}
