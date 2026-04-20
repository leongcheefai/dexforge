import { PokemonCard } from './PokemonCard'
import { PageThumbnail } from './PageThumbnail'

export function PreviewCanvas() {
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
