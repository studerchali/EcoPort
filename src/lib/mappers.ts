import type { CreateTransactionInput, Transaction } from '@/types/database'
import type {
  AccountName,
  Currency,
  Expense,
  ExpenseCategory,
  Income,
} from '@/types/finance'
import { ACCOUNTS, EXPENSE_CATEGORIES } from '@/types/finance'

export function toAccountName(account: string | null | undefined): AccountName {
  if (account && ACCOUNTS.includes(account as AccountName)) {
    return account as AccountName
  }
  return 'Efectivo'
}

export function toExpenseCategory(name: string): ExpenseCategory {
  if (EXPENSE_CATEGORIES.includes(name as ExpenseCategory)) {
    return name as ExpenseCategory
  }
  return 'Otro'
}

export function transactionToIncome(tx: Transaction): Income {
  const notes =
    typeof tx.metadata === 'object' &&
    tx.metadata !== null &&
    'notes' in tx.metadata &&
    typeof tx.metadata.notes === 'string'
      ? tx.metadata.notes
      : ''

  return {
    id: tx.id,
    date: tx.date,
    source: tx.category_name,
    amount: tx.amount,
    currency: tx.currency as Currency,
    account: toAccountName(tx.account),
    notes: notes || tx.description,
  }
}

export function transactionToExpense(tx: Transaction): Expense {
  const notes =
    typeof tx.metadata === 'object' &&
    tx.metadata !== null &&
    'notes' in tx.metadata &&
    typeof tx.metadata.notes === 'string'
      ? tx.metadata.notes
      : ''

  return {
    id: tx.id,
    date: tx.date,
    category: toExpenseCategory(tx.category_name),
    detail: tx.description,
    amount: tx.amount,
    currency: tx.currency as Currency,
    paymentMethod: toAccountName(tx.account),
    notes,
  }
}

export function splitTransactions(transactions: Transaction[]): {
  incomes: Income[]
  expenses: Expense[]
} {
  const incomes: Income[] = []
  const expenses: Expense[] = []

  for (const tx of transactions) {
    if (tx.type === 'income') incomes.push(transactionToIncome(tx))
    else expenses.push(transactionToExpense(tx))
  }

  return { incomes, expenses }
}

export function incomeToCreateInput(
  income: Omit<Income, 'id'>
): CreateTransactionInput {
  return {
    type: 'income',
    amount: income.amount,
    currency: income.currency,
    category_name: income.source,
    date: income.date,
    description: income.notes || income.source,
    account: income.account,
    metadata: { notes: income.notes },
  }
}

export function expenseToCreateInput(
  expense: Omit<Expense, 'id'>
): CreateTransactionInput {
  return {
    type: 'expense',
    amount: expense.amount,
    currency: expense.currency,
    category_name: expense.category,
    date: expense.date,
    description: expense.detail,
    account: expense.paymentMethod,
    metadata: { notes: expense.notes },
  }
}

export interface UnifiedTransaction {
  id: string
  type: 'income' | 'expense'
  date: string
  label: string
  category: string
  amount: number
  currency: Currency
  account: AccountName
  description: string
  notes: string
}

export function toUnifiedTransaction(tx: Transaction): UnifiedTransaction {
  if (tx.type === 'income') {
    const inc = transactionToIncome(tx)
    return {
      id: tx.id,
      type: 'income',
      date: inc.date,
      label: inc.source,
      category: inc.source,
      amount: inc.amount,
      currency: inc.currency,
      account: inc.account,
      description: inc.source,
      notes: inc.notes,
    }
  }

  const exp = transactionToExpense(tx)
  return {
    id: tx.id,
    type: 'expense',
    date: exp.date,
    label: exp.detail,
    category: exp.category,
    amount: exp.amount,
    currency: exp.currency,
    account: exp.paymentMethod,
    description: exp.detail,
    notes: exp.notes,
  }
}