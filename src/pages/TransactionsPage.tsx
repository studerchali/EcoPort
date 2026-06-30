import { useMemo, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { CurrencyAmount } from '@/components/shared/CurrencyAmount'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { formatCurrency } from '@/lib/format'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useFinanceStore } from '@/store/financeStore'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { formatDate } from '@/lib/format'
import { filterByYear, filterByMonthYear } from '@/lib/calculations'
import { categoryBadgeClass } from '@/lib/categoryColors'
import { useAccountSuggestions } from '@/hooks/useAccountSuggestions'
import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  MONTHS_ES,
  type Expense,
  type Income,
} from '@/types/finance'
import type { UnifiedTransaction } from '@/lib/mappers'

export function TransactionsPage() {
  const {
    unified,
    incomes,
    expenses,
    loading,
    error,
    isSupabaseMode,
    deleteIncome,
    deleteExpense,
    refresh,
  } = useTransactions()
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const { kpis } = useFinanceSelectors()
  const accountSuggestions = useAccountSuggestions()

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([...EXPENSE_CATEGORIES, ...INCOME_SOURCES])
    for (const tx of filterByYear(unified, selectedYear)) {
      if (tx.category) set.add(tx.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [unified, selectedYear])

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [sortAsc, setSortAsc] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState<'income' | 'expense'>('expense')
  const [editingIncome, setEditingIncome] = useState<Income | undefined>()
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list: UnifiedTransaction[] = filterByYear(unified, selectedYear)

    if (monthFilter !== 'all') {
      list = filterByMonthYear(list, parseInt(monthFilter), selectedYear)
    }
    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter)
    }
    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter)
    }
    if (accountFilter !== 'all') {
      list = list.filter((t) => t.account === accountFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.account.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }

    return [...list].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      return sortAsc ? cmp : -cmp
    })
  }, [
    unified,
    selectedYear,
    monthFilter,
    typeFilter,
    categoryFilter,
    accountFilter,
    search,
    sortAsc,
  ])

  const openCreate = (type: 'income' | 'expense') => {
    setFormType(type)
    setEditingIncome(undefined)
    setEditingExpense(undefined)
    setFormOpen(true)
  }

  const openEdit = (tx: UnifiedTransaction) => {
    if (tx.type === 'income') {
      const inc = incomes.find((i) => i.id === tx.id)
      if (inc) {
        setFormType('income')
        setEditingIncome(inc)
        setEditingExpense(undefined)
        setFormOpen(true)
      }
    } else {
      const exp = expenses.find((e) => e.id === tx.id)
      if (exp) {
        setFormType('expense')
        setEditingExpense(exp)
        setEditingIncome(undefined)
        setFormOpen(true)
      }
    }
  }

  const handleDelete = async (tx: UnifiedTransaction) => {
    const label = tx.type === 'income' ? 'ingreso' : 'gasto'
    if (!confirm(`¿Anular este ${label}? Se registrará una reversión.`)) return
    setDeletingId(tx.id)
    try {
      if (tx.type === 'income') await deleteIncome(tx.id)
      else await deleteExpense(tx.id)
      toast.success('Transacción anulada')
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
          <h2 className="text-2xl font-bold">Transacciones</h2>
          <p className="text-muted-foreground">
            {filtered.length} registros en {selectedYear}
            {isSupabaseMode && ' · Supabase'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCreate('income')}>
            <TrendingUp className="mr-2 h-4 w-4 text-income" />
            Ingreso
          </Button>
          <Button onClick={() => openCreate('expense')}>
            <TrendingDown className="mr-2 h-4 w-4" />
            Gasto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Ingresos YTD"
          value={formatCurrency(kpis.totalIncomeEUR)}
          icon={TrendingUp}
          variant="income"
        />
        <KpiCard
          title="Gastos YTD"
          value={formatCurrency(kpis.totalExpenseEUR)}
          icon={TrendingDown}
          variant="expense"
        />
        <KpiCard
          title="Balance YTD"
          value={formatCurrency(kpis.netBalanceEUR)}
          icon={Wallet}
          variant="balance"
        />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Libro de transacciones</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por detalle, categoría, cuenta…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={(v: string) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cuentas</SelectItem>
                {accountSuggestions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSortAsc(!sortAsc)}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            {error && (
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                Reintentar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error && (
            <p className="mb-4 text-sm text-expense">{error}</p>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cargando transacciones…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No hay transacciones que coincidan</p>
              <Button className="mt-4" variant="outline" onClick={() => openCreate('expense')}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir primera transacción
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === 'income' ? 'default' : 'secondary'}
                        className={tx.type === 'income' ? 'bg-income/15 text-income' : ''}
                      >
                        {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryBadgeClass(tx.category)}>
                        {tx.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{tx.label}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyAmount
                        amount={tx.amount}
                        currency={tx.currency}
                        variant={tx.type === 'income' ? 'income' : 'expense'}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.account}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tx)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === tx.id}
                          onClick={() => handleDelete(tx)}
                        >
                          {deletingId === tx.id ? (
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIncome || editingExpense
                ? `Editar ${formType === 'income' ? 'ingreso' : 'gasto'}`
                : `Nuevo ${formType === 'income' ? 'ingreso' : 'gasto'}`}
            </DialogTitle>
          </DialogHeader>
          {formType === 'income' ? (
            <IncomeForm
              initial={editingIncome}
              onSuccess={() => setFormOpen(false)}
            />
          ) : (
            <ExpenseForm
              initial={editingExpense}
              onSuccess={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}