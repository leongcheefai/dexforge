const blobCache = new Map<string, string>()
const inFlight = new Map<string, Promise<string>>()

export function getCachedBlobUrl(url: string): string | undefined {
  return blobCache.get(url)
}

export function loadSprite(url: string): Promise<string> {
  const cached = blobCache.get(url)
  if (cached) return Promise.resolve(cached)

  const existing = inFlight.get(url)
  if (existing) return existing

  const promise = fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      blobCache.set(url, blobUrl)
      inFlight.delete(url)
      return blobUrl
    })
    .catch(() => {
      inFlight.delete(url)
      return url
    })

  inFlight.set(url, promise)
  return promise
}
