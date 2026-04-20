import { PokemonCard } from './PokemonCard'
import { PageThumbnail } from './PageThumbnail'

export function PreviewCanvas() {
  return (
    <div className="flex w-full flex-col items-center gap-10 overflow-y-auto p-8">
      <div className="w-64">
        <PokemonCard />
      </div>
      <PageThumbnail />
    </div>
  )
}
