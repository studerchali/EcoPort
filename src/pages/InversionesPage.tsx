import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurrencyAmount } from '@/components/shared/CurrencyAmount'
import { useFinanceSelectors } from '@/hooks/useFinanceSelectors'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency, formatPercent } from '@/lib/format'
import { projectFutureValue } from '@/lib/calculations'
import { BrokerCsvImport } from '@/components/inversiones/BrokerCsvImport'
import { cn } from '@/lib/utils'

export function InversionesPage() {
  const {
    holdingMetrics,
    totalInvested,
    totalCurrentValue,
    passiveIncome,
    settings,
  } = useFinanceSelectors()
  const fixedIncome = useFinanceStore((s) => s.fixedIncome)
  const updateSettings = useFinanceStore((s) => s.updateSettings)

  const [proj, setProj] = useState(settings.projection)
  const projected = projectFutureValue(
    proj.initialCapital,
    proj.monthlyContribution,
    proj.annualGrowthRate,
    proj.years
  )

  const totalPL = totalCurrentValue - totalInvested
  const totalPLPct = totalInvested > 0 ? totalPL / totalInvested : 0

  const updateProj = (field: keyof typeof proj, value: number) => {
    const next = { ...proj, [field]: value }
    setProj(next)
    updateSettings({ projection: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Inversiones</h2>
        <p className="text-muted-foreground">Portfolio y proyecciones</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Patrimonio invertido</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{formatCurrency(totalInvested, 'USD')}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor actual</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{formatCurrency(totalCurrentValue, 'USD')}</span>
            <p className={cn('text-sm', totalPL >= 0 ? 'text-income' : 'text-expense')}>
              {totalPL >= 0 ? '+' : ''}{formatCurrency(totalPL, 'USD')} ({formatPercent(totalPLPct)})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rendimiento pasivo anual</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{formatCurrency(passiveIncome, 'USD')}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">ETFs y Acciones (Renta Variable)</CardTitle>
          <BrokerCsvImport />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Precio medio</TableHead>
                <TableHead className="text-right">Capital</TableHead>
                <TableHead className="text-right">Precio actual</TableHead>
                <TableHead className="text-right">Valor actual</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                <TableHead className="text-right">P/L %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdingMetrics.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.ticker}</TableCell>
                  <TableCell>{h.platform}</TableCell>
                  <TableCell className="text-right">{h.units.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.avgPrice, 'USD')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.invested, 'USD')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.currentPrice, 'USD')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.currentValue, 'USD')}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyAmount
                      amount={h.profitLoss}
                      currency="USD"
                      variant={h.profitLoss >= 0 ? 'income' : 'expense'}
                    />
                  </TableCell>
                  <TableCell className={cn('text-right font-medium', h.profitLossPct >= 0 ? 'text-income' : 'text-expense')}>
                    {formatPercent(h.profitLossPct)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={4}>TOTAL RENTA VARIABLE</TableCell>
                <TableCell className="text-right">{formatCurrency(totalInvested, 'USD')}</TableCell>
                <TableCell />
                <TableCell className="text-right">{formatCurrency(totalCurrentValue, 'USD')}</TableCell>
                <TableCell className="text-right">
                  <CurrencyAmount amount={totalPL} currency="USD" variant={totalPL >= 0 ? 'income' : 'expense'} />
                </TableCell>
                <TableCell className="text-right">{formatPercent(totalPLPct)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuentas remuneradas y Renta Fija</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuenta / Banco</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Capital</TableHead>
                <TableHead className="text-right">TAE %</TableHead>
                <TableHead className="text-right">Interés anual</TableHead>
                <TableHead className="text-right">Interés mensual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedIncome.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.bank}</TableCell>
                  <TableCell>{f.type}</TableCell>
                  <TableCell className="text-right">{formatCurrency(f.capital, 'USD')}</TableCell>
                  <TableCell className="text-right">{formatPercent(f.annualRate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(f.capital * f.annualRate, 'USD')}</TableCell>
                  <TableCell className="text-right">{formatCurrency((f.capital * f.annualRate) / 12, 'USD')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calculadora de proyección (interés compuesto)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Capital inicial</Label>
              <Input
                type="number"
                value={proj.initialCapital}
                onChange={(e) => updateProj('initialCapital', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Aportación mensual (DCA)</Label>
              <Input
                type="number"
                value={proj.monthlyContribution}
                onChange={(e) => updateProj('monthlyContribution', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tasa anual esperada</Label>
              <Input
                type="number"
                step="0.01"
                value={proj.annualGrowthRate * 100}
                onChange={(e) => updateProj('annualGrowthRate', (parseFloat(e.target.value) || 0) / 100)}
              />
            </div>
            <div className="space-y-2">
              <Label>Años de inversión</Label>
              <Input
                type="number"
                value={proj.years}
                onChange={(e) => updateProj('years', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">Valor futuro proyectado</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(projected, 'USD')}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              en {proj.years} años con {formatPercent(proj.annualGrowthRate)} anual
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}