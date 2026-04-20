import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Download } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CardSettingsPanel } from '@/features/customization/CardSettingsPanel'
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
import { PrintSheet } from '@/features/export/PrintSheet'
import { useSelectionStore } from '@/features/selection/store'

export default function App() {
  const { isGenerated, isPrefetching } = useSelectionStore()
  const printDisabled = !isGenerated || isPrefetching
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <>
      <div id="app-shell" className="min-h-screen bg-background text-foreground">
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-border"
          style={{
            background: 'linear-gradient(to bottom, oklch(1 0 0), oklch(0.97 0.006 22))',
            boxShadow: '0 1px 0 oklch(0.52 0.22 25 / 0.18)',
          }}
        >
          <h1 className="flex items-center gap-0.5 m-0" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="text-base font-semibold tracking-[0.18em] text-primary">
              PAPER
            </span>
            <span className="text-base font-light tracking-[0.18em] text-foreground/40 ml-1">
              DEX
            </span>
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase hidden sm:block" style={{ fontFamily: "'DM Mono', monospace" }}>
              ⌘P to print
            </span>
            <button
              onClick={() => setSupportOpen(true)}
              aria-label="Support PaperDex"
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-4 h-8 text-black font-semibold text-[11px] uppercase tracking-widest border border-black focus:outline-none"
              style={{ background: '#FFDD00' }}
            >
              ☕ support
            </button>
            <Button
              onClick={() => window.print()}
              disabled={printDisabled}
              size="sm"
              className="gap-1.5 uppercase tracking-widest text-[11px] font-semibold h-8 px-4"
            >
              <Download className="h-3 w-3" />
              {isPrefetching ? 'Loading…' : 'Print'}
            </Button>
          </div>
        </header>

        <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
          <aside className="w-72 border-r border-border overflow-y-auto shrink-0 bg-card">
            <h2 className="sr-only">Card Settings</h2>
            <CardSettingsPanel />
          </aside>
          <main className="flex-1 overflow-y-auto bg-background">
            <h2 className="sr-only">Binder Preview</h2>
            <PreviewCanvas />
          </main>
        </div>
      </div>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Support PaperDex ❤️</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you so much for using PaperDex! This tool is completely free and I maintain it in
            my spare time. If it's been useful to you, any support is genuinely appreciated — it
            helps keep the project going. 🙏
          </p>

          <a
            href="https://www.buymeacoffee.com/cheefai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-md font-semibold text-sm py-3 text-black"
            style={{ background: '#FFDD00' }}
          >
            ☕ Buy Me a Coffee
          </a>

          <Button variant="ghost" size="sm" className="w-full" onClick={() => setSupportOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <footer className="sr-only">
        <h2>About PaperDex</h2>
        <p>
          PaperDex is a free, browser-based tool for generating printable Pokémon binder placeholder
          PDFs. Collectors use it to fill empty slots in their Pokémon card binders with
          custom-designed placeholders while they hunt for the real cards.
        </p>
        <h3>How it works</h3>
        <p>
          Select Pokémon by generation preset, name search, or Pokédex number range. Choose from
          seven sprite styles including Gen 1–9 pixel art and official artwork. Customize card
          border color, background gradient, font family, and whether to show the Pokédex number.
          The live 3×3 page preview updates instantly, and when you are ready, export to a
          print-ready PDF via pdf-lib or use your browser's built-in print dialog.
        </p>
        <h3>Features</h3>
        <ul>
          <li>Over 1000 Pokémon supported, sourced from PokéAPI</li>
          <li>Seven sprite styles: default, shiny, female, pixel art (Gen 1–9)</li>
          <li>Multi-language Pokémon names</li>
          <li>Custom border styles, colors, and card fonts</li>
          <li>Pokédex number toggle and gradient backgrounds</li>
          <li>Generation presets for quick selection</li>
          <li>Sprites and API responses cached locally for offline use</li>
          <li>No account, no login, completely free</li>
        </ul>
        <h3>Who is it for?</h3>
        <p>
          PaperDex is built for Pokémon TCG collectors who want neat, consistent placeholders in
          their binders. Whether you are building a living Pokédex binder, organizing sets, or just
          keeping track of missing cards, PaperDex lets you print professional-looking placeholders
          in minutes.
        </p>
      </footer>

      <PrintSheet />
      <Toaster />
      <Analytics />
    </>
  )
}
