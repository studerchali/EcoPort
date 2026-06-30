import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CurrencyAmount } from '@/components/shared/CurrencyAmount'
import { InvestmentForm } from '@/components/forms/InvestmentForm'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { useInvestments } from '@/contexts/InvestmentsContext'
import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

export function InversionesPage() {
  const { holdingMetrics, totalInvested, totalCurrentValue } =
    useFinanceSelectors()
  const { loading, deleteInvestment } = useInvestments()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalPL = totalCurrentValue - totalInvested
  const totalPLPct = totalInvested > 0 ? totalPL / totalInvested : 0

  const handleDelete = async (id: string, asset: string) => {
    setDeletingId(id)
    try {
      await deleteInvestment(id)
      toast.success(`${asset} eliminado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inversiones</h2>
          <p className="text-muted-foreground">Portfolio y valoración</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Añadir inversión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva inversión</DialogTitle>
            </DialogHeader>
            <InvestmentForm
              compact
              onSuccess={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Capital invertido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-2xl font-bold">
                {formatCurrency(totalInvested, 'USD')}
              </span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Valor actual aprox.
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <span className="text-2xl font-bold">
                  {formatCurrency(totalCurrentValue, 'USD')}
                </span>
                <p
                  className={cn(
                    'text-sm',
                    totalPL >= 0 ? 'text-income' : 'text-expense'
                  )}
                >
                  {totalPL >= 0 ? '+' : ''}
                  {formatCurrency(totalPL, 'USD')} ({formatPercent(totalPLPct)})
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Posiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-2xl font-bold">{holdingMetrics.length}</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : holdingMetrics.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <p>No hay inversiones registradas.</p>
              <p className="mt-1">Añade tu primera posición con el botón superior.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Precio compra</TableHead>
                  <TableHead className="text-right">Precio actual</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdingMetrics.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.ticker}</TableCell>
                    <TableCell>{h.platform}</TableCell>
                    <TableCell className="text-right">
                      {h.units.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(h.avgPrice, 'USD')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(h.currentPrice, 'USD')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(h.currentValue, 'USD')}
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyAmount
                        amount={h.profitLoss}
                        currency="USD"
                        variant={h.profitLoss >= 0 ? 'income' : 'expense'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-expense"
                        disabled={deletingId === h.id}
                        onClick={() => handleDelete(h.id, h.ticker)}
                      >
                        {deletingId === h.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell colSpan={5}>TOTAL</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalCurrentValue, 'USD')}
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyAmount
                      amount={totalPL}
                      currency="USD"
                      variant={totalPL >= 0 ? 'income' : 'expense'}
                    />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}