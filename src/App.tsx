import { PreviewCanvas } from '@/features/preview/PreviewCanvas'
import { CardSettingsPanel } from '@/features/customization/CardSettingsPanel'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-14 border-b flex items-center justify-between px-4">
        <span className="font-semibold tracking-tight">DexForge</span>
        <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Export PDF
        </button>
      </header>
      <div className="flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <aside className="w-80 border-r overflow-y-auto p-4 shrink-0">
          <CardSettingsPanel />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <PreviewCanvas />
        </main>
      </div>
    </div>
  )
}
