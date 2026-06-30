import { useRef, useState } from 'react'
import { Upload, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useInvestments } from '@/contexts/InvestmentsContext'
import {
  parseBrokerCsv,
  toInvestmentHoldings,
  type BrokerParseResult,
} from '@/lib/import-broker-csv'
import { readFileAsText } from '@/lib/import-export'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'

export function BrokerCsvImport() {
  const fileRef = useRef<HTMLInputElement>(null)
  const { importHoldings } = useInvestments()

  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<BrokerParseResult | null>(null)
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge')
  const [importing, setImporting] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await readFileAsText(file)
    const parsed = parseBrokerCsv(text)
    setResult(parsed)
    setStrategy('merge')
    setOpen(true)
    e.target.value = ''
  }

  const handleConfirm = async () => {
    if (!result || result.holdings.length === 0) {
      toast.error('No hay posiciones para importar')
      return
    }
    const holdings = toInvestmentHoldings(result.holdings)
    setImporting(true)
    try {
      await importHoldings(holdings, strategy)
      toast.success(
        `${holdings.length} posición${holdings.length > 1 ? 'es' : ''} importada${holdings.length > 1 ? 's' : ''} desde IBKR`
      )
      setOpen(false)
      setResult(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al importar')
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={handleFile}
      />
      <Button variant="outline" onClick={() => fileRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Importar CSV IBKR
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(85vh,640px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 border-b px-5 py-4">
            <DialogTitle>Vista previa — Importación CSV</DialogTitle>
          </DialogHeader>

          {result && (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              <div className="flex items-start gap-2 rounded-lg border border-income/30 bg-income/5 p-3 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-income" />
                <div>
                  <p className="font-medium">Datos personales filtrados</p>
                  <p className="text-muted-foreground">
                    Solo ticker, unidades y precios. Nombre, cuenta y demás datos
                    sensibles del informe IBKR se descartan.
                  </p>
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
                  <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    Notas de importación
                  </div>
                  <ul className="list-inside list-disc space-y-0.5">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.holdings.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Broker:{' '}
                      {result.broker === 'unknown' ? 'Desconocido' : 'IBKR'}
                    </Badge>
                    {result.format !== 'unknown' && (
                      <Badge variant="outline">
                        {result.format === 'activity-statement'
                          ? 'Informe de actividad'
                          : 'Open Positions'}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {result.holdings.length} posiciones
                    </Badge>
                  </div>

                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticker</TableHead>
                          <TableHead className="text-right">Unidades</TableHead>
                          <TableHead className="text-right">Precio medio</TableHead>
                          <TableHead className="text-right">Precio actual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.holdings.map((h, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{h.ticker}</TableCell>
                            <TableCell className="text-right">
                              {h.units.toFixed(4)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(h.avgPrice, 'USD')}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(h.currentPrice, 'USD')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={strategy === 'merge' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStrategy('merge')}
                    >
                      Fusionar con existente
                    </Button>
                    <Button
                      variant={strategy === 'replace' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStrategy('replace')}
                    >
                      Reemplazar portfolio
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="shrink-0 !mx-0 !mb-0 border-t bg-muted/50 px-5 py-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={importing || !result || result.holdings.length === 0}
            >
              {importing ? 'Importando…' : 'Confirmar importación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}