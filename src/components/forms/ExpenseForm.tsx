import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SavedAccountField } from '@/components/forms/SavedAccountField'
import { useTransactions } from '@/contexts/TransactionsContext'
import { normalizeAccountName } from '@/lib/accounts'
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type Currency,
  type ExpenseCategory,
} from '@/types/finance'
import { cn } from '@/lib/utils'
import { todayISO } from '@/lib/format'

interface ExpenseFormProps {
  initial?: Expense
  onSuccess?: () => void
  compact?: boolean
}

export function ExpenseForm({ initial, onSuccess, compact }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useTransactions()
  const [submitting, setSubmitting] = useState(false)

  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [category, setCategory] = useState<ExpenseCategory | string>(
    initial?.category ?? 'Alimentación'
  )
  const [detail, setDetail] = useState(initial?.detail ?? '')
  const [amount, setAmount] = useState(String(initial?.amount ?? ''))
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'EUR')
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const categoryOptions = EXPENSE_CATEGORIES.includes(category as ExpenseCategory)
    ? EXPENSE_CATEGORIES
    : [category as ExpenseCategory, ...EXPENSE_CATEGORIES]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    const accountName = normalizeAccountName(paymentMethod)
    if (!parsed || parsed <= 0 || !detail.trim() || !accountName) {
      toast.error('Completa los campos obligatorios')
      return
    }

    const data = {
      date,
      category: category as ExpenseCategory,
      detail: detail.trim(),
      amount: parsed,
      currency,
      paymentMethod: accountName,
      notes: notes.trim(),
    }

    setSubmitting(true)
    try {
      if (initial) {
        await updateExpense(initial.id, data)
        toast.success('Gasto actualizado')
      } else {
        await addExpense(data)
        toast.success('Gasto añadido')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = compact ? 'min-h-10' : ''
  const labelClass = compact ? 'text-sm' : ''

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', compact && 'space-y-3')}>
      <div className={cn('grid gap-4', compact ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-2')}>
        <div className="space-y-2">
          <Label htmlFor="exp-date" className={labelClass}>Fecha</Label>
          <Input
            id="exp-date"
            type="date"
            className={fieldClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>Categoría</Label>
          <Select
            value={category}
            onValueChange={(v: string) => setCategory(v as ExpenseCategory)}
            disabled={submitting}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="exp-detail" className={labelClass}>Detalle</Label>
          <Input
            id="exp-detail"
            className={fieldClass}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp-amount" className={labelClass}>Monto</Label>
          <Input
            id="exp-amount"
            type="number"
            step="0.01"
            min="0.01"
            className={fieldClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>Moneda</Label>
          <Select
            value={currency}
            onValueChange={(v: string) => setCurrency(v as Currency)}
            disabled={submitting}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ARS">ARS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="exp-payment" className={labelClass}>Método de pago</Label>
          <SavedAccountField
            id="exp-payment"
            className={fieldClass}
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="exp-notes">Notas</Label>
          <Textarea
            id="exp-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            disabled={submitting}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initial ? 'Guardar cambios' : 'Añadir gasto'}
      </Button>
      {initial && (
        <p className="text-xs text-muted-foreground">
          Las correcciones crean una nueva transacción y anulan la anterior (registro inmutable).
        </p>
      )}
    </form>
  )
}