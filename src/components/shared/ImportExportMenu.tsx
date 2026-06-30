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
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await readFileAsText(file)
    const data = parseJSONImport(text)
    if (!data) {
      toast.error('Archivo JSON inválido')
      return
    }
    importData(data, true)
    toast.success('Datos importados correctamente')
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
          <DropdownMenuItem onClick={() => exportJSON(getExportData())}>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (confirm('¿Restaurar datos de ejemplo? Se perderán los cambios.')) {
                resetToSeed()
                toast.success('Datos de ejemplo restaurados')
              }
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar datos de ejemplo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}