import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Tag,
  CreditCard,
} from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { MonthlyChart } from '@/components/charts/MonthlyChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { BalanceTrendChart } from '@/components/charts/BalanceTrendChart'
import { AccountChart } from '@/components/charts/AccountChart'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { formatCurrency } from '@/lib/format'
import { useFinanceStore } from '@/store/financeStore'

export function Dashboard() {
  const { kpis, monthlyBalance, categories, trend, accounts } =
    useFinanceSelectors()
  const selectedYear = useFinanceStore((s) => s.selectedYear)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen financiero {selectedYear}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Ingresos YTD"
          value={formatCurrency(kpis.totalIncomeEUR)}
          icon={TrendingUp}
          variant="income"
        />
        <KpiCard
          title="Gastos YTD"
          value={formatCurrency(kpis.totalExpenseEUR)}
          icon={TrendingDown}
          variant="expense"
        />
        <KpiCard
          title="Balance Neto"
          value={formatCurrency(kpis.netBalanceEUR)}
          icon={Wallet}
          variant="balance"
        />
        <KpiCard
          title="Mayor categoría"
          value={kpis.biggestCategory ?? '—'}
          subtitle={
            kpis.biggestCategory
              ? formatCurrency(kpis.biggestCategoryAmount)
              : undefined
          }
          icon={Tag}
          variant="expense"
        />
        <KpiCard
          title="Deuda total"
          value={formatCurrency(kpis.totalDebtEUR)}
          subtitle={`${kpis.activeAccounts} cuentas activas`}
          icon={CreditCard}
          variant="neutral"
        />
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