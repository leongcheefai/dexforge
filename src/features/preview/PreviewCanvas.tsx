import { useEffect } from 'react'
import { PokemonCard, prefetchRange } from './PokemonCard'
import { PageThumbnail } from './PageThumbnail'
import { useSelectionStore } from '@/features/selection/store'

const CARDS_PER_PAGE = 9

export function PreviewCanvas() {
  const { isGenerated, fromId, toId } = useSelectionStore()

  const setIsPrefetching = useSelectionStore((s) => s.setIsPrefetching)

  useEffect(() => {
    if (!isGenerated) return
    setIsPrefetching(true)
    prefetchRange(fromId, toId).finally(() => setIsPrefetching(false))
  }, [isGenerated, fromId, toId, setIsPrefetching])

  if (isGenerated) {
    const ids = Array.from({ length: toId - fromId + 1 }, (_, i) => fromId + i)
    const pages: number[][] = []
    for (let i = 0; i < ids.length; i += CARDS_PER_PAGE) {
      pages.push(ids.slice(i, i + CARDS_PER_PAGE))
    }

    return (
      <div className="flex w-full flex-col items-center gap-10 overflow-y-auto py-10 px-8">
        {pages.map((pageIds, pageIdx) => (
          <div key={pageIdx} className="flex flex-col items-center gap-3">
            <div
              className="grid grid-cols-3 gap-2 bg-white shadow-md"
              style={{ width: '480px', padding: '24px' }}
            >
              {pageIds.map((id) => (
                <div key={id} style={{ width: '136px' }}>
                  <PokemonCard pokemonId={id} />
                </div>
              ))}
              {pageIds.length < CARDS_PER_PAGE &&
                Array.from({ length: CARDS_PER_PAGE - pageIds.length }, (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="border border-dashed border-muted-foreground/30"
                    style={{ aspectRatio: '63/88', width: '136px' }}
                  />
                ))}
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Page {pageIdx + 1} / {pages.length}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-14 overflow-y-auto py-14 px-8">
      {/* Card spotlight showcase */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute pointer-events-none"
          style={{
            inset: '-5rem',
            background: 'radial-gradient(ellipse 65% 65% at 50% 50%, oklch(0.60 0.155 75 / 0.07) 0%, transparent 70%)',
          }}
        />
        <div className="relative w-52 drop-shadow-2xl">
          <PokemonCard />
        </div>
      </div>

      {/* Page thumbnail */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-border" />
          <span
            className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Page Preview
          </span>
          <div className="h-px w-10 bg-border" />
        </div>
        <PageThumbnail />
      </div>
    </div>
  )
}
