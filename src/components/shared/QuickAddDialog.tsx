import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { IncomeForm } from '@/components/forms/IncomeForm'
import { ExpenseForm } from '@/components/forms/ExpenseForm'

interface QuickAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Tab = 'income' | 'expense'

export function QuickAddDialog({ open, onOpenChange }: QuickAddDialogProps) {
  const [tab, setTab] = useState<Tab>('income')

  const handleSuccess = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Añadir transacción</DialogTitle>
        </DialogHeader>

        <div className="border-b px-6 py-3">
          <div className="inline-flex h-9 rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => setTab('income')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                tab === 'income'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingUp className="h-3.5 w-3.5 text-income" />
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setTab('expense')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                tab === 'expense'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingDown className="h-3.5 w-3.5 text-expense" />
              Gasto
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {tab === 'income' ? (
            <IncomeForm compact onSuccess={handleSuccess} />
          ) : (
            <ExpenseForm compact onSuccess={handleSuccess} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}