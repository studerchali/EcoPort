import type { InvestmentHolding } from '@/types/finance'

export type BrokerType = 'ibkr' | 'ibkr-activity' | 'unknown'
export type BrokerFormat = 'activity-statement' | 'open-positions' | 'unknown'

export interface ParsedHolding {
  ticker: string
  platform: string
  units: number
  avgPrice: number
  currentPrice: number
}

export interface BrokerParseResult {
  broker: BrokerType
  format: BrokerFormat
  holdings: ParsedHolding[]
  filteredColumns: string[]
  warnings: string[]
}

const SENSITIVE_ACCOUNT_FIELDS = [
  'nombre',
  'cuenta',
  'account',
  'client name',
  'email',
  'address',
  'phone',
  'tax id',
  'ssn',
]

const POSITION_SECTIONS = ['posiciones abiertas', 'open positions']

const SYMBOL_ALIASES = [
  'symbol',
  'símbolo',
  'simbolo',
  'financial instrument',
  'instrument',
  'ticker',
]
const UNITS_ALIASES = ['quantity', 'cantidad', 'position', 'shares', 'units', 'qty']
const AVG_PRICE_ALIASES = [
  'precio de coste',
  'cost basis price',
  'cost price',
  'avg price',
  'average price',
  'average cost',
  'cost per share',
]
const CURRENT_PRICE_ALIASES = [
  'precio de cierre',
  'close price',
  'market price',
  'last price',
  'current price',
  'mark price',
]
const ASSET_CATEGORY_ALIASES = [
  'categoría de activo',
  'categoria de activo',
  'asset category',
  'asset class',
]

const SKIP_ASSET_CATEGORIES = ['forex', 'fórex', 'cash', 'efectivo', 'total']

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/"/g, '')
    .replace(/\ufeff/g, '')
    .trim()
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  const normalized = headers.map(normalizeHeader)
  for (const alias of aliases) {
    const idx = normalized.findIndex((h) => h === alias || h.includes(alias))
    if (idx >= 0) return idx
  }
  return -1
}

function parseNumber(val: string): number {
  const cleaned = val.replace(/"/g, '').replace(/,/g, '').replace(/[^\d.-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

function isActivityStatement(lines: string[]): boolean {
  const first = normalizeHeader(lines[0]?.split(',')[0] ?? '')
  if (first === 'statement') return true
  return lines.some((l) => {
    const section = normalizeHeader(parseCSVLine(l)[0] ?? '')
    return POSITION_SECTIONS.includes(section)
  })
}

function collectFilteredSensitiveFields(lines: string[]): string[] {
  const filtered: string[] = []

  for (const line of lines) {
    const row = parseCSVLine(line)
    const section = normalizeHeader(row[0] ?? '')

    if (
      section.includes('información sobre la cuenta') ||
      section.includes('account information')
    ) {
      const fieldName = normalizeHeader(row[2] ?? '')
      if (
        fieldName !== 'nombre del campo' &&
        SENSITIVE_ACCOUNT_FIELDS.some((f) => fieldName.includes(f))
      ) {
        const label = row[2]?.trim()
        if (label && !filtered.includes(label)) filtered.push(label)
      }
    }

    if (section === 'statement' && row[1] === 'Data') {
      const fieldName = normalizeHeader(row[2] ?? '')
      if (fieldName.includes('brokeraddress') || fieldName.includes('whengenerated')) {
        const label = row[2]?.trim()
        if (label && !filtered.includes(label)) filtered.push(label)
      }
    }
  }

  return filtered
}

function parseActivityStatement(lines: string[]): BrokerParseResult {
  const filteredColumns = collectFilteredSensitiveFields(lines)
  const warnings: string[] = [
    'Formato: Informe de actividad IBKR (sección Posiciones abiertas)',
    'Datos personales del informe (nombre, cuenta, etc.) no se importan',
  ]

  if (filteredColumns.length > 0) {
    warnings.push(`Campos filtrados: ${filteredColumns.join(', ')}`)
  }

  const holdings: ParsedHolding[] = []
  let sectionHeaders: string[] = []
  let inPositionsSection = false

  for (const line of lines) {
    const row = parseCSVLine(line)
    const section = normalizeHeader(row[0] ?? '')
    const rowType = row[1] ?? ''

    if (!POSITION_SECTIONS.includes(section)) {
      if (inPositionsSection && rowType !== 'Data') {
        inPositionsSection = false
      }
      continue
    }

    if (rowType === 'Header') {
      inPositionsSection = true
      sectionHeaders = row.slice(2)
      continue
    }

    if (rowType === 'Total' || rowType === 'SubTotal') {
      if (rowType === 'Total') inPositionsSection = false
      continue
    }

    if (rowType !== 'Data' || !inPositionsSection) continue

    const dataRow = row.slice(2)
    const symbolIdx = findColumnIndex(sectionHeaders, SYMBOL_ALIASES)
    const unitsIdx = findColumnIndex(sectionHeaders, UNITS_ALIASES)
    const avgIdx = findColumnIndex(sectionHeaders, AVG_PRICE_ALIASES)
    const currentIdx = findColumnIndex(sectionHeaders, CURRENT_PRICE_ALIASES)
    const categoryIdx = findColumnIndex(sectionHeaders, ASSET_CATEGORY_ALIASES)

    if (symbolIdx < 0 || unitsIdx < 0) continue

    const ticker = dataRow[symbolIdx]?.replace(/"/g, '').trim()
    const units = parseNumber(dataRow[unitsIdx] ?? '0')
    const assetCategory =
      categoryIdx >= 0
        ? normalizeHeader(dataRow[categoryIdx] ?? '')
        : 'acciones'

    if (!ticker || units === 0) continue
    if (SKIP_ASSET_CATEGORIES.some((c) => assetCategory.includes(c))) continue
    if (ticker === 'USD' || ticker === 'EUR') continue

    const avgPrice = avgIdx >= 0 ? parseNumber(dataRow[avgIdx] ?? '0') : 0
    const currentPrice =
      currentIdx >= 0 ? parseNumber(dataRow[currentIdx] ?? '0') : avgPrice

    holdings.push({
      ticker,
      platform: 'IBKR',
      units,
      avgPrice: avgPrice || currentPrice,
      currentPrice: currentPrice || avgPrice,
    })
  }

  if (holdings.length === 0) {
    warnings.push(
      'No se encontraron posiciones en la sección Posiciones abiertas.'
    )
  }

  return {
    broker: 'ibkr-activity',
    format: 'activity-statement',
    holdings,
    filteredColumns,
    warnings,
  }
}

function detectFlatBroker(headers: string[]): BrokerType {
  const joined = headers.map(normalizeHeader).join('|')
  if (
    joined.includes('symbol') ||
    joined.includes('símbolo') ||
    joined.includes('simbolo') ||
    joined.includes('financial instrument') ||
    joined.includes('cost basis') ||
    joined.includes('precio de coste')
  ) {
    return 'ibkr'
  }
  return 'unknown'
}

function parseFlatOpenPositions(lines: string[]): BrokerParseResult {
  let headerIdx = 0
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const lower = lines[i].toLowerCase()
    if (
      lower.includes('symbol') ||
      lower.includes('símbolo') ||
      lower.includes('simbolo') ||
      lower.includes('financial instrument') ||
      lower.includes('cantidad') ||
      lower.includes('quantity')
    ) {
      headerIdx = i
      break
    }
  }

  const headers = parseCSVLine(lines[headerIdx])
  const broker = detectFlatBroker(headers)
  const warnings: string[] = []

  const filteredColumns = headers.filter((h) => {
    const n = normalizeHeader(h)
    return (
      n.includes('account') ||
      n.includes('cuenta') ||
      n.includes('client') ||
      n.includes('email')
    )
  })

  if (broker === 'unknown') {
    warnings.push(
      'Formato no reconocido. Use un Informe de actividad IBKR o export Open Positions.'
    )
    return { broker, format: 'unknown', holdings: [], filteredColumns, warnings }
  }

  const symbolIdx = findColumnIndex(headers, SYMBOL_ALIASES)
  const unitsIdx = findColumnIndex(headers, UNITS_ALIASES)
  const avgIdx = findColumnIndex(headers, AVG_PRICE_ALIASES)
  const currentIdx = findColumnIndex(headers, CURRENT_PRICE_ALIASES)

  if (symbolIdx < 0 || unitsIdx < 0) {
    warnings.push(
      'No se encontraron columnas Símbolo/Cantidad en el CSV.'
    )
    return { broker, format: 'open-positions', holdings: [], filteredColumns, warnings }
  }

  if (filteredColumns.length > 0) {
    warnings.push(`Columnas sensibles ignoradas: ${filteredColumns.join(', ')}`)
  }

  const holdings: ParsedHolding[] = []

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    if (row.length < 2) continue

    const ticker = row[symbolIdx]?.replace(/"/g, '').trim()
    const units = parseNumber(row[unitsIdx] ?? '0')

    if (!ticker || units === 0) continue

    const avgPrice = avgIdx >= 0 ? parseNumber(row[avgIdx] ?? '0') : 0
    const currentPrice =
      currentIdx >= 0 ? parseNumber(row[currentIdx] ?? '0') : avgPrice

    holdings.push({
      ticker,
      platform: 'IBKR',
      units,
      avgPrice: avgPrice || currentPrice,
      currentPrice: currentPrice || avgPrice,
    })
  }

  if (holdings.length === 0) {
    warnings.push('No se encontraron posiciones válidas en el archivo.')
  } else {
    warnings.unshift('Formato: Open Positions CSV (tabla plana)')
  }

  return {
    broker,
    format: 'open-positions',
    holdings,
    filteredColumns,
    warnings,
  }
}

export function parseBrokerCsv(content: string): BrokerParseResult {
  const cleaned = content.replace(/^\ufeff/, '')
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return {
      broker: 'unknown',
      format: 'unknown',
      holdings: [],
      filteredColumns: [],
      warnings: ['El archivo está vacío o no tiene filas de datos'],
    }
  }

  if (isActivityStatement(lines)) {
    return parseActivityStatement(lines)
  }

  return parseFlatOpenPositions(lines)
}

export function toInvestmentHoldings(
  parsed: ParsedHolding[]
): Omit<InvestmentHolding, 'id'>[] {
  return parsed.map((p) => ({
    ticker: p.ticker,
    platform: p.platform,
    units: p.units,
    avgPrice: p.avgPrice,
    currentPrice: p.currentPrice,
  }))
}