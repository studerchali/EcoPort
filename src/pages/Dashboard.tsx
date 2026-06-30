import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Tag,
  CreditCard,
  CalendarDays,
} from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { MonthlyChart } from '@/components/charts/MonthlyChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { BalanceTrendChart } from '@/components/charts/BalanceTrendChart'
import { AccountChart } from '@/components/charts/AccountChart'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { useTransactions } from '@/contexts/TransactionsContext'
import { usePrivacyFormat } from '@/hooks/usePrivacyFormat'
import { useFinanceStore } from '@/store/financeStore'
import { Skeleton } from '@/components/ui/skeleton'

export function Dashboard() {
  const { kpis, monthlyBalance, categories, trend, accounts, currentMonth } =
    useFinanceSelectors()
  const { loading } = useTransactions()
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const { formatMoney } = usePrivacyFormat()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen financiero {selectedYear}
        </p>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {currentMonth.monthName} {selectedYear}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Ingresos del mes"
            value={formatMoney(currentMonth.incomeEUR)}
            icon={TrendingUp}
            variant="income"
          />
          <KpiCard
            title="Gastos del mes"
            value={formatMoney(currentMonth.expenseEUR)}
            icon={TrendingDown}
            variant="expense"
          />
          <KpiCard
            title="Balance del mes"
            value={formatMoney(currentMonth.balanceEUR)}
            icon={Wallet}
            variant="balance"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Acumulado {selectedYear}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            title="Ingresos YTD"
            value={formatMoney(kpis.totalIncomeEUR)}
            icon={TrendingUp}
            variant="income"
          />
          <KpiCard
            title="Gastos YTD"
            value={formatMoney(kpis.totalExpenseEUR)}
            icon={TrendingDown}
            variant="expense"
          />
          <KpiCard
            title="Balance Neto"
            value={formatMoney(kpis.netBalanceEUR)}
            icon={Wallet}
            variant="balance"
          />
          <KpiCard
            title="Mayor categoría"
            value={kpis.biggestCategory ?? '—'}
            subtitle={
              kpis.biggestCategory
                ? formatMoney(kpis.biggestCategoryAmount)
                : undefined
            }
            maskValue={false}
            icon={Tag}
            variant="expense"
          />
          <KpiCard
            title="Deuda total"
            value={formatMoney(kpis.totalDebtEUR)}
            subtitle={`${kpis.activeAccounts} cuentas activas`}
            maskSubtitle={false}
            icon={CreditCard}
            variant="neutral"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyChart data={monthlyBalance} />
        <CategoryPieChart data={categories} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BalanceTrendChart data={trend} />
        <AccountChart data={accounts} />
      </div>
    </div>
  )
}