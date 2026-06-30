import type { ExpenseCategory, IncomeSource } from '@/types/finance'
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '@/types/finance'

/** Categorías del Excel original → categorías genéricas de la app. */
export const LEGACY_EXPENSE_CATEGORY_MAP: Record<string, ExpenseCategory> = {
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

/** Fuentes del Excel original → fuentes genéricas de la app. */
export const LEGACY_INCOME_SOURCE_MAP: Record<string, IncomeSource> = {
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

export function mapExpenseCategory(name: string): ExpenseCategory {
  const trimmed = name.trim()
  if (EXPENSE_CATEGORIES.includes(trimmed as ExpenseCategory)) {
    return trimmed as ExpenseCategory
  }
  return LEGACY_EXPENSE_CATEGORY_MAP[trimmed] ?? 'Otro'
}

export function mapIncomeSource(name: string): string {
  const trimmed = name.trim()
  if (INCOME_SOURCES.includes(trimmed as IncomeSource)) {
    return trimmed
  }
  return LEGACY_INCOME_SOURCE_MAP[trimmed] ?? (trimmed || 'Otro')
}