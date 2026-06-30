import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CurrencyAmount } from '@/components/shared/CurrencyAmount'
import { useState } from 'react'
import { BalanceSectionNav } from '@/components/balance/BalanceSectionNav'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { useFinanceStore } from '@/store/financeStore'
import { formatDate } from '@/lib/format'
import { usePrivacyFormat } from '@/hooks/usePrivacyFormat'
import { HIDDEN_NUMBER } from '@/lib/format'
import { cn } from '@/lib/utils'

const sectionTitles: Record<string, string> = {
  mensual: 'Resumen mensual',
  cuentas: 'Saldos por cuenta',
  deuda: 'Deudas y posición neta',
  historico: 'Evolución histórica',
}

export function BalancePage() {
  const [section, setSection] = useState('mensual')
  const { monthlyBalance, computedAccounts, kpis } = useFinanceSelectors()
  const debts = useFinanceStore((s) => s.debts)
  const balanceHistory = useFinanceStore((s) => s.balanceHistory)
  const selectedYear = useFinanceStore((s) => s.selectedYear)
  const { hideSensitiveData, formatMoney, formatShare } = usePrivacyFormat()

  const totalDebt = debts.reduce((s, d) => s + d.amount, 0)
  const totalBalance = computedAccounts.reduce((s, a) => s + a.computedEUR, 0)
  const netPosition = totalBalance - totalDebt

  const historyChart = balanceHistory.map((h) => ({
    date: formatDate(h.date),
    balanceEUR: h.balanceEUR,
    deudaEUR: h.debtEUR,
    balanceUSD: h.balanceUSD,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Balance</h2>
        <p className="text-muted-foreground">
          Resúmenes y saldos — {selectedYear}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Balance YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyAmount amount={kpis.netBalanceEUR} variant="balance" className="text-2xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total cuentas</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyAmount amount={totalBalance} variant="neutral" className="text-2xl" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Posición neta</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyAmount amount={netPosition} variant="balance" className="text-2xl" />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <Tabs
          value={section}
          onValueChange={setSection}
          className="flex w-full flex-col gap-0"
        >
          <CardHeader className="space-y-3 border-b bg-muted/20 pb-4">
            <BalanceSectionNav value={section} onChange={setSection} />
            <p className="text-sm font-medium text-foreground">
              {sectionTitles[section]}
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <TabsContent value="mensual" className="m-0 outline-none">
              <div className="overflow-x-auto p-4 sm:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead className="text-right">Ingresos EUR</TableHead>
                      <TableHead className="text-right">Gastos EUR</TableHead>
                      <TableHead className="text-right">Balance EUR</TableHead>
                      <TableHead className="text-right">Ingresos USD</TableHead>
                      <TableHead className="text-right">Gastos USD</TableHead>
                      <TableHead className="text-right">Balance USD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyBalance.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">
                          {row.incomeEUR > 0 ? (
                            <CurrencyAmount amount={row.incomeEUR} variant="income" />
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.expenseEUR > 0 ? (
                            <CurrencyAmount amount={row.expenseEUR} variant="expense" />
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyAmount amount={row.balanceEUR} variant="balance" />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {row.incomeUSD > 0 ? formatMoney(row.incomeUSD, 'USD') : '—'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {row.expenseUSD > 0 ? formatMoney(row.expenseUSD, 'USD') : '—'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatMoney(row.balanceUSD, 'USD')}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>Total {selectedYear}</TableCell>
                      <TableCell className="text-right">
                        <CurrencyAmount amount={kpis.totalIncomeEUR} variant="income" />
                      </TableCell>
                      <TableCell className="text-right">
                        <CurrencyAmount amount={kpis.totalExpenseEUR} variant="expense" />
                      </TableCell>
                      <TableCell className="text-right">
                        <CurrencyAmount amount={kpis.netBalanceEUR} variant="balance" />
                      </TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="cuentas" className="m-0 outline-none">
              <div className="overflow-x-auto p-4 sm:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo base</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead className="text-right">Saldo calculado (EUR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {computedAccounts.map((acc) => (
                      <TableRow key={acc.account}>
                        <TableCell className="font-medium">{acc.account}</TableCell>
                        <TableCell className="text-right">
                          {formatMoney(acc.amount, acc.currency)}
                        </TableCell>
                        <TableCell>{acc.currency}</TableCell>
                        <TableCell className="text-right">
                          <CurrencyAmount
                            amount={acc.computedEUR}
                            variant={acc.computedEUR >= 0 ? 'income' : 'expense'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="deuda" className="m-0 outline-none">
              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                <div className="rounded-lg border bg-card">
                  <div className="border-b px-4 py-3">
                    <h3 className="text-sm font-semibold">Deudas pendientes</h3>
                  </div>
                  <div className="overflow-x-auto p-4 pt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {debts.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.name}</TableCell>
                            <TableCell className="text-right">
                              <CurrencyAmount amount={d.amount} currency={d.currency} variant="expense" />
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                          <TableCell>Total deuda</TableCell>
                          <TableCell className="text-right">
                            <CurrencyAmount amount={totalDebt} variant="expense" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="rounded-lg border bg-card">
                  <div className="border-b px-4 py-3">
                    <h3 className="text-sm font-semibold">Balance vs Deuda</h3>
                  </div>
                  <div className="space-y-4 p-4">
                    <div className="flex justify-between">
                      <span>Balance total</span>
                      <CurrencyAmount amount={totalBalance} variant="income" />
                    </div>
                    <div className="flex justify-between">
                      <span>Deuda total</span>
                      <CurrencyAmount amount={totalDebt} variant="expense" />
                    </div>
                    <div className={cn('flex justify-between border-t pt-4 font-semibold')}>
                      <span>Posición neta</span>
                      <CurrencyAmount amount={netPosition} variant="balance" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="historico" className="m-0 outline-none">
              <div className="p-4 sm:p-6">
                {historyChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={historyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={
                          hideSensitiveData ? () => HIDDEN_NUMBER : (v) => formatMoney(Number(v))
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          const num = Number(value)
                          if (hideSensitiveData) {
                            const max = Math.max(
                              ...historyChart.flatMap((h) => [
                                h.balanceEUR,
                                h.deudaEUR,
                                h.balanceUSD,
                              ])
                            )
                            return formatShare(Math.abs(num), max || 1)
                          }
                          return formatMoney(num, name === 'Balance USD' ? 'USD' : 'EUR')
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="balanceEUR" name="Balance EUR" stroke="hsl(142 76% 36%)" />
                      <Line type="monotone" dataKey="deudaEUR" name="Deuda EUR" stroke="hsl(0 72% 51%)" />
                      <Line type="monotone" dataKey="balanceUSD" name="Balance USD" stroke="hsl(220 60% 45%)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-muted-foreground">
                    Sin datos históricos
                  </p>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}