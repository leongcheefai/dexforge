import { useCardSettingsStore } from '@/features/customization/store'
import type { CardSettings } from '@/features/customization/store'

const FONT_FAMILIES = ['Inter', 'Geist', 'Roboto', 'Merriweather', 'Space Mono', 'Lobster'] as const

function isFontFamily(v: string): v is (typeof FONT_FAMILIES)[number] {
  return (FONT_FAMILIES as readonly string[]).includes(v)
}

export interface GeneratePdfOptions {
  paperSize: 'a4' | 'letter'
  cropMarks: boolean
  coverPage: boolean
}

const SPRITE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'

const MM_TO_PT = 2.8346
const CARD_W_PT = 63 * MM_TO_PT  // 178.58pt
const CARD_H_PT = 88 * MM_TO_PT  // 249.44pt

const PAGE_DIM: Record<GeneratePdfOptions['paperSize'], [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

function borderClassToCanvasStyle(style: CardSettings['borderStyle']): {
  dash: number[]
  rounded: boolean
} {
  return {
    dash: style === 'dashed' ? [15, 8] : [],
    rounded: style === 'rounded',
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.stroke()
}

async function renderCardToPng(settings: CardSettings): Promise<Uint8Array> {
  // 10px per mm — 630×880 canvas for a 63×88mm card
  const W = 630
  const H = 880

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = settings.backgroundColor
  ctx.fillRect(0, 0, W, H)

  // Border
  if (settings.borderStyle !== 'none') {
    const { dash, rounded } = borderClassToCanvasStyle(settings.borderStyle)
    ctx.strokeStyle = settings.borderColor
    ctx.lineWidth = 6
    ctx.setLineDash(dash)
    const inset = 3
    if (rounded) {
      roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, 24)
    } else {
      ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2)
    }
    ctx.setLineDash([])
  }

  // Ensure Google Fonts are loaded before drawing text
  await document.fonts.ready

  const safeFont = isFontFamily(settings.fontFamily) ? settings.fontFamily : 'Inter'

  // Number
  if (settings.showNumber) {
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'left'
    ctx.font = `20px ${safeFont}, sans-serif`
    ctx.fillText('#001', 20, 44)
  }

  // Sprite — load as Image with crossOrigin so canvas remains un-tainted
  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = W * 0.6
      const x = (W - size) / 2
      const y = (H - size) / 2 - 30
      ctx.drawImage(img, x, y, size, size)
      resolve()
    }
    img.onerror = () => reject(new Error('Failed to load sprite from GitHub CDN'))
    img.src = SPRITE_URL
  })

  // Name
  if (settings.showName) {
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.font = `bold 32px ${safeFont}, sans-serif`
    ctx.fillText('Bulbasaur', W / 2, H - 28)
  }

  // Export canvas to PNG bytes
  return new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('canvas.toBlob returned null'))
          return
        }
        blob
          .arrayBuffer()
          .then((buf) => resolve(new Uint8Array(buf)))
          .catch(reject)
      },
      'image/png',
    )
  })
}

export async function generatePdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  // pdf-lib is lazy-loaded to keep the initial bundle under 500KB
  const { PDFDocument, rgb } = await import('pdf-lib')

  const settings = useCardSettingsStore.getState()
  const [pageW, pageH] = PAGE_DIM[options.paperSize]
  const doc = await PDFDocument.create()

  // Optional cover page
  if (options.coverPage) {
    const cover = doc.addPage([pageW, pageH])
    cover.drawText('PocketPages', {
      x: pageW / 2 - 60,
      y: pageH / 2 + 20,
      size: 36,
    })
    cover.drawText(
      'Fan-made · Non-commercial · Not affiliated with Nintendo / Game Freak / The Pokémon Company',
      { x: 40, y: 40, size: 8 },
    )
  }

  // Render card to PNG and embed
  const pngBytes = await renderCardToPng(settings)
  const pngImage = await doc.embedPng(pngBytes)

  // Card page
  const page = doc.addPage([pageW, pageH])
  const cardX = (pageW - CARD_W_PT) / 2
  const cardY = (pageH - CARD_H_PT) / 2

  page.drawImage(pngImage, { x: cardX, y: cardY, width: CARD_W_PT, height: CARD_H_PT })

  // Crop marks — thin lines at each corner, offset by a small gap
  if (options.cropMarks) {
    const markLen = 14
    const gap = 4
    const black = rgb(0, 0, 0)
    const corners: [number, number][] = [
      [cardX, cardY],
      [cardX + CARD_W_PT, cardY],
      [cardX, cardY + CARD_H_PT],
      [cardX + CARD_W_PT, cardY + CARD_H_PT],
    ]

    for (const [cx, cy] of corners) {
      // Horizontal marks
      page.drawLine({ start: { x: cx - gap - markLen, y: cy }, end: { x: cx - gap, y: cy }, color: black, thickness: 0.5 })
      page.drawLine({ start: { x: cx + gap, y: cy }, end: { x: cx + gap + markLen, y: cy }, color: black, thickness: 0.5 })
      // Vertical marks
      page.drawLine({ start: { x: cx, y: cy - gap - markLen }, end: { x: cx, y: cy - gap }, color: black, thickness: 0.5 })
      page.drawLine({ start: { x: cx, y: cy + gap }, end: { x: cx, y: cy + gap + markLen }, color: black, thickness: 0.5 })
    }
  }

  return doc.save()
}
