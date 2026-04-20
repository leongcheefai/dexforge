import { Download } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { CardSettingsPanel } from '@/features/customization/CardSettingsPanel'
import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
import { PrintSheet } from '@/features/export/PrintSheet'

export default function App() {
  return (
    <>
      <div id="app-shell" className="min-h-screen bg-background text-foreground">
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-border"
          style={{
            background: 'linear-gradient(to bottom, oklch(1 0 0), oklch(0.98 0.004 75))',
            boxShadow: '0 1px 0 oklch(0.60 0.155 75 / 0.15)',
          }}
        >
          <div className="flex items-center gap-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
            <span className="text-base font-semibold tracking-[0.18em] text-primary">
              POCKET
            </span>
            <span className="text-base font-light tracking-[0.18em] text-foreground/40 ml-1">
              PAGES
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase hidden sm:block" style={{ fontFamily: "'DM Mono', monospace" }}>
              ⌘P to print
            </span>
            <Button
              onClick={() => window.print()}
              size="sm"
              className="gap-1.5 uppercase tracking-widest text-[11px] font-semibold h-8 px-4"
            >
              <Download className="h-3 w-3" />
              Print
            </Button>
          </div>
        </header>

        <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
          <aside className="w-72 border-r border-border overflow-y-auto shrink-0 bg-card">
            <CardSettingsPanel />
          </aside>
          <main className="flex-1 overflow-y-auto bg-background">
            <PreviewCanvas />
          </main>
        </div>
      </div>

      <PrintSheet />
      <Toaster />
    </>
  )
}
