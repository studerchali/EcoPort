/**
 * One-time script: reads Finanzaspersonales.xlsx and prints seed data summary.
 * Run: node scripts/import-excel.mjs
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const xlsxPath = join(__dirname, '..', 'Finanzaspersonales.xlsx')

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return null
  const utc = (serial - 25569) * 86400 * 1000
  return new Date(utc).toISOString().slice(0, 10)
}

const buf = readFileSync(xlsxPath)
const wb = XLSX.read(buf, { type: 'buffer' })

console.log('Sheets:', wb.SheetNames)

for (const name of ['Ingresos', 'Gastos', 'Balance', 'Inversiones']) {
  const sheet = wb.Sheets[name]
  if (!sheet) continue
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  console.log(`\n=== ${name} (${rows.length} rows) ===`)
  if (name === 'Ingresos' || name === 'Gastos') {
    rows.slice(1, 8).forEach((row, i) => {
      const date = excelDateToISO(row[0])
      console.log(`  Row ${i + 2}: date=${date}`, row.slice(1, 6))
    })
  }
}