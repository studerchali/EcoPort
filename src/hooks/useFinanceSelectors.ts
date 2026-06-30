import { useMemo } from 'react'
import { useTransactions } from '@/contexts/TransactionsContext'
import { useInvestments } from '@/contexts/InvestmentsContext'
import { useFinanceStore } from '@/store/financeStore'
import {
  monthlyIncomeExpenseBalance,
  accountTotals,
  expensesByCategory,
  ytdKpis,
  balanceTrend,
  investmentMetrics,
  totalInvested,
  totalCurrentValue,
  fixedIncomeAnnualInterest,
  computeAccountBalances,
  projectFutureValue,
  monthSummary,
  displayMonthIndex,
} from '@/lib/calculations'

export function useFinanceSelectors() {
  const { incomes, expenses } = useTransactions()
  const { holdings } = useInvestments()
  const debts = useFinanceStore((s) => s.debts)
  const fixedIncome = useFinanceStore((s) => s.fixedIncome)
  const accountBalances = useFinanceStore((s) => s.accountBalances)
  const balanceHistory = useFinanceStore((s) => s.balanceHistory)
  const settings = useFinanceStore((s) => s.settings)
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const rates = settings.exchangeRates

  return useMemo(() => {
    const monthIdx = displayMonthIndex(selectedYear)
    return {
      monthlyBalance: monthlyIncomeExpenseBalance(
        incomes,
        expenses,
        selectedYear,
        rates
      ),
      currentMonth: monthSummary(
        incomes,
        expenses,
        monthIdx,
        selectedYear,
        rates
      ),
      accounts: accountTotals(incomes, expenses, selectedYear, rates),
      categories: expensesByCategory(expenses, selectedYear, rates),
      kpis: ytdKpis(incomes, expenses, debts, selectedYear, rates),
      trend: balanceTrend(incomes, expenses, selectedYear, rates),
      holdingMetrics: investmentMetrics(holdings),
      totalInvested: totalInvested(holdings),
      totalCurrentValue: totalCurrentValue(holdings),
      passiveIncome: fixedIncomeAnnualInterest(fixedIncome),
      computedAccounts: computeAccountBalances(
        accountBalances,
        incomes,
        expenses,
        rates
      ),
      projectedValue: projectFutureValue(
        settings.projection.initialCapital,
        settings.projection.monthlyContribution,
        settings.projection.annualGrowthRate,
        settings.projection.years
      ),
      balanceHistory,
      settings,
      selectedYear,
      rates,
    }
  }, [
    incomes,
    expenses,
    holdings,
    debts,
    fixedIncome,
    accountBalances,
    balanceHistory,
    settings,
    selectedYear,
    rates,
  ])
}