/**
 * Orquestación de ingresos/gastos: validación → Supabase (inmutable) → mappers.
 * Las correcciones anulan la fila original e insertan una nueva (patrón reversal).
 */
import {
  createTransaction,
  getActiveTransactions,
  reverseTransaction,
  TransactionError,
} from '@/lib/transactions'
import {
  expenseToCreateInput,
  incomeToCreateInput,
  splitTransactions,
  transactionToExpense,
  transactionToIncome,
} from '@/lib/mappers'
import {
  validateCreateTransactionInput,
  validateExpenseInput,
  validateIncomeInput,
  ValidationError,
} from '@/lib/validations'
import type { Transaction, TransactionFilters } from '@/types/database'
import type { Expense, Income } from '@/types/finance'

export { TransactionError, ValidationError }

export async function fetchActiveFinanceData(filters: TransactionFilters = {}) {
  const transactions = await getActiveTransactions(filters)
  return { transactions, ...splitTransactions(transactions) }
}

export async function addIncomeRecord(
  income: Omit<Income, 'id'>
): Promise<{ transaction: Transaction; income: Income }> {
  const validated = validateIncomeInput(income)
  const input = validateCreateTransactionInput(incomeToCreateInput(validated))
  const transaction = await createTransaction(input)
  return { transaction, income: transactionToIncome(transaction) }
}

export async function addExpenseRecord(
  expense: Omit<Expense, 'id'>
): Promise<{ transaction: Transaction; expense: Expense }> {
  const validated = validateExpenseInput(expense)
  const input = validateCreateTransactionInput(expenseToCreateInput(validated))
  const transaction = await createTransaction(input)
  return { transaction, expense: transactionToExpense(transaction) }
}

/**
 * Corrección inmutable: anula la transacción original e inserta la nueva.
 * Si la creación falla tras la anulación, se propaga el error para refetch.
 */
export async function correctIncomeRecord(
  id: string,
  income: Omit<Income, 'id'>
): Promise<{ transaction: Transaction; income: Income }> {
  const validated = validateIncomeInput(income)
  await reverseTransaction(id, 'Corrección de ingreso')
  const input = validateCreateTransactionInput(incomeToCreateInput(validated))
  const transaction = await createTransaction(input)
  return { transaction, income: transactionToIncome(transaction) }
}

export async function correctExpenseRecord(
  id: string,
  expense: Omit<Expense, 'id'>
): Promise<{ transaction: Transaction; expense: Expense }> {
  const validated = validateExpenseInput(expense)
  await reverseTransaction(id, 'Corrección de gasto')
  const input = validateCreateTransactionInput(expenseToCreateInput(validated))
  const transaction = await createTransaction(input)
  return { transaction, expense: transactionToExpense(transaction) }
}

export async function voidIncomeRecord(id: string): Promise<void> {
  await reverseTransaction(id, 'Eliminación de ingreso')
}

export async function voidExpenseRecord(id: string): Promise<void> {
  await reverseTransaction(id, 'Eliminación de gasto')
}