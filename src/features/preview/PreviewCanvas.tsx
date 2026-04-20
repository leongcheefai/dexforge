import { PokemonCard } from './PokemonCard'

export function PreviewCanvas() {
  return (
    <div className="flex w-full flex-col items-center gap-8 overflow-y-auto p-8">
      <div className="w-64">
        <PokemonCard />
      </div>
    </div>
  )
}
