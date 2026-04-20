import { PokemonCard } from './PokemonCard'

export function PageThumbnail() {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">Page preview</span>
      <div className="grid grid-cols-3 gap-1 w-60">
        <PokemonCard mini />
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="border border-dashed border-muted-foreground/40"
            style={{ aspectRatio: '63/88' }}
          />
        ))}
      </div>
    </div>
  )
}
