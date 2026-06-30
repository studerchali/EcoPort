import type { CreateTransactionInput } from '@/types/database'
import type { Expense, Income } from '@/types/finance'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

const MAX_AMOUNT = 99_999_999.99
const MAX_TEXT = 500

function assertDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Fecha inválida')
  }
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError('Fecha inválida')
  }
  const maxFuture = new Date()
  maxFuture.setFullYear(maxFuture.getFullYear() + 1)
  if (parsed > maxFuture) {
    throw new ValidationError('La fecha no puede ser más de un año en el futuro')
  }
}

function assertAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError('El monto debe ser mayor que 0')
  }
  if (amount > MAX_AMOUNT) {
    throw new ValidationError('El monto supera el límite permitido')
  }
}

function assertText(value: string, field: string, required = false): void {
  const trimmed = value.trim()
  if (required && !trimmed) {
    throw new ValidationError(`${field} es obligatorio`)
  }
  if (trimmed.length > MAX_TEXT) {
    throw new ValidationError(`${field} es demasiado largo`)
  }
}

export function validateIncomeInput(income: Omit<Income, 'id'>): Omit<Income, 'id'> {
  assertDate(income.date)
  assertAmount(income.amount)
  assertText(income.source, 'Fuente', true)
  assertText(income.notes, 'Notas')
  return {
    ...income,
    source: income.source.trim(),
    notes: income.notes.trim(),
  }
}

export function validateExpenseInput(expense: Omit<Expense, 'id'>): Omit<Expense, 'id'> {
  assertDate(expense.date)
  assertAmount(expense.amount)
  assertText(expense.detail, 'Detalle', true)
  assertText(expense.notes, 'Notas')
  return {
    ...expense,
    detail: expense.detail.trim(),
    notes: expense.notes.trim(),
  }
}

export function validateCreateTransactionInput(
  input: CreateTransactionInput
): CreateTransactionInput {
  assertDate(input.date)
  assertAmount(input.amount)
  assertText(input.category_name, 'Categoría', true)
  assertText(input.description ?? '', 'Descripción')
  return {
    ...input,
    category_name: input.category_name.trim(),
    description: (input.description ?? '').trim(),
  }
}