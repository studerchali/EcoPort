import { useRef } from 'react'
import { Download, Upload, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useInvestments } from '@/contexts/InvestmentsContext'
import { useFinanceStore } from '@/store/financeStore'
import {
  exportJSON,
  exportIncomesCSV,
  exportExpensesCSV,
  parseJSONImport,
  readFileAsText,
} from '@/lib/import-export'
import { toast } from 'sonner'

export function ImportExportMenu() {
  const fileRef = useRef<HTMLInputElement>(null)
  const getExportData = useFinanceStore((s) => s.getExportData)
  const importData = useFinanceStore((s) => s.importData)
  const resetToSeed = useFinanceStore((s) => s.resetToSeed)
  const {
    incomes,
    expenses,
    isSupabaseMode,
    addIncome,
    addExpense,
    refresh: refreshTransactions,
  } = useTransactions()
  const { holdings, importHoldings, refresh: refreshInvestments } = useInvestments()

  const buildExportPayload = () => {
    const base = getExportData()
    return {
      ...base,
      incomes,
      expenses,
      holdings,
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await readFileAsText(file)
    const data = parseJSONImport(text)
    if (!data) {
      toast.error('Archivo JSON inválido')
      return
    }

    try {
      if (isSupabaseMode) {
        for (const income of data.incomes) {
          await addIncome(income)
        }
        for (const expense of data.expenses) {
          await addExpense(expense)
        }
        if (data.holdings?.length) {
          await importHoldings(data.holdings, 'replace')
        }
        await refreshTransactions()
        await refreshInvestments()
      } else {
        importData(data, true)
      }
      toast.success('Datos importados correctamente')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al importar datos'
      )
    }
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Datos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportJSON(buildExportPayload())}>
            <Download className="mr-2 h-4 w-4" />
            Exportar JSON (backup)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportIncomesCSV(incomes)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Ingresos CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportExpensesCSV(expenses)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Gastos CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Importar JSON
          </DropdownMenuItem>
          {!isSupabaseMode && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    confirm(
                      '¿Restaurar datos de ejemplo? Se perderán los cambios.'
                    )
                  ) {
                    resetToSeed()
                    toast.success('Datos de ejemplo restaurados')
                  }
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurar datos de ejemplo
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}