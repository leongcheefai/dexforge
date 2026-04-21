import { get, set } from 'idb-keyval'

type PokemonEntry = { name: string; types: string[] }

const memCache = new Map<number, PokemonEntry>()
const inFlight = new Map<number, Promise<void>>()

export function getCachedPokemon(id: number): PokemonEntry | undefined {
  return memCache.get(id)
}

export function fetchPokemonData(id: number): Promise<void> {
  if (memCache.has(id)) return Promise.resolve()

  const existing = inFlight.get(id)
  if (existing) return existing

  const promise = (async () => {
    const idbEntry = await get<PokemonEntry>(`pk:${id}`)
    if (idbEntry) {
      memCache.set(id, idbEntry)
      return
    }
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
    const entry: PokemonEntry = {
      name: (data.name as string).replace(/^./, (c: string) => c.toUpperCase()),
      types: (data.types as { type: { name: string } }[]).map((t) => t.type.name),
    }
    memCache.set(id, entry)
    set(`pk:${id}`, entry)
  })().finally(() => inFlight.delete(id))

  inFlight.set(id, promise)
  return promise
}

export async function prefetchRange(from: number, to: number, concurrency = 30): Promise<void> {
  const ids = Array.from({ length: to - from + 1 }, (_, i) => from + i).filter(
    (id) => !memCache.has(id),
  )
  for (let i = 0; i < ids.length; i += concurrency) {
    await Promise.all(ids.slice(i, i + concurrency).map(fetchPokemonData))
  }
}
