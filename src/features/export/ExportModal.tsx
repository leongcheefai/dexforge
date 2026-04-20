import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { GeneratePdfOptions } from './pdf'

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
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dexforge.pdf'
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
          <DialogTitle>Export PDF</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Paper Size */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Paper Size</Label>
            <RadioGroup
              value={paperSize}
              onValueChange={(v: string) => setPaperSize(v as GeneratePdfOptions['paperSize'])}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a4" id="paper-a4" />
                <Label htmlFor="paper-a4">A4</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="letter" id="paper-letter" />
                <Label htmlFor="paper-letter">Letter</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Crop Marks */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="crop-marks"
              checked={cropMarks}
              onCheckedChange={(v: boolean | 'indeterminate') => setCropMarks(!!v)}
            />
            <Label htmlFor="crop-marks">Include crop marks</Label>
          </div>

          {/* Cover Page */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="cover-page"
              checked={coverPage}
              onCheckedChange={(v: boolean | 'indeterminate') => setCoverPage(!!v)}
            />
            <Label htmlFor="cover-page">Include cover page</Label>
          </div>

          {/* Page Range */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Page Range</Label>
            <input
              type="text"
              value="1"
              disabled
              className="rounded border bg-muted px-2 py-1 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
