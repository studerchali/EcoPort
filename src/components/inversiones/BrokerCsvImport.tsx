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
import { useFinanceStore } from '@/store/financeStore'
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
  const importHoldings = useFinanceStore((s) => s.importHoldings)

  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<BrokerParseResult | null>(null)
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await readFileAsText(file)
    const parsed = parseBrokerCsv(text)
    setResult(parsed)
    setOpen(true)
    e.target.value = ''
  }

  const handleConfirm = () => {
    if (!result || result.holdings.length === 0) {
      toast.error('No hay posiciones para importar')
      return
    }
    const holdings = toInvestmentHoldings(result.holdings)
    importHoldings(holdings, strategy)
    toast.success(
      `${holdings.length} posición${holdings.length > 1 ? 'es' : ''} importada${holdings.length > 1 ? 's' : ''} desde IBKR`
    )
    setOpen(false)
    setResult(null)
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
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Importar CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista previa — Importación CSV</DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-start gap-2 rounded-lg border border-income/30 bg-income/5 p-3 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-income" />
                <div>
                  <p className="font-medium">Datos personales filtrados</p>
                  <p className="text-muted-foreground">
                    Compatible con Informe de actividad IBKR (Posiciones abiertas)
                    y export Open Positions. Solo ticker, unidades y precios;
                    nombre, cuenta y demás datos sensibles se descartan.
                  </p>
                </div>
              </div>

              {result.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p>{w}</p>
                </div>
              ))}

              {result.holdings.length > 0 && (
                <>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Broker:{' '}
                      {result.broker === 'unknown'
                        ? 'Desconocido'
                        : 'IBKR'}
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
                            <TableCell className="text-right">{h.units.toFixed(4)}</TableCell>
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

                  <div className="flex gap-2">
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!result || result.holdings.length === 0}
            >
              Confirmar importación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}