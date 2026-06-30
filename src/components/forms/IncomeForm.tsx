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
import { useTransactions } from '@/contexts/TransactionsContext'
import { ACCOUNTS, type Income, type Currency, type AccountName } from '@/types/finance'
import { cn } from '@/lib/utils'
import { todayISO } from '@/lib/format'

interface IncomeFormProps {
  initial?: Income
  onSuccess?: () => void
  compact?: boolean
}

export function IncomeForm({ initial, onSuccess, compact }: IncomeFormProps) {
  const { addIncome, updateIncome } = useTransactions()
  const [submitting, setSubmitting] = useState(false)

  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [source, setSource] = useState(initial?.source ?? 'Trabajo')
  const [amount, setAmount] = useState(String(initial?.amount ?? ''))
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? 'EUR')
  const [account, setAccount] = useState<AccountName>(initial?.account ?? 'Santander')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0 || !source.trim()) {
      toast.error('Completa los campos obligatorios')
      return
    }

    const data = {
      date,
      source: source.trim(),
      amount: parsed,
      currency,
      account,
      notes: notes.trim(),
    }

    setSubmitting(true)
    try {
      if (initial) {
        await updateIncome(initial.id, data)
        toast.success('Ingreso actualizado')
      } else {
        await addIncome(data)
        toast.success('Ingreso añadido')
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
          <Label htmlFor="inc-date" className={labelClass}>Fecha</Label>
          <Input
            id="inc-date"
            type="date"
            className={fieldClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inc-source" className={labelClass}>Fuente</Label>
          <Input
            id="inc-source"
            className={fieldClass}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inc-amount" className={labelClass}>Monto</Label>
          <Input
            id="inc-amount"
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
          <Label className={labelClass}>Cuenta de entrada</Label>
          <Select
            value={account}
            onValueChange={(v: string) => setAccount(v as AccountName)}
            disabled={submitting}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNTS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="inc-notes">Notas</Label>
          <Textarea
            id="inc-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            disabled={submitting}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initial ? 'Guardar cambios' : 'Añadir ingreso'}
      </Button>
      {initial && (
        <p className="text-xs text-muted-foreground">
          Las correcciones crean una nueva transacción y anulan la anterior (registro inmutable).
        </p>
      )}
    </form>
  )
}