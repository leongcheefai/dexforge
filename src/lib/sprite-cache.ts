const blobCache = new Map<string, string>()
const inFlight = new Map<string, Promise<string>>()
let activeCount = 0
const waitQueue: Array<() => void> = []
const MAX_CONCURRENT = 20

function dequeue() {
  if (waitQueue.length > 0 && activeCount < MAX_CONCURRENT) {
    waitQueue.shift()!()
  }
}

export function getCachedBlobUrl(url: string): string | undefined {
  return blobCache.get(url)
}

export function loadSprite(url: string): Promise<string> {
  const cached = blobCache.get(url)
  if (cached) return Promise.resolve(cached)

  const existing = inFlight.get(url)
  if (existing) return existing

  const promise = new Promise<string>((resolve) => {
    const doFetch = () => {
      activeCount++
      fetch(url)
        .then((r) => r.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          blobCache.set(url, blobUrl)
          resolve(blobUrl)
        })
        .catch(() => resolve(url))
        .finally(() => {
          activeCount--
          inFlight.delete(url)
          dequeue()
        })
    }

    if (activeCount < MAX_CONCURRENT) {
      doFetch()
    } else {
      waitQueue.push(doFetch)
    }
  })

  inFlight.set(url, promise)
  return promise
}
