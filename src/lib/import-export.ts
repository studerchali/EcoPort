import type { FinanceData, Income, Expense } from '@/types/finance'

export function exportToJSON(data: FinanceData): string {
  return JSON.stringify(data, null, 2)
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportJSON(data: FinanceData) {
  const json = exportToJSON(data)
  const date = new Date().toISOString().slice(0, 10)
  downloadFile(json, `ecoport-backup-${date}.json`, 'application/json')
}

function escapeCSV(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportIncomesCSV(incomes: Income[]) {
  const headers = ['fecha', 'fuente', 'monto', 'moneda', 'cuenta', 'notas']
  const rows = incomes.map((i) =>
    [i.date, i.source, i.amount, i.currency, i.account, i.notes]
      .map(escapeCSV)
      .join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, 'ingresos.csv', 'text/csv;charset=utf-8')
}

export function exportExpensesCSV(expenses: Expense[]) {
  const headers = [
    'fecha',
    'categoria',
    'detalle',
    'monto',
    'moneda',
    'metodo_pago',
    'notas',
  ]
  const rows = expenses.map((e) =>
    [
      e.date,
      e.category,
      e.detail,
      e.amount,
      e.currency,
      e.paymentMethod,
      e.notes,
    ]
      .map(escapeCSV)
      .join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, 'gastos.csv', 'text/csv;charset=utf-8')
}

export function parseJSONImport(content: string): FinanceData | null {
  try {
    const data = JSON.parse(content) as FinanceData
    if (!data.incomes || !data.expenses || !data.settings) return null
    return data
  } catch {
    return null
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}