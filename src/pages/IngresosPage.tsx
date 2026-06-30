import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUpDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { IncomeForm } from '@/components/forms/IncomeForm'
import { CurrencyAmount } from '@/components/shared/CurrencyAmount'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useFinanceStore } from '@/store/financeStore'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { formatDate } from '@/lib/format'
import { filterByYear } from '@/lib/calculations'
import { MONTHS_ES, type Income } from '@/types/finance'

export function IngresosPage() {
  const { incomes, loading, deleteIncome } = useTransactions()
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const { monthlyBalance, accounts } = useFinanceSelectors()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Income | undefined>()
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [sortAsc, setSortAsc] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = filterByYear(incomes, selectedYear)
    if (monthFilter !== 'all') {
      list = list.filter(
        (i) => new Date(i.date).getMonth() === parseInt(monthFilter)
      )
    }
    if (accountFilter !== 'all') {
      list = list.filter((i) => i.account === accountFilter)
    }
    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      return sortAsc ? cmp : -cmp
    })
  }, [incomes, selectedYear, monthFilter, accountFilter, sortAsc])

  const monthlySummary = monthlyBalance.filter((m) => m.incomeEUR > 0)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Anular este ingreso? Se registrará una reversión.')) return
    setDeletingId(id)
    try {
      await deleteIncome(id)
      toast.success('Ingreso anulado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al anular')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ingresos</h2>
          <p className="text-muted-foreground">
            {filtered.length} registros en {selectedYear}
          </p>
        </div>
        <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo ingreso
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0">
            <CardTitle className="text-base flex-1">Tabla de ingresos</CardTitle>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {MONTHS_ES.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cuentas</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.account} value={a.account}>{a.account}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSortAsc(!sortAsc)}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando ingresos…
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No hay ingresos en {selectedYear}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell>{formatDate(inc.date)}</TableCell>
                      <TableCell>{inc.source}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyAmount amount={inc.amount} currency={inc.currency} variant="income" />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{inc.account}</Badge>
                      </TableCell>
                      <TableCell className="max-w-32 truncate text-muted-foreground">
                        {inc.notes || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditing(inc); setFormOpen(true) }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === inc.id}
                            onClick={() => handleDelete(inc.id)}
                          >
                            {deletingId === inc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-expense" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen mensual EUR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthlySummary.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin ingresos</p>
              ) : (
                monthlySummary.map((m) => (
                  <div key={m.month} className="flex justify-between text-sm">
                    <span>{m.month}</span>
                    <CurrencyAmount amount={m.incomeEUR} variant="income" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {accounts.filter((a) => a.incomeEUR > 0).map((a) => (
                <div key={a.account} className="flex justify-between text-sm">
                  <span className="truncate">{a.account}</span>
                  <CurrencyAmount amount={a.incomeEUR} variant="income" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar ingreso' : 'Nuevo ingreso'}</DialogTitle>
          </DialogHeader>
          <IncomeForm
            initial={editing}
            onSuccess={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}