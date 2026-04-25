import { get, set } from 'idb-keyval'

export type PokemonNameEntry = { name: string; id: number }

const CACHE_KEY = 'pokemon-name-list'

export async function loadPokemonNameList(): Promise<PokemonNameEntry[]> {
  const cached = await get<PokemonNameEntry[]>(CACHE_KEY)
  if (cached) return cached

  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0')
  if (!res.ok) throw new Error(`PokeAPI list fetch failed: ${res.status}`)

  const data = (await res.json()) as { results: { name: string; url: string }[] }
  if (!Array.isArray(data.results)) throw new Error('Unexpected PokeAPI response shape')

  const entries: PokemonNameEntry[] = data.results
    .map(({ name, url }) => ({
      name,
      id: parseInt(url.split('/').filter(Boolean).pop()!, 10),
    }))
    .filter((e) => e.id >= 1 && e.id <= 1025)

  await set(CACHE_KEY, entries)
  return entries
}
