/**
 * Genera src/data/seed.ts desde Finanzaspersonales.xlsx y el CSV IBKR.
 * Uso: node scripts/generate-seed.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

/** Mantener sincronizado con src/lib/category-map.ts */
const LEGACY_EXPENSE_CATEGORY_MAP = {
  Super: 'Alimentación',
  Comida: 'Alimentación',
  Alquiler: 'Vivienda',
  OCIO: 'Ocio',
  Viaje: 'Ocio',
  Devolucion: 'Otro',
  Transporte: 'Transporte',
  Suscripciones: 'Suscripciones',
  Salud: 'Salud',
  Educación: 'Educación',
  Servicios: 'Servicios',
  Otro: 'Otro',
}

const LEGACY_INCOME_SOURCE_MAP = {
  Trabajo: 'Salario',
  Salario: 'Salario',
  Nómina: 'Salario',
  Nomina: 'Salario',
  Freelance: 'Freelance',
  Autónomo: 'Freelance',
  Inversiones: 'Inversiones',
  Alquiler: 'Alquiler',
  Venta: 'Venta',
  Regalo: 'Regalo',
  Reembolso: 'Reembolso',
  Otro: 'Otro',
}

function mapExpenseCategory(name) {
  const trimmed = String(name ?? '').trim()
  return LEGACY_EXPENSE_CATEGORY_MAP[trimmed] ?? (trimmed || 'Otro')
}

function mapIncomeSource(name) {
  const trimmed = String(name ?? '').trim()
  return LEGACY_INCOME_SOURCE_MAP[trimmed] ?? (trimmed || 'Otro')
}

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return null
  return new Date((serial - 25569) * 86400 * 1000).toISOString().slice(0, 10)
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else inQuotes = !inQuotes
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else current += char
  }
  result.push(current.trim())
  return result
}

function normalizeHeader(h) {
  return h.toLowerCase().replace(/"/g, '').replace(/\ufeff/g, '').trim()
}

function findColumnIndex(headers, aliases) {
  const normalized = headers.map(normalizeHeader)
  for (const alias of aliases) {
    const idx = normalized.findIndex((h) => h === alias || h.includes(alias))
    if (idx >= 0) return idx
  }
  return -1
}

function parseNumber(val) {
  const cleaned = String(val ?? '')
    .replace(/"/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isNaN(n) ? 0 : n
}

function parseIbkrHoldings(csvPath) {
  const content = readFileSync(csvPath, 'utf8').replace(/^\ufeff/, '')
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const holdings = []
  let sectionHeaders = []
  let inPositions = false

  for (const line of lines) {
    const row = parseCSVLine(line)
    const section = normalizeHeader(row[0] ?? '')
    const rowType = row[1] ?? ''

    if (!['posiciones abiertas', 'open positions'].includes(section)) {
      if (inPositions && rowType !== 'Data') inPositions = false
      continue
    }

    if (rowType === 'Header') {
      inPositions = true
      sectionHeaders = row.slice(2)
      continue
    }

    if (rowType === 'Total' || rowType === 'SubTotal') {
      if (rowType === 'Total') inPositions = false
      continue
    }

    if (rowType !== 'Data' || !inPositions) continue

    const dataRow = row.slice(2)
    const symbolIdx = findColumnIndex(sectionHeaders, ['symbol', 'símbolo', 'simbolo'])
    const unitsIdx = findColumnIndex(sectionHeaders, ['quantity', 'cantidad', 'shares'])
    const avgIdx = findColumnIndex(sectionHeaders, ['precio de coste', 'cost basis', 'avg price'])
    const currentIdx = findColumnIndex(sectionHeaders, ['precio de cierre', 'close price', 'market price'])

    if (symbolIdx < 0 || unitsIdx < 0) continue

    const ticker = dataRow[symbolIdx]?.replace(/"/g, '').trim()
    const units = parseNumber(dataRow[unitsIdx])
    if (!ticker || units === 0 || ticker === 'USD' || ticker === 'EUR') continue

    const avgPrice = avgIdx >= 0 ? parseNumber(dataRow[avgIdx]) : 0
    const currentPrice = currentIdx >= 0 ? parseNumber(dataRow[currentIdx]) : avgPrice

    holdings.push({
      ticker,
      platform: 'IBKR',
      units,
      avgPrice: avgPrice || currentPrice,
      currentPrice: currentPrice || avgPrice,
    })
  }

  return holdings
}

function parseIncomes(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const incomes = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const date = excelDateToISO(row[0])
    const source = mapIncomeSource(row[1])
    const amount = Number(row[2])
    const currency = String(row[3] ?? 'EUR').trim()
    const account = String(row[4] ?? '').trim()
    const notes = String(row[5] ?? '').trim()

    if (!date || !source || !amount || amount <= 0 || !account) continue

    incomes.push({ date, source, amount, currency, account, notes })
  }

  return incomes
}

function parseExpenses(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const expenses = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const date = excelDateToISO(row[0])
    const category = mapExpenseCategory(row[1])
    const detail = String(row[2] ?? '').trim()
    const amount = Number(row[3])
    const currency = String(row[4] ?? 'EUR').trim()
    const paymentMethod = String(row[5] ?? '').trim()
    const notes = String(row[6] ?? '').trim()

    if (!date || !category || !detail || !amount || amount <= 0 || !paymentMethod) continue

    expenses.push({ date, category, detail, amount, currency, paymentMethod, notes })
  }

  return expenses
}

const USD_ACCOUNTS = new Set([
  'Wells Fargo Checking',
  'Wells Fargo AC',
  'Capital One Savings',
  'Capital One Credit',
  'Discover Credit',
  'IBKR',
])

function accountCurrency(name) {
  return USD_ACCOUNTS.has(name) ? 'USD' : 'EUR'
}

function parseBalanceSheet(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const accountBalances = []
  const balanceHistory = []
  const debts = []
  const savedAccounts = new Set()

  const ACCOUNT_BLOCK_END = 10
  for (let i = 1; i <= ACCOUNT_BLOCK_END && i < rows.length; i++) {
    const row = rows[i]
    const account = row[9]
    const amount = row[10]
    if (
      account &&
      typeof account === 'string' &&
      !['BALANCE', 'DEUDA', 'TOTAL', 'Cuenta'].includes(account) &&
      typeof amount === 'number'
    ) {
      const normalized =
        account === 'Traderepublic' ? 'TradeRepublic' : account
      accountBalances.push({
        account: normalized,
        amount,
        currency: accountCurrency(normalized),
      })
      savedAccounts.add(normalized)
    }
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const histDate = row[16]
    if (histDate && typeof histDate === 'number' && histDate > 40000) {
      balanceHistory.push({
        date: excelDateToISO(histDate),
        balanceUSD: Number(row[17] ?? 0),
        debtUSD: Number(row[18] ?? 0),
        balanceEUR: Number(row[19] ?? 0),
        debtEUR: Number(row[20] ?? 0),
      })
    }
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const name = row[9]
    const amount = row[10]
    if (
      name &&
      typeof name === 'string' &&
      ['Emi', 'Euge', 'Lucho'].includes(name) &&
      typeof amount === 'number' &&
      amount > 0
    ) {
      debts.push({ name, amount, currency: 'EUR' })
    }
  }

  return { accountBalances, balanceHistory, debts, savedAccounts }
}

function parseTradeRepublicHoldings(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const holdings = []

  for (const row of rows) {
    const label = String(row[0] ?? '').trim()
    const platform = String(row[1] ?? '').trim()
    if (platform !== 'TradeRepublic') continue

    const units = Number(row[2])
    const avgPrice = Number(row[3])
    const currentPrice = Number(row[5])
    if (!units || !avgPrice || !currentPrice) continue

    let ticker = label
    if (label.includes('MSCI EM')) ticker = 'EM IMI'
    else if (label.includes('MSCI WORLD')) ticker = 'MSCI World'
    else ticker = label.replace(/^(LON:|NYSE:)/, '').trim()

    holdings.push({
      ticker,
      platform: 'TradeRepublic',
      units,
      avgPrice,
      currentPrice,
    })
  }

  return holdings
}

const wb = XLSX.read(readFileSync(join(root, 'Finanzaspersonales.xlsx')))
const incomes = parseIncomes(wb.Sheets.Ingresos)
const expenses = parseExpenses(wb.Sheets.Gastos)
const { accountBalances, balanceHistory, debts, savedAccounts } = parseBalanceSheet(
  wb.Sheets.Balance
)

for (const inc of incomes) savedAccounts.add(inc.account)
for (const exp of expenses) savedAccounts.add(exp.paymentMethod)

const ibkrHoldings = parseIbkrHoldings(
  join(root, 'U25324597_20260101_20260626.csv')
)
const trHoldings = parseTradeRepublicHoldings(wb.Sheets.Inversiones)

const holdings = [...ibkrHoldings, ...trHoldings].map((h, i) => ({
  id: `hold-seed-${i + 1}`,
  ...h,
}))

const incomesWithIds = incomes.map((inc, i) => ({
  id: `inc-seed-${i + 1}`,
  ...inc,
}))

const expensesWithIds = expenses.map((exp, i) => ({
  id: `exp-seed-${i + 1}`,
  ...exp,
}))

const debtsWithIds = debts.map((d, i) => ({
  id: `debt-seed-${i + 1}`,
  ...d,
}))

const seed = {
  incomes: incomesWithIds,
  expenses: expensesWithIds,
  accountBalances: accountBalances.map((a, i) => ({
    account: a.account,
    amount: a.amount,
    currency: a.currency,
  })),
  savedAccounts: Array.from(savedAccounts).sort((a, b) => a.localeCompare(b, 'es')),
  debts: debtsWithIds,
  holdings,
  fixedIncome: [],
  balanceHistory,
  settings: {
    defaultCurrency: 'EUR',
    exchangeRates: { EUR: 1, USD: 1.08, ARS: 1200 },
    fiscalYear: 2026,
    projection: {
      initialCapital: 5000,
      monthlyContribution: 200,
      annualGrowthRate: 0.07,
      years: 10,
    },
  },
}

const out = `import type { FinanceData } from '@/types/finance'

/**
 * Datos de demostración generados desde Finanzaspersonales.xlsx y CSV IBKR.
 * Regenerar: node scripts/generate-seed.mjs
 * Los datos personales del CSV (nombre, cuenta, etc.) no se incluyen.
 */
export const seedData: FinanceData = ${JSON.stringify(seed, null, 2).replace(/"([^"]+)":/g, '$1:')}
`

writeFileSync(join(root, 'src/data/seed.ts'), out, 'utf8')

console.log('✓ seed.ts generado')
console.log(`  Ingresos: ${incomes.length}`)
console.log(`  Gastos: ${expenses.length}`)
console.log(`  Holdings IBKR: ${ibkrHoldings.length}`)
console.log(`  Holdings TradeRepublic: ${trHoldings.length}`)
console.log(`  Cuentas: ${accountBalances.length}`)
console.log(`  Historial: ${balanceHistory.length}`)