import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { CurrencyAmount } from '@/components/shared/CurrencyAmount'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useFinanceStore } from '@/store/financeStore'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { formatDate } from '@/lib/format'
import { filterByYear, filterByMonthYear } from '@/lib/calculations'
import { categoryBadgeClass } from '@/lib/categoryColors'
import { EXPENSE_CATEGORIES, MONTHS_ES, type Expense } from '@/types/finance'

export function GastosPage() {
  const { expenses, loading, deleteExpense } = useTransactions()
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const { categories, monthlyBalance } = useFinanceSelectors()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | undefined>()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(EXPENSE_CATEGORIES)
    for (const expense of filterByYear(expenses, selectedYear)) {
      if (expense.category) set.add(expense.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [expenses, selectedYear])

  const filtered = useMemo(() => {
    let list = filterByYear(expenses, selectedYear)
    if (monthFilter !== 'all') {
      list = filterByMonthYear(list, parseInt(monthFilter), selectedYear)
    }
    if (categoryFilter !== 'all') {
      list = list.filter((e) => e.category === categoryFilter)
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, selectedYear, categoryFilter, monthFilter])

  const monthlyExpenses = monthlyBalance.filter((m) => m.expenseEUR > 0)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Anular este gasto? Se registrará una reversión.')) return
    setDeletingId(id)
    try {
      await deleteExpense(id)
      toast.success('Gasto anulado')
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
          <h2 className="text-2xl font-bold">Gastos</h2>
          <p className="text-muted-foreground">
            {filtered.length} registros en {selectedYear}
          </p>
        </div>
        <Button onClick={() => { setEditing(undefined); setFormOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0">
            <CardTitle className="text-base flex-1">Tabla de gastos</CardTitle>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categoryOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando gastos…
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No hay gastos en {selectedYear}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{formatDate(exp.date)}</TableCell>
                      <TableCell>
                        <Badge className={categoryBadgeClass(exp.category)}>
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{exp.detail}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyAmount amount={exp.amount} currency={exp.currency} variant="expense" />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {exp.paymentMethod}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditing(exp); setFormOpen(true) }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === exp.id}
                            onClick={() => handleDelete(exp.id)}
                          >
                            {deletingId === exp.id ? (
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
              <CardTitle className="text-base">Gastos por categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((c) => (
                <div key={c.category} className="flex justify-between text-sm">
                  <span>{c.category} ({c.count})</span>
                  <CurrencyAmount amount={c.totalEUR} variant="expense" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen mensual EUR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthlyExpenses.map((m) => (
                <div key={m.month} className="flex justify-between text-sm">
                  <span>{m.month}</span>
                  <CurrencyAmount amount={m.expenseEUR} variant="expense" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            initial={editing}
            onSuccess={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}