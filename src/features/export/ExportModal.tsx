import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { GeneratePdfOptions } from './pdf'

const MONO = { fontFamily: "'DM Mono', monospace" }

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [paperSize, setPaperSize] = useState<GeneratePdfOptions['paperSize']>('a4')
  const [cropMarks, setCropMarks] = useState(false)
  const [coverPage, setCoverPage] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { generatePdf } = await import('./pdf')
      const bytes = await generatePdf({ paperSize, cropMarks, coverPage })
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pocketpages.pdf'
      a.click()
      URL.revokeObjectURL(url)
      onOpenChange(false)
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle
            className="text-[11px] uppercase tracking-[0.2em] text-primary/80 font-medium"
            style={MONO}
          >
            Export PDF
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
              Paper Size
            </p>
            <RadioGroup
              value={paperSize}
              onValueChange={(v: string) => setPaperSize(v as GeneratePdfOptions['paperSize'])}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a4" id="paper-a4" />
                <Label htmlFor="paper-a4" className="font-normal cursor-pointer">A4</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="letter" id="paper-letter" />
                <Label htmlFor="paper-letter" className="font-normal cursor-pointer">Letter</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
              Options
            </p>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="crop-marks"
                checked={cropMarks}
                onCheckedChange={(v: boolean | 'indeterminate') => setCropMarks(!!v)}
              />
              <Label htmlFor="crop-marks" className="font-normal cursor-pointer text-sm text-foreground/80">
                Include crop marks
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="cover-page"
                checked={coverPage}
                onCheckedChange={(v: boolean | 'indeterminate') => setCoverPage(!!v)}
              />
              <Label htmlFor="cover-page" className="font-normal cursor-pointer text-sm text-foreground/80">
                Include cover page
              </Label>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={MONO}>
              Page Range
            </p>
            <input
              type="text"
              value="1"
              disabled
              className="rounded-md border border-input bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full uppercase tracking-widest text-[11px] font-semibold h-9"
          >
            {generating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
