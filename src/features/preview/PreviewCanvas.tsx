import { useEffect, useRef, useState } from 'react'
import { PokemonCard, prefetchRange } from './PokemonCard'
import { PageThumbnail } from './PageThumbnail'
import { useSelectionStore } from '@/features/selection/store'
import { useCardSettingsStore } from '@/features/customization/store'

const CARDS_PER_PAGE = 9
const EAGER_PAGES = 3
const PAGE_PLACEHOLDER_HEIGHT = 680

interface VirtualPageProps {
  pageIds: number[]
  pageIdx: number
  totalPages: number
  eager: boolean
}

const PREVIEW_PX_PER_MM = 136 / 63

function VirtualPage({ pageIds, pageIdx, totalPages, eager }: VirtualPageProps) {
  const [visible, setVisible] = useState(eager)
  const ref = useRef<HTMLDivElement>(null)
  const gridGap = useCardSettingsStore((s) => s.gridGap)
  const gapPx = Math.round(gridGap * PREVIEW_PX_PER_MM)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-3"
      style={{ minHeight: visible ? undefined : PAGE_PLACEHOLDER_HEIGHT }}
    >
      {visible && (
        <>
          <div
            className="bg-white shadow-md"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, 136px)`,
              padding: '24px',
              gap: `${gapPx}px`,
            }}
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
            Page {pageIdx + 1} / {totalPages}
          </span>
        </>
      )}
    </div>
  )
}

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
          <VirtualPage
            key={pageIdx}
            pageIds={pageIds}
            pageIdx={pageIdx}
            totalPages={pages.length}
            eager={pageIdx < EAGER_PAGES}
          />
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
            background: 'radial-gradient(ellipse 65% 65% at 50% 50%, oklch(0.52 0.22 25 / 0.06) 0%, transparent 70%)',
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
